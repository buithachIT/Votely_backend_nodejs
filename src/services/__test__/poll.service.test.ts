import 'reflect-metadata';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createPollService } from '../poll.service';
import PollModel, { Poll } from '@/models/poll.model';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await PollModel.deleteMany({});
});

describe('Poll Service - createPoll', () => {
  it('nên tạo một Poll mới thành công với mã code 6 chữ số', async () => {
    const mockUserId = new mongoose.Types.ObjectId().toString();
    const pollData = {
      title: 'Hôm nay ăn gì?',
      options: [{ text: 'Bún bò' }, { text: 'Cơm tấm' }],
    };

    const result = await createPollService(mockUserId, pollData);

    expect(result.title).toBe(pollData.title);
    expect(result.code).toHaveLength(6);
    expect(result.options).toHaveLength(2);
    expect(result.createdBy.toString()).toBe(mockUserId);
    expect(result.isActive).toBe(true);
  });

  it('nên báo lỗi nếu thiếu tiêu đề (title)', async () => {
    const mockUserId = new mongoose.Types.ObjectId().toString();
    const invalidData = { options: [{ text: 'Option 1' }] };

    await expect(
      createPollService(mockUserId, invalidData as unknown as Partial<Poll>),
    ).rejects.toThrow();
  });
});
