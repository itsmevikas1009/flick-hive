import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const { user } = req;

    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: user.id
    });

    if (!comment) {
        throw new ApiError(500, "Comment creation failed");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, comment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user.id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    comment.content = content;
    const updatedComment = await comment.save();
    if (!updatedComment) {
        throw new ApiError(500, "Comment update failed");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { user } = req;
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== user.id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    const deletedComment = await Comment.findByIdAndDelete(comment._id);
    if (!deletedComment) {
        throw new ApiError(500, "Comment deletion failed");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}