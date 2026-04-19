import PollModel, { Poll } from '@/models/poll.model';
import VoteModel from '@/models/vote.model';
import { generatePollCode } from '@/utils/generate-code.util';
import { AppError } from '@/utils/app-error.util';
import mongoose from 'mongoose';

export const createPollService = async (
  userId: string,
  pollData: Partial<Poll>,
) => {
  let code = generatePollCode();

  let isCodeExists = await PollModel.findOne({ code });
  while (isCodeExists) {
    code = generatePollCode();
    isCodeExists = await PollModel.findOne({ code });
  }
  return await PollModel.create({ ...pollData, createdBy: userId, code });
};

export const getPollByCodeService = async (code: string) => {
  return await PollModel.findOne({ code }).populate(
    'createdBy',
    'username email',
  );
};

export const getPollByIdService = async (id: string) => {
  const objectId = new mongoose.Types.ObjectId(id);
  return await PollModel.findById(objectId).populate(
    'createdBy',
    'username email',
  );
};

export const getUserPollsService = async (userId: string) => {
  const objectId = new mongoose.Types.ObjectId(userId);
  return await PollModel.find({ createdBy: objectId })
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 });
};

export const updatePollService = async (
  id: string,
  updateData: Partial<Poll>,
) => {
  const objectId = new mongoose.Types.ObjectId(id);
  // Only allow updating title and description after creation
  const filteredData: Partial<Poll> = {};
  if ('title' in updateData && updateData.title !== undefined) {
    filteredData.title = updateData.title;
  }
  if ('description' in updateData && updateData.description !== undefined) {
    filteredData.description = updateData.description;
  }
  if ('chatEnabled' in updateData && updateData.chatEnabled !== undefined) {
    filteredData.chatEnabled = updateData.chatEnabled;
  }

  return await PollModel.findByIdAndUpdate(objectId, filteredData, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'username email');
};

export const closePollService = async (id: string) => {
  const objectId = new mongoose.Types.ObjectId(id);
  return await PollModel.findByIdAndUpdate(
    objectId,
    { isActive: false },
    { new: true },
  ).populate('createdBy', 'username email');
};

export const deletePollService = async (id: string) => {
  const objectId = new mongoose.Types.ObjectId(id);
  // Delete all votes related to this poll
  await VoteModel.deleteMany({ pollId: objectId });
  // Delete the poll
  return await PollModel.findByIdAndDelete(objectId);
};

export const votePollService = async (
  pollId: string,
  userId: string,
  selectedOptions: string[],
) => {
  const objectPollId = new mongoose.Types.ObjectId(pollId);
  const objectUserId = new mongoose.Types.ObjectId(userId);

  // Check if poll exists and is active
  const poll = await PollModel.findById(objectPollId);
  if (!poll) {
    throw new AppError('Cuộc bình chọn không tồn tại', 404);
  }
  if (!poll.isActive) {
    throw new AppError('Cuộc bình chọn này đã đóng', 400);
  }

  // Check if user already voted
  const existingVote = await VoteModel.findOne({
    pollId: objectPollId,
    userId: objectUserId,
  });
  if (existingVote) {
    throw new AppError('Bạn đã tham gia bình chọn này', 400);
  }

  // Validate selected options
  if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
    throw new AppError('Bạn phải chọn ít nhất một lựa chọn', 400);
  }

  // Check if user exceeded max selections
  if (selectedOptions.length > poll.maxSelections) {
    throw new AppError(
      `Bạn chỉ có thể chọn tối đa ${poll.maxSelections} lựa chọn`,
      400,
    );
  }

  // For single selection, ensure only one option is selected
  if (!poll.multipleSelection && selectedOptions.length > 1) {
    throw new AppError('Bạn chỉ có thể chọn một lựa chọn', 400);
  }

  // Validate that all selected options exist in the poll
  const selectedOptionIds = new Set(selectedOptions);
  const validOptionTexts = new Set(poll.options.map((opt) => opt.text));

  for (const optionId of selectedOptionIds) {
    if (!validOptionTexts.has(optionId)) {
      throw new AppError('Lựa chọn không hợp lệ', 400);
    }
  }

  // Create vote record
  await VoteModel.create({
    pollId: objectPollId,
    userId: objectUserId,
    selectedOptions: selectedOptions,
  });

  for (const option of poll.options) {
    if (selectedOptions.includes(option.text)) {
      option.votes = (option.votes || 0) + 1;
    }
  }
  poll.votedUsers.push(objectUserId);
  await poll.save();

  const updatedPoll = await PollModel.findById(objectPollId)
    .populate('createdBy', 'firstName lastName')
    .lean();

  return updatedPoll;
};
