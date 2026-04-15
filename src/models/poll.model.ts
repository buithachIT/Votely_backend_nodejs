import mongoose, { Document, Schema } from 'mongoose';

interface IPoll extends Document {
  title: string;
  description?: string;
  code: string;
  createdBy: mongoose.Types.ObjectId;
  options: Array<{
    text: string;
    votes: number;
    image?: string;
  }>;
  votedUsers: mongoose.Types.ObjectId[];
  multipleSelection: boolean;
  maxSelections: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const pollSchema = new Schema<IPoll>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    options: [
      {
        text: { type: String, required: true, trim: true },
        votes: { type: Number, default: 0 },
        image: { type: String, trim: true },
      },
    ],
    votedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    multipleSelection: { type: Boolean, default: false },
    maxSelections: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

pollSchema.index({ code: 1 });
pollSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

const Poll = mongoose.model<IPoll>('Poll', pollSchema);
export default Poll;
