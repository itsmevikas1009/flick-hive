import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // Find the video by ID
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the user has already liked the video
    const like = await Like.findOne({ video: video._id, likedBy: req.user._id });
    if (!like) {
        // If not liked, create a new like
        const newLike = new Like({ video: video._id, likedBy: req.user._id });
        await newLike.save();
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, "Video liked"));
    }

    // If already liked, remove the like
    await Like.findByIdAndDelete(like._id);
    return res.status(204).send();
});

// Function to toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate comment ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if the user has already liked the comment
    const like = await Like.findOne({ comment: comment._id, likedBy: req.user._id });
    if (!like) {
        // If not liked, create a new like
        const newLike = new Like({ comment: comment._id, likedBy: req.user._id });
        await newLike.save();
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, "Comment liked"));
    }

    // If already liked, remove the like
    await Like.findByIdAndDelete(like._id);
    return res.status(204).send();
});

// Function to toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the user has already liked the tweet
    const like = await Like.findOne({ tweet: tweet._id, likedBy: req.user._id });
    if (!like) {
        // If not liked, create a new like
        const newLike = new Like({ tweet: tweet._id, likedBy: req.user._id });
        await newLike.save();
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, "Tweet liked"));
    }

    // If already liked, remove the like
    await Like.findByIdAndDelete(like._id);
    return res.status(204).send();
});

// Function to get all liked videos of the user
const getLikedVideos = asyncHandler(async (req, res) => {
    // Aggregate liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video'
            }
        },
        {
            $unwind: "$video"
        },
    ]);

    // Check if there are no liked videos
    if (!likedVideos.length) {
        throw new ApiError(404, "No liked videos found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
});

// Export the functions
export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};