import { Router } from 'express';
import Course from '../models/Course';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get published courses (accessible by admin and teachers)
router.get('/published', authenticate, async (req: AuthRequest, res) => {
  try {
    const courses = await Course.find({ published: true });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch published courses.', error: err });
  }
});

// Get course by name (accessible by authenticated users)
router.get('/name/:courseName', authenticate, async (req: AuthRequest, res) => {
  try {
    const { courseName } = req.params;
    const course = await Course.findOne({ name: decodeURIComponent(courseName) });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course.', error: err });
  }
});

// All routes below require admin
router.use(authenticate, requireAdmin);

// Create a course
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, description, levels, duration } = req.body;
    const course = await Course.create({ name, description, levels, duration });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create course.', error: err });
  }
});

// List all courses
router.get('/', async (_req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses.', error: err });
  }
});

// Update a course
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, levels, duration } = req.body;
    const updated = await Course.findByIdAndUpdate(id, { name, description, levels, duration }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update course.', error: err });
  }
});

// Delete a course
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.json({ message: 'Course deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete course.', error: err });
  }
});

// Publish/unpublish a course
router.patch('/:id/publish', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    const updated = await Course.findByIdAndUpdate(id, { published }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update published status.', error: err });
  }
});

export default router; 