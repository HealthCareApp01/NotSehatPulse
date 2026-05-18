import express from 'express';
import Appointment from '../models/Appointment.js';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Book a new appointment & clear user cart
// @route   POST /api/appointments/book
router.post('/book', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;

    if (!doctorId || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Doctor ID and time slot are required.' });
    }

    // 1. Create the appointment record
    const appointmentDate = date ? new Date(date) : new Date();
    const newAppointment = new Appointment({
      patientId: req.user.userId,
      doctorId,
      date: appointmentDate,
      timeSlot,
      status: 'Confirmed', // Automatically confirm for smooth demo
      paymentStatus: 'Pending'
    });

    await newAppointment.save();
    console.log(`✅ Appointment registered successfully! ID: ${newAppointment._id}`);

    // 2. Clear user cart in database
    console.log(`🧹 Clearing cart for user: ${req.user.userId}`);
    await Cart.findOneAndDelete({ user: req.user.userId });
    console.log('✅ Cart database record cleared successfully.');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Cart cleared!',
      data: newAppointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user's appointments (Patient or Doctor)
// @route   GET /api/appointments/my
router.get('/my', protect, async (req, res) => {
  try {
    // Find appointments where user is either patient or doctor
    const query = {
      $or: [
        { patientId: req.user.userId },
        { doctorId: req.user.userId }
      ]
    };

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ date: -1, timeSlot: 1 });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
