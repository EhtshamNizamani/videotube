import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteVideoFromCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 5,
    query = "",
    sortBy,
    sortType,
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  // match the qury condition for both title and description
  const matchCondition = {
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  //  sets owner property of matchCondition to userId
  if (userId) {
    (matchCondition.owner = new mongoose.Types.ObjectId(userId)),
      (matchCondition.isPublished = true);
  }

  let videoAggregate;

  try {
    videoAggregate = Video.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                userName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },
      {
        $sort: {
          [sortBy || "createdAt"]: sortType === "desc" ? -1 : 1,
        },
      },
    ]);
  } catch (err) {
    console.error("Error in aggregation:", err);
    throw new ApiError(
      500,
      err.message || "Internal server error in video aggregate"
    );
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    customLabels: {
      totalDocs: "totalVideos",
      docs: "videos",
    },
  };

  const videoResult = await Video.aggregatePaginate(videoAggregate, options);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoResult,
        videoResult.totalVideos.length === 0
          ? "No video found "
          : "Video fetch successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const ownerId = req.user?._id;
  if (!ownerId) {
    throw new ApiError(403, "Unauthorized user");
  }
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0].path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

  // TODO: get video, upload to cloudinary, create video

  const video = await Video.create({
    title,
    description,
    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnailFile.url,
      public_id: thumbnailFile.public_id,
    },
    duration: videoFile.duration,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "Video not found");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: {
        views: 1,
      },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const history = await User.findByIdAndUpdate(req.user?._id, {
    $addToSet: {
      watchHistory: video._id,
    },
  });
  res.status(200).json(new ApiResponse(201, video, "video fetch successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(400, "video not found");
  }
  console.log("testing this " + title);
  const updateVideo = await Video.findByIdAndUpdate(videoId, {
    $set: {
      title,
      description,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(201, updateVideo, "Video update successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "video not found");
  }
  const video = await Video.findById(videoId, {
    owner: 1,
    videoFile: 1,
    thumbnail: 1,
  });

  if (video?.owner.toString() !== req.user?._id.toString()) {
    console.log(req.user?._id.toString());
    throw new ApiError(403, "You are not allowed to delete this video");
  }
  await deleteVideoFromCloudinary(video.videoFile.public_id);
  await deleteImageFromCloudinary(video.thumbnail.public_id);
  const resp = await Video.findByIdAndDelete(videoId);
  if (!resp) {
    throw new ApiError(404, "video not found");
  }
  res.status(200).json(new ApiResponse(201, {}, "Successfully deleted"));
  // throw new ApiError(500, "Error deleting document");
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
