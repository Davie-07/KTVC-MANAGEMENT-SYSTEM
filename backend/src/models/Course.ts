import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  description: string;
  levels: { name: string; duration: string }[];
  duration: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LevelSchema = new Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true },
});

const CourseSchema = new Schema<ICourse>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  levels: { type: [LevelSchema], required: true },
  duration: { type: String, required: true },
  published: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema); 