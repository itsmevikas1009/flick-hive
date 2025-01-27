import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to toggle subscription to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Find the user and the channel by their IDs
    const user = await User.findById(req.user._id);
    const channel = await User.findById(channelId);

    // Check if the user or channel does not exist
    if (!user || !channel) {
        throw new ApiError(404, 'User or Channel not found');
    }

    // Check if the user is trying to subscribe to themselves
    if (user._id.toString() === channel._id.toString()) {
        throw new ApiError(400, 'Cannot subscribe to self');
    }

    // Check if the user is already subscribed to the channel
    const subscription = await Subscription.findOne({ subscriber: user._id, channel: channel._id });
    if (!subscription) {
        // If not subscribed, create a new subscription
        const newSubscription = new Subscription({ subscriber: user._id, channel: channel._id });
        await newSubscription.save();
        return res
            .status(201)
            .json(new ApiResponse(201, newSubscription, "Subscription created successfully"));
    }

    // If already subscribed, delete the subscription
    await Subscription.findByIdAndDelete(subscription._id);
    return res.status(204).send();
});

// Function to return the subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Find the channel by ID
    const channel = await User.findById(subscriberId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Aggregate subscribers for the channel
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

    // Return a successful response with the list of subscribers
    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers list"));
});

// Function to return the list of channels to which a user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
});

// Export the functions related to subscription management
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};