import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = new Tweet({
        owner: req.user._id,
        content
    })

    await tweet.save();

    const tweetCreated = await Tweet.findById(tweet._id).populate("owner", "username");

    if (!tweetCreated) {
        throw new ApiError(500, "Tweet not created");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                tweetCreated,
                "Tweet created successfully",
            )
        );
})

const getUserTweets = asyncHandler(async (req, res) => {
    const tweets = await Tweet.find({ owner: req.user._id }).populate("owner", "username");

    if (!tweets) {
        throw new ApiError(404, "No tweets found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "User tweets retrieved successfully",
            )
        );
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    const { tweetId } = req.params;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweet._id,
        { content },
        { new: true }
    ).populate("owner", "username");

    if (!updatedTweet) {
        throw new ApiError(500, "Tweet not updated");
    }

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

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweet._id);

    if (!deletedTweet) {
        throw new ApiError(500, "Tweet not deleted");
    }

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

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}