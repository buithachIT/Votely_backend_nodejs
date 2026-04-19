import dotenv from 'dotenv';
dotenv.config();
import validateEnv from './config/validate-env';
import http from 'http';
validateEnv();
import connection from './config/database';
import app from './app';
import { Server } from 'socket.io';
import { AppError } from './utils/app-error.util';
import { allowedOrigins } from './config/cors';
import {
  saveMessageService,
  isPollChatEnabledService,
  ChatMessagePayload,
} from './services/chat.service';

const port = process.env.PORT || 8083;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new AppError(`CORS: origin '${origin}' not allowed`, 403));
      }
    },
    credentials: true,
  },
});
io.on('connection', (socket) => {
  socket.on('join-poll', (pollCode: string) => {
    socket.join(pollCode);
  });

  socket.on('send-message', async (data: ChatMessagePayload) => {
    const { pollCode, userId, username, message } = data;
    if (!pollCode || !message?.trim()) return;

    const chatEnabled = await isPollChatEnabledService(pollCode);
    if (!chatEnabled) {
      socket.emit('chat-error', { message: 'Chat không được bật cho cuộc bình chọn này' });
      return;
    }

    const saved = await saveMessageService({ pollCode, userId, username, message });
    io.to(pollCode).emit('receive-message', saved);
  });

  socket.on('disconnect', () => {});
});

(async (): Promise<void> => {
  try {
    await connection();

    server.listen(port, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
      console.log(
        `📝 Tài liệu API (Swagger): http://localhost:${port}/api-docs`,
      );
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Lỗi khởi động server:', error.message);
    } else {
      console.error('❌ Lỗi không xác định:', error);
    }
    process.exit(1);
  }
})();

export { io };
