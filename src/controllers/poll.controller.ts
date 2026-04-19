import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { catchAsync } from '@/utils/catch-async.util';
import { AppError } from '@/utils/app-error.util';
import { sendSuccess } from '@/helpers/response.helper';
import * as PollService from '@/services/poll.service';
import { io } from '@/server';

type PopulatedOrId = mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId };

const getOwnerId = (createdBy: PopulatedOrId): string => {
  if (createdBy instanceof mongoose.Types.ObjectId) {
    return createdBy.toString();
  }
  return createdBy._id.toString();
};

export const createPoll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id.toString();
  const poll = await PollService.createPollService(userId, req.body);
  sendSuccess(res, {
    data: poll,
    message: 'Cuộc bình chọn đã được tạo thành công',
    statusCode: 201,
  });
});

export const getPollByCode = catchAsync(async (req: Request, res: Response) => {
  const code = req.params.code as string;
  const poll = await PollService.getPollByCodeService(code);
  if (!poll) {
    throw new AppError('Cuộc bình chọn không tồn tại', 404);
  }
  sendSuccess(res, { data: poll });
});

export const getPollById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const poll = await PollService.getPollByIdService(id);
  if (!poll) {
    throw new AppError('Cuộc bình chọn không tồn tại', 404);
  }
  sendSuccess(res, { data: poll });
});

export const getUserPolls = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id.toString();
  const polls = await PollService.getUserPollsService(userId);
  sendSuccess(res, { data: polls });
});

export const updatePoll = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user._id.toString();
  const poll = await PollService.getPollByIdService(id);
  if (!poll) {
    throw new AppError('Cuộc bình chọn không tồn tại', 404);
  }
  const pollOwnerId = getOwnerId(poll.createdBy as PopulatedOrId);
  if (pollOwnerId !== userId) {
    throw new AppError('Bạn không có quyền cập nhật cuộc bình chọn này', 403);
  }
  const updatedPoll = await PollService.updatePollService(id, req.body);
  sendSuccess(res, {
    data: updatedPoll,
    message: 'Cuộc bình chọn đã được cập nhật thành công',
  });
});

export const closePoll = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user._id.toString();
  const poll = await PollService.getPollByIdService(id);
  if (!poll) {
    throw new AppError('Cuộc bình chọn không tồn tại', 404);
  }
  const pollOwnerId = getOwnerId(poll.createdBy as PopulatedOrId);
  if (pollOwnerId !== userId) {
    throw new AppError('Bạn không có quyền đóng cuộc bình chọn này', 403);
  }
  const closedPoll = await PollService.closePollService(id);
  if (closedPoll) {
    io.to(closedPoll.code).emit('poll-closed', closedPoll);
  }
  sendSuccess(res, {
    data: closedPoll,
    message: 'Cuộc bình chọn đã được đóng thành công',
  });
});

export const deletePoll = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user._id.toString();
  const poll = await PollService.getPollByIdService(id);
  if (!poll) {
    throw new AppError('Cuộc bình chọn không tồn tại', 404);
  }
  const pollOwnerId = getOwnerId(poll.createdBy as PopulatedOrId);
  if (pollOwnerId !== userId) {
    throw new AppError('Bạn không có quyền xóa cuộc bình chọn này', 403);
  }
  const pollCode = poll.code;
  await PollService.deletePollService(id);
  io.to(pollCode).emit('poll-deleted', { id, code: pollCode });
  sendSuccess(res, {
    message: 'Cuộc bình chọn đã được xóa thành công',
    statusCode: 204,
  });
});

export const votePoll = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user._id.toString();
  const { selectedOptions } = req.body;

  const updatePoll = (await PollService.votePollService(
    id,
    userId,
    selectedOptions,
  )) as unknown as IPoll;
  if (updatePoll) {
    io.to(updatePoll.code).emit('poll-updated', updatePoll);
  }

  sendSuccess(res, {
    data: updatePoll,
    message: 'Bình chọn đã được ghi nhận thành công',
    statusCode: 201,
  });
});
