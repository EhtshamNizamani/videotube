import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  // get videoId from params and validate object id
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Invalid video id");
  }

  // get page and limit from query params
  const { page = 1, limit = 10 } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const commentAggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        owners: {
          $first: "$owner",
        },
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        content: 1,
        video: 1,
        likesCount: 1,
        isLiked: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    customLabels: {
      totalDocs: "Total comments",
      docs: "comments",
    },
  };

  const comment = await Comment.aggregatePaginate(commentAggregate, options);

  res
    .status(200)
    .json(new ApiResponse(201, comment, "All comments retrieve successfully"));
});
const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  // get videoId from params and validate object id
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Invalid video id");
  }
  if (!content.trim() === "") {
    throw new ApiError(404, "Content is required");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // get comment content from request body and validate its not empty

  const comment = await Comment.create({
    content,
    video: video._id,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(500, "Some thing went wrong please try again");
  }

  res
    .status(200)
    .json(new ApiResponse(201, content, "Comment added successfully"));
});
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { comment } = req.body;

  if (!commentId) {
    throw new ApiError(404, "Comment not found");
  }

  // TODO: update a comment

  const updatedComment = await Comment.findByIdAndUpdate(commentId, {
    content: comment,
  });
  if (!updatedComment) {
    throw new ApiError(400, "We cannot perform this operation");
  }
  res
    .status(200)
    .json(new ApiResponse(201, {}, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(404, "Comment not found");
  }

  // TODO: delete a comment

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, { commentId }, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
