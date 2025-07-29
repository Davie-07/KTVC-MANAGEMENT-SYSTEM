import mongoose from 'mongoose';

const academicCalendarSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  semester: {
    type: String,
    enum: ['Term 1', 'Term 2', 'Term 3'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  feeAmount: {
    type: Number,
    required: true,
    default: 0,
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

// Ensure unique combination of year and semester
academicCalendarSchema.index({ year: 1, semester: 1 }, { unique: true });

export default mongoose.model('AcademicCalendar', academicCalendarSchema); 