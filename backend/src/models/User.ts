import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone?: string; // Optional since it's only required for students
  admission?: string; // Optional since it's only required for students
  email: string;
  course: string;
  level?: string; // Optional since it's only required for students
  courseDuration?: string; // Optional since it's only required for students
  password: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  friends: string[];
  friendRequests: string[];
  teacherId?: string; // Unique 10-digit ID for teachers
  isOnline?: boolean; // Track online status
  lastSeen?: Date; // Track last activity
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: false },
  admission: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  level: { type: String, required: false },
  courseDuration: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  teacherId: { type: String, unique: true, sparse: true }, // Only for teachers
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema); 