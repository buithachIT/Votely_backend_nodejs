import {
  prop,
  getModelForClass,
  modelOptions,
  index,
} from '@typegoose/typegoose';
import mongoose from 'mongoose';

@index({ pollId: 1, userId: 1 }, { unique: true })
@modelOptions({ schemaOptions: { timestamps: true } })
export class Vote {
  @prop({ ref: 'Poll', required: true })
  public pollId!: mongoose.Types.ObjectId;

  @prop({ ref: 'User', required: true })
  public userId!: mongoose.Types.ObjectId;

  @prop({ type: () => [String], required: true })
  public selectedOptions!: string[];
}

const VoteModel = getModelForClass(Vote);
export default VoteModel;
