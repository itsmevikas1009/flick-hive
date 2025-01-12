import mongoose from "mongoose";

// Define the schema for a subscription
const subscriptionSchema = new mongoose.Schema(
    {
        // Reference to the user who is subscribing
        subscriber: {
            type: mongoose.Schema.Types.ObjectId, // ObjectId type for MongoDB reference
            ref: 'User', // Reference to the User model
        },
        // Reference to the channel that is being subscribed to
        channel: {
            type: mongoose.Schema.Types.ObjectId, // ObjectId type for MongoDB reference
            ref: 'User ', // Reference to the User model (assuming channels are also users)
        },
    },
    {
        timestamps: true
    }
);

// Create and export the Subscription model based on the subscription schema
export const Subscription = mongoose.model("Subscription", subscriptionSchema);