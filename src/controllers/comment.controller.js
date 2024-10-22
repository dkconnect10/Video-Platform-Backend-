import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(404, "give valid video id");
  }

  const existVideo = await Video.findById(videoId);

  if (!existVideo) {
    throw new ApiError(404, "video not avelable in database");
  }

  const pageNumber = +page;
  const limitNumber = +limit;

  if (!(pageNumber > 0 && limitNumber > 0)) {
    throw new ApiError(404, "give postive pagenumber or limitNumber");
  }

  const skip = (pageNumber - 1) * limitNumber;

  const comment = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(limitNumber);

  if (!comment) {
    throw new ApiError(500, "no comments avelable ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "find comment successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "please enter comment");
  }

  const comment = await Comment.create({
    content: content,
    video: req.video._id,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(501, "something went wrong while uploading comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment post successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "comment Id empty");
  }
  if (!content) {
    throw new ApiError(400, "give new content");
  }

  const commentExist = await Comment.findById(commentId);

  if (!commentExist) {
    throw new ApiError(400, "comment not avelable");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: content,
    },
    {
      new: true,
    }
  );

  if (!updatedComment) {
    throw new ApiError(501, "error accure when update new comment ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment update successfully "));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment ID cannot be empty");
  }

  const commentDelete = await Comment.findByIdAndDelete(commentId);

  if (!commentDelete) {
    throw new ApiError(404, "Comment not found");
  }

  return res.json(
    new ApiResponse(200, commentDelete, "Comment deleted successfully")
  );
});

export { getVideoComments, addComment, updateComment, deleteComment };
