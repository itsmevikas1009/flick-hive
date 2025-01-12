import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";

import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    // const video = await Video.findById(videoId);
    // if (!video) {
    //     throw new ApiError(404, "Video not found");
    // }
    // const like = await Like.findOne({ video: video._id, likedBy: req.user._id });
    // if (!like) {
    //     const newLike = new Like({ video: video._id, likedBy: req.user._id });
    //     await newLike.save();
    //     return res
    //         .status(201)
    //         .json(new ApiResponse(201, "Video liked", newLike))
    // }
    // await Like.findByIdAndDelete(like._id);
    // return res
    //     .status(200)
    //     .json(new ApiResponse(
    //         200,
    //         null,
    //         "Video like toggled successfully"
    //     ))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}