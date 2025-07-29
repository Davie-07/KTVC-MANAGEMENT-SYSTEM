import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'new_student' | 'class_assigned' | 'exam_result' | 'announcement' | 'payment';
  message: string;
  timestamp: Date;
  read: boolean;
  relatedId?: mongoose.Types.ObjectId; // For linking to specific entities
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['new_student', 'class_assigned', 'exam_result', 'announcement', 'payment'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

export default mongoose.model<INotification>('Notification', notificationSchema); 