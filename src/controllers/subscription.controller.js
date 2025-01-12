import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const user = await User.findById(req.user._id);
    const channel = await User.findById(channelId);

    if (!user || !channel) {
        throw new ApiError(404, 'User or Channel not found');
    }

    if (user._id.toString() === channel._id.toString()) {
        throw new ApiError(400, 'Cannot subscribe to self');
    }

    // Check if the user is already subscribed to the channel
    const subscription = await Subscription.findOne({ subscriber: user._id, channel: channel._id });
    if (!subscription) {
        // If not, create a new subscription
        const newSubscription = new Subscription({ subscriber: user._id, channel: channel._id });
        await newSubscription.save();
        return res
            .status(201)
            .json(new ApiResponse(
                201,
                newSubscription,
                "Subscription created successfully",
            ));
    }

    const deleteSubscription = await Subscription.findByIdAndDelete(subscription._id);
    if (!deleteSubscription) {
        throw new ApiError(404, 'Subscription not found');
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            null,
            "Subscription deleted successfully",
        ));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const channel = await User.findById(subscriberId);

    if (!channel) {
        return new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channel._id
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriber'
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                subscriber: "$subscriber._id",
                subscriberName: "$subscriber.fullName",
                subscriberEmail: "$subscriber.email",
                subscriberUsername: "$subscriber.username",
                subscriberAvatar: "$subscriber.avatar",
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            subscribers,
            "Subscribers list",
        ));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}