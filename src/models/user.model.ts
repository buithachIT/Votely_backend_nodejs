import {
  prop,
  getModelForClass,
  modelOptions,
  mongoose,
} from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {
      transform: (_: mongoose.Document, ret: Record<string, unknown>) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform: (_: mongoose.Document, ret: Record<string, unknown>) => {
        delete ret.password;
        return ret;
      },
    },
  },
})
export class User {
  public _id!: mongoose.Types.ObjectId;
  @prop({ required: true, trim: true })
  public firstName!: string;

  @prop({ required: true, trim: true })
  public lastName!: string;

  @prop({ required: true, unique: true, lowercase: true, trim: true })
  public email!: string;

  @prop({ required: true, trim: true })
  public phone!: string;

  @prop({ required: true, select: false })
  public password!: string;
}
const UserModel = getModelForClass(User);
export default UserModel;
