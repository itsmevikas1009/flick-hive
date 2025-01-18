// Import necessary modules and utilities
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    // Destructure query parameters from the request
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;

    // Initialize an empty filter object to build query conditions
    const filter = {};

    // Add a filter for videos owned by a specific user (if userId is provided)
    if (userId) {
        filter.owner = new mongoose.Types.ObjectId(userId); // Convert userId to MongoDB ObjectId
    }

    // Add a search filter for videos matching the query in title or description (if query is provided)
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } }, // Case-insensitive regex search on title
            { description: { $regex: query, $options: 'i' } }, // Case-insensitive regex search on description
        ];
    }

    // Build the aggregation pipeline to process the query
    const pipeline = [
        // Stage 1: Match documents based on the filter conditions
        {
            $match: filter,
        },
        // Stage 2: Sort documents dynamically based on sortBy and sortType
        {
            $sort: {
                [sortBy]: sortType === 'asc' ? 1 : -1, // 1 for ascending, -1 for descending
            },
        },
        // Stage 3: Skip documents for pagination
        {
            $skip: skip,
        },
        // Stage 4: Limit the number of documents returned per page
        {
            $limit: parseInt(limit),
        },
    ];

    // Execute the aggregation pipeline to retrieve videos
    const videos = await Video.aggregate(pipeline);

    // Get the total count of matching documents for pagination metadata
    const totalCount = await Video.countDocuments(filter);

    // Return a success response with the retrieved videos and pagination details
    return res.status(200).json(
        new ApiResponse(
            200, // HTTP status code
            {
                data: videos, // Retrieved videos
                totalCount: totalCount, // Total number of matching documents
                skip: skip, // Number of documents skipped
                limit: limit, // Number of documents per page
            },
            "Videos retrieved successfully" // Success message
        )
    );
});

// Define the publishAVideo function to handle video uploads
const publishAVideo = asyncHandler(async (req, res) => {
    // Extract title and description from the request body
    const { title, description } = req.body;

    // Check if title or description is missing, and throw an error if so
    if (!title || !description) {
        throw new ApiError(400, 'Missing required fields');
    }

    // Extract the local paths of the uploaded video file and thumbnail from the request
    const videoFileLocalPath = req?.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

    // Check if either the video file or thumbnail is missing, and throw an error if so
    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, 'Missing video file or thumbnail');
    }

    // Upload the video file and thumbnail to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // Get the duration of the uploaded video file
    const duration = videoFile.duration;

    // Save video details to the database
    const video = await Video.create({
        videoFile,
        thumbnail,
        title,
        description,
        duration,
        owner: req.user._id
    });

    // Check if video creation failed, and throw an error if so
    if (!video) {
        throw new ApiError(500, 'Video upload failed');
    }

    video.isPublished = true;
    await video.save();

    // Return a successful response with the video details
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                video,
                'Video uploaded successfully'
            )
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId).populate('owner', 'username fullName');

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            'Video retrieved successfully'
        )
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to perform this action');
    }

    // Update video details
    video.title = req.body.title || video.title;
    video.description = req.body.description || video.description;

    if (req.file) {
        const thumbnail = await uploadOnCloudinary(req.file.path);
        const isDeleted = await deleteFromCloudinary(video.thumbnail.public_id);
        if (!isDeleted) {
            throw new ApiError(500, 'Failed to delete previous thumbnail');
        }
        video.thumbnail = thumbnail;
    }

    const updatedVideo = await video.save();

    if (!updatedVideo) {
        throw new ApiError(500, 'Video update failed');
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            'Video updated successfully'
        )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    // Check if the video owner is the same as the authenticated user
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to perform this action');
    }

    // Delete video from cloudinary
    const isVideoFileDeleted = await deleteFromCloudinary(video?.videoFile?.public_id, { resource_type: 'video' });
    const isThumbnailDeleted = await deleteFromCloudinary(video?.thumbnail?.public_id, { resource_type: 'image' });

    if (!isVideoFileDeleted || !isThumbnailDeleted) {
        throw new ApiError(500, 'Failed to delete video file or thumbnail');
    }

    // Delete the video from the database
    await Video.deleteOne({ _id: video._id });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            'Video deleted successfully'
        )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Check if the video owner is the same as the authenticated user
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to perform this action');
    }

    // Toggle the publish status of the video
    video.isPublished = !video.isPublished;
    const publishVideoStatus = await video.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isPublished: publishVideoStatus.isPublished
            },
            'Video publish status toggled successfully'
        )
    );
});

// Export the uploadVideo function
export {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo
};