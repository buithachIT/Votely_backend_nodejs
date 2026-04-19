import ChatMessageModel from '@/models/chat-message.model';
import PollModel from '@/models/poll.model';
import mongoose from 'mongoose';

export interface ChatMessagePayload {
  pollCode: string;
  userId: string;
  username: string;
  message: string;
}

export const saveMessageService = async (data: ChatMessagePayload) => {
  return await ChatMessageModel.create({
    pollCode: data.pollCode,
    userId: new mongoose.Types.ObjectId(data.userId),
    username: data.username,
    message: data.message.trim(),
  });
};

export const getChatHistoryService = async (pollCode: string, limit = 50) => {
  return await ChatMessageModel.find({ pollCode })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .then((msgs) => msgs.reverse());
};

export const isPollChatEnabledService = async (
  pollCode: string,
): Promise<boolean> => {
  const poll = await PollModel.findOne(
    { code: pollCode },
    { chatEnabled: 1 },
  ).lean();
  return poll?.chatEnabled ?? false;
};
