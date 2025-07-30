import { Router } from 'express';
import Class from '../models/Class';
import User from '../models/User';
import Notification from '../models/Notification';

const router = Router();

// Teacher publishes a class
router.post('/publish', async (req, res) => {
  try {
    const { title, course, teacherId, students, date, startTime, endTime } = req.body;
    const newClass = await Class.create({
      title,
      course,
      teacher: teacherId,
      students,
      notifiedStudents: students,
      date,
      startTime,
      endTime,
      published: true,
    });

    // Create notifications for all assigned students
    try {
      for (const studentId of students) {
        await Notification.create({
          recipient: studentId,
          type: 'class_assigned',
          message: `You have been assigned to class: ${title} on ${date} at ${startTime}`,
          relatedId: newClass._id
        });
      }
    } catch (notificationError) {
      console.error('Failed to create student notifications:', notificationError);
      // Don't fail class creation if notifications fail
    }

    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: 'Failed to publish class.', error: err });
  }
});

// Student fetches their published classes for today
router.get('/student-today/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const classes = await Class.find({
      students: studentId,
      published: true,
      date: { $gte: today, $lt: tomorrow },
    });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch classes.', error: err });
  }
});

// Student fetches all their published classes (for calendar)
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const classes = await Class.find({
      students: studentId,
      published: true,
    });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch classes.', error: err });
  }
});

// Get all classes (for admin/teacher list)
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'firstName lastName email').populate('students', 'firstName lastName email');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch classes.', error: err });
  }
});

// Get all classes for a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const classes = await Class.find({ teacher: teacherId }).populate('students', 'firstName lastName email');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch classes.', error: err });
  }
});

// Get today's classes for a specific teacher
router.get('/teacher-today/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const classes = await Class.find({
      teacher: teacherId,
      published: true,
      date: { $gte: today, $lt: tomorrow },
    });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch today\'s classes.', error: err });
  }
});

// Get all teachers (for dropdown)
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }, '_id firstName lastName email');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch teachers.', error: err });
  }
});

// Update a class
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, course, teacher, students, date, startTime, endTime } = req.body;
    const updated = await Class.findByIdAndUpdate(id, {
      title, course, teacher, students,
      notifiedStudents: students,
      date, startTime, endTime
    }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update class.', error: err });
  }
});

// Delete a class
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Class.findByIdAndDelete(id);
    res.json({ message: 'Class deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete class.', error: err });
  }
});

// Toggle published status
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    const updated = await Class.findByIdAndUpdate(id, { published }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update published status.', error: err });
  }
});

// Student marks a class as seen
router.patch('/:id/seen', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const updated = await Class.findByIdAndUpdate(id, { $pull: { notifiedStudents: studentId } }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark class as seen.', error: err });
  }
});

// Remove a student from a class
router.delete('/:classId/student/:studentId', async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const updated = await Class.findByIdAndUpdate(classId, { $pull: { students: studentId, notifiedStudents: studentId } }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove student.', error: err });
  }
});

// Add a student to a class
router.post('/:classId/student', async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    const updated = await Class.findByIdAndUpdate(classId, { $addToSet: { students: studentId, notifiedStudents: studentId } }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add student.', error: err });
  }
});

// Bulk assign students to a class
router.post('/assign-students', async (req, res) => {
  try {
    const { classId, studentIds } = req.body;
    
    if (!classId || !studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Class ID and student IDs array are required.' });
    }

    const updated = await Class.findByIdAndUpdate(
      classId, 
      { 
        $addToSet: { 
          students: { $each: studentIds },
          notifiedStudents: { $each: studentIds }
        } 
      }, 
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Class not found.' });
    }

    res.json({ 
      message: `Successfully assigned ${studentIds.length} student(s) to class`,
      class: updated 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign students to class.', error: err });
  }
});

export default router; 