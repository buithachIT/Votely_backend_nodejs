import {
  prop,
  getModelForClass,
  modelOptions,
  mongoose,
} from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { timestamps: true } })
export class ChatMessage {
  @prop({ required: true, index: true })
  public pollCode!: string;

  @prop({ ref: 'User', required: true })
  public userId!: mongoose.Types.ObjectId;

  @prop({ required: true, trim: true })
  public username!: string;

  @prop({ required: true, trim: true, maxlength: 500 })
  public message!: string;
}

const ChatMessageModel = getModelForClass(ChatMessage);
export default ChatMessageModel;
