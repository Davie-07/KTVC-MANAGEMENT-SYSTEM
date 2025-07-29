import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  target: 'student' | 'teacher' | 'all';
  published: boolean;
  notifiedUsers: mongoose.Types.ObjectId[];
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  target: { type: String, enum: ['student', 'teacher', 'all'], default: 'all' },
  published: { type: Boolean, default: true },
  notifiedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema); 