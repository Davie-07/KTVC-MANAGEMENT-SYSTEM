import mongoose, { Document, Schema } from 'mongoose';

export interface IUpskill extends Document {
  title: string;
  description: string;
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  notifiedUsers: mongoose.Types.ObjectId[];
}

const UpskillSchema = new Schema<IUpskill>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'KSH' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  notifiedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model<IUpskill>('Upskill', UpskillSchema); 