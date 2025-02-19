import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getUserChannelProfile } from "./user.controller.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channel = await User.findById(req.user._id);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    const videoCount = await Video.countDocuments({ owner: channel._id });
    const subscriberCount = await Subscription.countDocuments({ channel: channel._id });
    const likeCount = await Like.countDocuments({
        video: {
            $in: await Video.find({
                owner: channel._id
            })
        }
    });
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videoCount,
                subscriberCount,
                likeCount
            },
            "Channel stats retrieved successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channel = await User.findById(req.user._id);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    const videos = await Video.find({ owner: channel._id });
    return res.status(200).json(new ApiResponse(200, videos, "Videos retrieved successfully"));
});

export {
    getChannelStats,
    getChannelVideos
}