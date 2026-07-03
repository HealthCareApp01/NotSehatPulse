import express from 'express';
import {
  registerDoctor,
  verifyDoctor,
  bookAppointment,
  getDoctorAppointments
} from '../controllers/doctorFlowController.js';

const router = express.Router();

// 1. Doctor Registration
router.post('/register', registerDoctor);

// 2. Admin Verification (Typically protected by admin auth middleware)
router.post('/admin/verify', verifyDoctor);

// 3. Appointment Booking (Typically protected by user auth middleware)
router.post('/appointments/book', bookAppointment);

// 4. Doctor's Appointment Dashboard (Typically protected by doctor auth middleware)
// Assuming doctorId is passed as a param if not using req.user
router.get('/appointments/doctor/:doctorId', getDoctorAppointments);

export default router;
