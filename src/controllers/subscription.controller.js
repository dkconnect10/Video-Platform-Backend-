import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subsribe.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(404, "enter valide channel Id ");
  }

  const channel = await User.findOne(channelId);
  const userId = req.user._id;

  if (!channel) {
    throw new ApiError(404, "channel not exist");
  }

  const existSubscriber = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });

  if (existSubscriber) {
    await existSubscriber.remove();
    return new ApiResponse(200, {}, "remove successfully");
  } else {
    const newSubscription = await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log("Received channelId:", channelId); // Debug log
  if (!isValidObjectId(channelId)) {
    throw new ApiError(404, "channel does not exist");
  }

  const channel = await User.findById(channelId);
  console.log("Channel found:", channel); // Debug log

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "name email"
  );

  if (!subscribers.length) {
    throw new ApiError(404, "No subscribers found for this channel");
  }

  // Return the list of subscribers
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(404, "subscriber does not exist");
  }
  const subscriber = await User.findById(subscriberId);
  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found");
  }
  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "name email");

  if (!subscribedChannels.length) {
    throw new ApiError(404, "No subscribed channels found for this user");
  }

  // Return the list of subscribed channels
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
