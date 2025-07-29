import mongoose from 'mongoose';

const academicFeeSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true,
  },
  feeAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'KSH',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique course
academicFeeSchema.index({ course: 1 }, { unique: true });

export default mongoose.model('AcademicFee', academicFeeSchema); 