import mongoose, { Document, Schema } from 'mongoose';

export interface IFeeStatus extends Document {
  student: mongoose.Types.ObjectId;
  paid: number;
  due: number;
  updatedAt: Date;
}

const FeeStatusSchema = new Schema<IFeeStatus>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  paid: { type: Number, required: true },
  due: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFeeStatus>('FeeStatus', FeeStatusSchema); 