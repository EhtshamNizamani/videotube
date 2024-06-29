import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  //TODO: create playlist

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  res.status(200).json(new ApiResponse(201, playlist, "Playlist created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, "This user not found");
  }
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "Playlist not found");
  }
  //TODO: get playlist by id

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(201, playlist, "Fetched playlist by id successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist and video is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video is required");
  }
  console.log(req.user._id);
  console.log(video.owner._id);

  if (req.user._id.toString() != video.owner._id.toString()) {
    throw new ApiError(400, "Only video owner will add to the playlist");
  }
  const playList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: video._id,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json(new ApiResponse(201, playList, "Video added to the playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Invalid PlaylistId or videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  if (req.user._id.toString() != video.owner._id.toString()) {
    console.log(req.user._id.toString());
    console.log(video.owner);
    throw new ApiError(400, "Only video owner will delete from the playlist");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  res
    .status(200)
    .json(new ApiResponse(201, playlist, "Video deleted successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "Invalid playlist");
  }
  const playlist = await Playlist.findById(playlistId);
  if (req.user._id.toString() != playlist.owner._id.toString()) {
    console.log(req.user._id.toString());
    console.log(playlist.owner);
    throw new ApiError(400, "Only video owner will delete from the playlist");
  }
  const result = await Playlist.deleteOne({ _id: playlistId });

  res
    .status(200)
    .json(new ApiResponse(201, result, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
