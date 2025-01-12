import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { user } = req;
    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }
    if (!description) {
        throw new ApiError(400, "Playlist description is required");
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: user.id
    });
    if (!playlist) {
        throw new ApiError(500, "Playlist creation failed");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({ owner: userId });
    if (!playlists) {
        throw new ApiError(404, "No playlists found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists retrieved successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist");
    }
    playlist.videos.push(videoId);

    const updatedPlaylist = await playlist.save();
    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to add video to playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not in playlist");
    }
    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId);
    const updatedPlaylist = await playlist.save();
    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to remove video from playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { user } = req;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== user.id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this playlist");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlist._id);
    if (!deletedPlaylist) {
        throw new ApiError(500, "Failed to delete playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }
    if (!description) {
        throw new ApiError(400, "Playlist description is required");
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.name = name;
    playlist.description = description;

    const updatedPlaylist = await playlist.save();
    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to update playlist");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}