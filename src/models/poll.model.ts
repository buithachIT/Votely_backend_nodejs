import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
  mongoose,
} from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { _id: false } })
class PollOption {
  @prop({ required: true, trim: true })
  public text!: string;

  @prop({ default: 0 })
  public votes?: number;

  @prop({ trim: true })
  public image?: string;
}

@modelOptions({
  schemaOptions: { timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class Poll {
  @prop({ required: true, trim: true })
  public title!: string;

  @prop({ trim: true })
  public description?: string;

  @prop({ required: true, unique: true, uppercase: true, index: true })
  public code!: string;

  @prop({ ref: 'User', required: true })
  public createdBy!: mongoose.Types.ObjectId;

  @prop({ type: () => [PollOption], required: true })
  public options!: PollOption[];

  @prop({ default: false })
  public multipleSelection!: boolean;

  @prop({ default: 1, min: 1 })
  public maxSelections!: number;

  @prop({ default: true })
  public isActive!: boolean;

  @prop({ type: () => [mongoose.Types.ObjectId], ref: 'User', default: [] })
  public votedUsers!: mongoose.Types.ObjectId[];

  @prop({ default: true })
  public chatEnabled!: boolean;
}

const PollModel = getModelForClass(Poll);
export default PollModel;
