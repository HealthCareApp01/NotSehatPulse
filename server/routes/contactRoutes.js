import express from 'express';
import ContactQuery from '../models/ContactQuery.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Submit a contact query
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const query = new ContactQuery({ name, email, subject, message });
    await query.save();
    res.status(201).json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all contact queries
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const queries = await ContactQuery.find().sort({ createdAt: -1 });
    res.json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a contact query
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const query = await ContactQuery.findByIdAndDelete(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }
    res.json({ success: true, message: 'Query deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
