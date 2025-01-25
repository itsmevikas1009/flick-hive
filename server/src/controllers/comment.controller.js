import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to get comments for a specific video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Aggregate comments for the video
    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                "owner.password": 0,
                "owner.email": 0,
                "owner.refreshToken": 0,
            }
        }
    ]);

    // Get the total count of comments for pagination
    const totalCount = await Comment.countDocuments({ video: videoId });

    // Return a successful response with the comments and total count
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { comments, totalCount },
                "Comments retrieved successfully"
            )
        );
});

// Function to add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // Check if the comment content is provided
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const { videoId } = req.params;

    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const { user } = req;

    // Check if the user is authenticated
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    // Create a new comment
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: user.id
    });

    // Check if the comment creation failed
    if (!comment) {
        throw new ApiError(500, "Comment creation failed");
    }

    // Return a successful response with the created comment
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                comment,
                "Comment added successfully"
            )
        );
});

// Function to update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    // Check if the comment content is provided
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if the user is the owner of the comment
    if (comment.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    // Update the comment content
    comment.content = content;
    const updatedComment = await comment.save();

    // Check if the comment update failed
    if (!updatedComment) {
        throw new ApiError(500, "Comment update failed");
    }

    // Return a successful response with the updated comment
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedComment,
                "Comment updated successfully"
            )
        );
});

// Function to delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { user } = req;

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check if the user is the owner of the comment
    if (comment.owner.toString() !== user.id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    // Delete the comment
    const deletedComment = await Comment.findByIdAndDelete(comment._id);

    // Check if the comment deletion failed
    if (!deletedComment) {
        throw new ApiError(500, "Comment deletion failed");
    }

    // Return a successful response indicating the comment was deleted
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Comment deleted successfully"
            )
        );
});

// Export the functions
export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};