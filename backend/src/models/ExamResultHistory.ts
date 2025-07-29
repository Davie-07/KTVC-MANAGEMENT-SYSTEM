import mongoose, { Document, Schema } from 'mongoose';

export interface IExamResultHistory extends Document {
  student: mongoose.Types.ObjectId;
  unit: string;
  cam1: { score: number; outOf: number };
  cam2: { score: number; outOf: number };
  cam3: { score: number; outOf: number };
  average: number;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
}

const ExamResultHistorySchema = new Schema<IExamResultHistory>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  unit: { type: String, required: true },
  cam1: { 
    score: { type: Number, required: true },
    outOf: { type: Number, required: true, default: 100 }
  },
  cam2: { 
    score: { type: Number, required: true },
    outOf: { type: Number, required: true, default: 100 }
  },
  cam3: { 
    score: { type: Number, required: true },
    outOf: { type: Number, required: true, default: 100 }
  },
  average: { type: Number, required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IExamResultHistory>('ExamResultHistory', ExamResultHistorySchema); 