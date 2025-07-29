import mongoose from 'mongoose';

const studentFeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  academicYear: {
    type: Number,
    required: true,
  },
  semester: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3'],
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  totalFee: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'KSH',
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paymentHistory: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now,
    },
    paidBy: {
      type: String,
      required: true,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique combination of student, year, and semester
studentFeeSchema.index({ student: 1, academicYear: 1, semester: 1 }, { unique: true });

export default mongoose.model('StudentFee', studentFeeSchema); 