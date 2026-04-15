import { IUser } from '@/types/user';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Partial<IUser>) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform: (_, ret: Partial<IUser>) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

const User = mongoose.model<IUser>('User', userSchema);
export default User;
