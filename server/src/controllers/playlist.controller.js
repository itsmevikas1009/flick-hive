import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { user } = req;

    // Validate input
    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }
    if (!description) {
        throw new ApiError(400, "Playlist description is required");
    }

    // Create a new playlist
    const playlist = await Playlist.create({
        name,
        description,
        owner: user.id
    });

    if (!playlist) {
        throw new ApiError(500, "Playlist creation failed");
    }

    // Return a successful response with the created playlist
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                playlist,
                "Playlist created successfully"
            )
        );
});

// Function to get all playlists of a user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate user ID
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Find playlists by user ID
    const playlists = await Playlist.find({ owner: userId });

    if (!playlists) {
        throw new ApiError(404, "No playlists found");
    }

    // Return a successful response with the user's playlists
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlists,
                "User playlists retrieved successfully"
            )
        );
});

// Function to get a playlist by its ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Return a successful response with the playlist
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Playlist retrieved successfully"
            )
        );
});

// Function to add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate playlist and video IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if the video is already in the playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist");
    }

    // Add the video to the playlist
    playlist.videos.push(videoId);

    // Save the updated playlist
    const updatedPlaylist = await playlist.save();

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to add video to playlist");
    }

    // Return a successful response with the updated playlist
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video added to playlist successfully"
            )
        );
});

// Function to remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate playlist and video IDs
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if the video is not in the playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not in playlist");
    }

    // Remove the video from the playlist
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId);

    // Save the updated playlist
    const updatedPlaylist = await playlist.save();

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to remove video from playlist");
    }

    // Return a successful response with the updated playlist
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Video removed from playlist successfully"
            )
        );
});

// Function to delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { user } = req;

    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if the user is the owner of the playlist
    if (playlist.owner.toString() !== user.id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this playlist");
    }

    // Delete the playlist
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlist._id);

    if (!deletedPlaylist) {
        throw new ApiError(500, "Failed to delete playlist");
    }

    // Return a successful response indicating the playlist was deleted
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Playlist deleted successfully"
            )
        );
});

// Function to update a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // Validate input
    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }
    if (!description) {
        throw new ApiError(400, "Playlist description is required");
    }

    // Validate playlist ID
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Update the playlist details
    playlist.name = name;
    playlist.description = description;

    // Save the updated playlist
    const updatedPlaylist = await playlist.save();

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to update playlist");
    }

    // Return a successful response with the updated playlist
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        );
});

// Export the functions related to playlist management
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};