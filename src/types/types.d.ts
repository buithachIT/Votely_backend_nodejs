import { User } from '@/models/user.model';
import mongoose from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user: Partial<User> & { _id: mongoose.Types.ObjectId };
      userId?: string;
    }
  }
  export interface IPoll {
    _id: string;
    code: string;
    title: string;
    options: { text: string; votes: number }[];
    isActive: boolean;
    createdBy: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }
}

export {};
