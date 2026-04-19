import { Request, Response } from 'express';
import { catchAsync } from '@/utils/catch-async.util';
import { AppError } from '@/utils/app-error.util';
import { sendSuccess } from '@/helpers/response.helper';
import {
  getChatHistoryService,
  isPollChatEnabledService,
} from '@/services/chat.service';

export const getChatHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { pollCode } = req.params;
    const code = Array.isArray(pollCode) ? pollCode[0] : pollCode;
    const chatEnabled = await isPollChatEnabledService(code);
    if (!chatEnabled) {
      throw new AppError('Chat không được bật cho cuộc bình chọn này', 403);
    }
    const messages = await getChatHistoryService(code);
    sendSuccess(res, { data: messages });
  },
);
