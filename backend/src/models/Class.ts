import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  title: string;
  course: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  notifiedStudents: mongoose.Types.ObjectId[];
  date: Date;
  startTime: string;
  endTime: string;
  published: boolean;
}

const ClassSchema = new Schema<IClass>({
  title: { type: String, required: true },
  course: { type: String, required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  notifiedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  published: { type: Boolean, default: false },
});

export default mongoose.model<IClass>('Class', ClassSchema); 