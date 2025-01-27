// Import necessary modules and utilities
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // Validate content
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    // Create a new tweet
    const tweet = new Tweet({
        owner: req.user._id,
        content
    });

    await tweet.save();

    // Populate the owner field with the username
    const tweetCreated = await Tweet.findById(tweet._id).populate("owner", "username");

    if (!tweetCreated) {
        throw new ApiError(500, "Tweet not created");
    }

    // Return a successful response with the created tweet
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                tweetCreated,
                "Tweet created successfully",
            )
        );
});

// Function to get all tweets of the authenticated user
const getUserTweets = asyncHandler(async (req, res) => {
    // Find tweets by user ID and populate the owner field with the username
    const tweets = await Tweet.find({ owner: req.user._id }).populate("owner", "username");

    if (!tweets) {
        throw new ApiError(404, "No tweets found");
    }

    // Return a successful response with the user's tweets
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "User tweets retrieved successfully",
            )
        );
});

// Function to update a tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    // Validate content
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    // Update the tweet content
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweet._id,
        { content },
        { new: true }
    ).populate("owner", "username");

    if (!updatedTweet) {
        throw new ApiError(500, "Tweet not updated");
    }

    // Return a successful response with the updated tweet
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTweet,
                "Tweet updated successfully",
            )
        );
});

// Function to delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Find the tweet by ID
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    // Delete the tweet
    const deletedTweet = await Tweet.findByIdAndDelete(tweet._id);

    if (!deletedTweet) {
        throw new ApiError(500, "Tweet not deleted");
    }

    // Return a successful response indicating the tweet was deleted
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Tweet deleted successfully",
            )
        );
});

// Export the functions related to tweet management
export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};