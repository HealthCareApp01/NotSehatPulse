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
    // Missed Appointment Self-Healing Scan
    const now = new Date();
    const missedApts = await Appointment.find({
      $or: [
        { patientId: req.user.userId },
        { doctorId: req.user.userId }
      ],
      status: { $in: ['Pending', 'Confirmed'] },
      date: { $lt: now }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const apt of missedApts) {
      const doctorProfile = await DoctorProfile.findOne({ userId: apt.doctorId });
      let rescheduled = false;

      const availability = doctorProfile?.availability || [];
      const docAvailability = availability.length > 0 ? availability : [
        { day: 'Mon', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Tue', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Wed', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Thu', slots: ['10:00 AM - 4:00 PM'] },
        { day: 'Fri', slots: ['10:00 AM - 4:00 PM'] }
      ];

      const missedDate = new Date(apt.date);

      for (let offset = 1; offset <= 6; offset++) {
        const checkDate = new Date(missedDate);
        checkDate.setDate(missedDate.getDate() + offset);

        // Skip Sunday (getDay() === 0)
        if (checkDate.getDay() === 0) {
          continue;
        }

        const checkDayName = dayNames[checkDate.getDay()];
        const slotForDay = docAvailability.find(a => a.day === checkDayName);

        if (slotForDay && slotForDay.slots && slotForDay.slots.length > 0) {
          const chosenSlot = slotForDay.slots[0];

          // Push to history
          apt.rescheduleHistory.push({
            originalDate: apt.date,
            originalTimeSlot: apt.timeSlot,
            reason: 'Appointment missed - automatically rescheduled'
          });

          apt.date = checkDate;
          apt.timeSlot = `${checkDayName} (${chosenSlot})`;
          apt.status = 'Postponed'; // Postponed signifies rescheduled
          await apt.save();
          rescheduled = true;
          break;
        }
      }

      if (!rescheduled) {
        apt.status = 'Cancelled';
        apt.rescheduleHistory.push({
          originalDate: apt.date,
          originalTimeSlot: apt.timeSlot,
          reason: 'Appointment missed - failed to auto-reschedule (no availability in next 6 days)'
        });
        await apt.save();
      }
    }

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

export default router;
