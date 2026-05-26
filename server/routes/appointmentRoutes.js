import express from 'express';
import Appointment from '../models/Appointment.js';
import Cart from '../models/Cart.js';
import DoctorProfile from '../models/DoctorProfile.js';
import { protect } from '../middleware/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Sd7HXWLedK9qh5',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'iQDFb0ou7FKbi0xmuERWI6VQ'
});

// @desc    Create Razorpay Order for Doctor Appointment
// @route   POST /api/appointments/pay/create-order
router.post('/pay/create-order', protect, async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required.' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
    const fee = doctorProfile?.consultationFee || 500;

    const options = {
      amount: Math.round(fee * 100), // in paise
      currency: 'INR',
      receipt: `receipt_appt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order for appointment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Book a new appointment (verify payment & register)
// @route   POST /api/appointments/book
router.post('/book', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!doctorId || !timeSlot || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'All booking and payment details are required.' });
    }

    // Cryptographic Signature Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'iQDFb0ou7FKbi0xmuERWI6VQ')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Create the appointment record (ONLY on payment success)
    const appointmentDate = date ? new Date(date) : new Date();
    const newAppointment = new Appointment({
      patientId: req.user.userId,
      doctorId,
      date: appointmentDate,
      originalBookingDate: appointmentDate,
      timeSlot,
      status: 'Confirmed', // Automatically confirm for smooth demo
      paymentStatus: 'Completed',
      paymentId: razorpay_payment_id
    });

    await newAppointment.save();
    console.log(`✅ Appointment registered successfully! ID: ${newAppointment._id}`);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
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

    const populatedApts = [];
    for (const apt of appointments) {
      const aptObj = apt.toObject();
      if (aptObj.doctorId) {
        const profile = await DoctorProfile.findOne({ userId: aptObj.doctorId._id });
        aptObj.doctorId.specialization = profile?.specialization || 'General Physician';
      }
      populatedApts.push(aptObj);
    }

    res.json({
      success: true,
      data: populatedApts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark appointment as consulted
// @route   POST /api/appointments/:id/consulted
router.post('/:id/consulted', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    appointment.status = 'Completed';
    await appointment.save();
    
    res.json({ success: true, message: 'Appointment marked as consulted', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Doctor requests a reschedule
// @route   POST /api/appointments/:id/request-reschedule
router.post('/:id/request-reschedule', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    appointment.doctorRequestedReschedule = true;
    appointment.status = 'Postponed';
    await appointment.save();
    
    res.json({ success: true, message: 'Reschedule request sent to patient', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Patient reschedules appointment
// @route   POST /api/appointments/:id/patient-reschedule
router.post('/:id/patient-reschedule', protect, async (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    appointment.rescheduleHistory.push({
      originalDate: appointment.date,
      originalTimeSlot: appointment.timeSlot,
      reason: 'Patient accepted reschedule'
    });
    
    appointment.date = new Date(newDate);
    appointment.timeSlot = newTimeSlot;
    appointment.doctorRequestedReschedule = false;
    appointment.status = 'Postponed';
    
    await appointment.save();
    
    res.json({ success: true, message: 'Appointment rescheduled successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Move patient to last in today's queue
// @route   POST /api/appointments/:id/move-to-last
router.post('/:id/move-to-last', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    // Increment queuePosition to place them at the end.
    // A simple approach is to use Date.now() as queuePosition so it's always the highest.
    appointment.queuePosition = Date.now();
    await appointment.save();
    
    res.json({ success: true, message: 'Patient moved to the end of the queue', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
