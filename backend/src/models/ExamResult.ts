import mongoose, { Document, Schema } from 'mongoose';

export interface IExamResult extends Document {
  student: mongoose.Types.ObjectId;
  unit: string;
  cam1: { score: number; outOf: number };
  cam2: { score: number; outOf: number };
  cam3: { score: number; outOf: number };
  average: number;
  createdAt: Date;
}

const ExamResultSchema = new Schema<IExamResult>({
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
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IExamResult>('ExamResult', ExamResultSchema); 