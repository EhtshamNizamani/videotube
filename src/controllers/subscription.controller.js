import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!channelId) {
    throw new ApiError(400, "Invalid channel");
  }
  const subscriber = await Subscription.findOne({ subscriber: channelId });
  if (subscriber) {
    await Subscription.findByIdAndDelete({
      _id: subscriber._id,
      subscriber: subscriber.subscriber,
    });
    return res
      .status(200)
      .json(new ApiResponse(201, "Unsubscribe the channel"));
  }

  await Subscription.create({ subscriber: channelId });
  res.status(200).json(new ApiResponse(201, "Subscribe the channel"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const subscriber = await Subscription.aggregate([
    { $match: { channel: channelId } },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "subscriber",
        as: "subscribedToSubscriber",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribedToSubscriber",
        },
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, subscriber));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
