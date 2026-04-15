import mongoose, { Document, Schema } from 'mongoose';

interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  selectedOptions: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const voteSchema = new Schema<IVote>(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    selectedOptions: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  },
  { timestamps: true },
);

voteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

const Vote = mongoose.model<IVote>('Vote', voteSchema);
export default Vote;
