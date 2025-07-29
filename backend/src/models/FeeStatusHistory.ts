import mongoose, { Document, Schema } from 'mongoose';

export interface IFeeStatusHistory extends Document {
  student: mongoose.Types.ObjectId;
  paid: number;
  due: number;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
}

const FeeStatusHistorySchema = new Schema<IFeeStatusHistory>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  paid: { type: Number, required: true },
  due: { type: Number, required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFeeStatusHistory>('FeeStatusHistory', FeeStatusHistorySchema); 