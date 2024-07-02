import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "Invalid video");
  }

  const video = await Video.findById(videoId);
  const comment = await Comment.findById(videoId);
  const likedAlready = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);
    return res.status(200).json(new ApiResponse(201, { isLiked: false }));
  }
  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  res.status(200).json(new ApiResponse(201, { isLiked: true }));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Invalid comment");
  }
  //TODO: toggle like on comment

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked?._id);

    return res.status(200).json(new ApiResponse(201, { isLiked: false }));
  }

  await Like.create({
    comment: commentId,
    video: comment.video,
    likedBy: req.user?._id,
  });
  res.status(200).json(new ApiResponse(201, { isLiked: true }));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
