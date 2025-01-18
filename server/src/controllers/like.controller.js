import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const like = await Like.findOne({ video: video._id, likedBy: req.user._id });
    if (!like) {
        const newLike = new Like({ video: video._id, likedBy: req.user._id });
        await newLike.save();
        return res
            .status(201)
            .json(new ApiResponse(
                201,
                "Video liked",
                newLike
            ));
    }

    await Like.findByIdAndDelete(like._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Video like toggled successfully"
        ));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const like = await Like.findOne({ comment: comment._id, likedBy: req.user._id });
    if (!like) {
        const newLike = new Like({ comment: comment._id, likedBy: req.user._id });
        await newLike.save();
        return res
            .status(201)
            .json(new ApiResponse(
                201,
                "Comment liked",
                newLike
            ));
    }

    await Like.findByIdAndDelete(like._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Comment like toggled successfully"
        ));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const like = await Like.findOne({ tweet: tweet._id, likedBy: req.user._id });
    if (!like) {
        const newLike = new Like({ tweet: tweet._id, likedBy: req.user._id });
        await newLike.save();
        return res
            .status(201)
            .json(new ApiResponse(
                201,
                newLike,
                "Tweet liked"
            ));
    }

    await Like.findByIdAndDelete(like._id);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Tweet like toggled successfully"
        ));
});

const getLikedVideos = asyncHandler(async (req, res) => {
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

    if (!likedVideos) {
        throw new ApiError(
            404,
            "No liked videos found",
        )
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            likedVideos,
            "Liked videos retrieved successfully"
        ));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}