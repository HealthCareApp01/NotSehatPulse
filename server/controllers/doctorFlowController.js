import mongoose from 'mongoose';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';
import Appointment from '../models/Appointment.js';

// ==========================================
// 1. Doctor Registration Controller
// ==========================================
export const registerDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { name, email, password, specialization, degree, experience, consultationFee } = req.body;

    // Create Base User as 'Patient' and unverified
    const newUser = new User({
      name,
      email,
      password, // Note: Always hash passwords in production (e.g., using bcrypt)
      role: 'Patient',
      isVerified: false
    });
    await newUser.save({ session });

    // Create Doctor Profile
    const doctorProfile = new DoctorProfile({
      userId: newUser._id,
      specialization,
      degree,
      experience,
      consultationFee
    });
    await doctorProfile.save({ session });

    // Create blank Patient Profile for the doctor
    const patientProfile = new PatientProfile({
      userId: newUser._id
    });
    await patientProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      message: 'Doctor registered successfully. Pending admin verification.', 
      userId: newUser._id 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};


// ==========================================
// 2. Admin Verification Controller
// ==========================================
export const verifyDoctor = async (req, res) => {
  try {
    const { userId } = req.body;

    // Elevate User role and verification
    const userUpdate = await User.findByIdAndUpdate(
      userId, 
      { role: 'Doctor', isVerified: true },
      { new: true }
    );

    if (!userUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify Doctor Profile
    await DoctorProfile.findOneAndUpdate(
      { userId: userId },
      { verified: true },
      { new: true }
    );

    res.status(200).json({ message: 'Doctor verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ==========================================
// 3. Appointment Booking Controller
// ==========================================
export const bookAppointment = async (req, res) => {
  try {
    const { patientUserId, doctorUserId, date, timeSlot } = req.body;

    // Validate Doctor exists and is actually verified
    const doctor = await User.findOne({ _id: doctorUserId, role: 'Doctor', isVerified: true });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid or unverified doctor selected.' });
    }

    // Validate Patient exists (Notice we DO NOT restrict by role here)
    const patient = await User.findById(patientUserId);
    if (!patient) {
      return res.status(400).json({ message: 'Invalid patient ID.' });
    }

    // Create Appointment
    const appointment = new Appointment({
      patientId: patientUserId,
      doctorId: doctorUserId,
      date,
      originalBookingDate: date,
      timeSlot,
      status: 'Pending'
    });

    await appointment.save();

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ==========================================
// 4. Doctor's Appointment Dashboard Controller
// ==========================================
export const getDoctorAppointments = async (req, res) => {
  try {
    // Assuming doctorId comes from auth middleware, using params/query for example
    // Adjust based on how your authentication middleware sets the user.
    const doctorId = req.user ? req.user.id : req.params.doctorId; 

    // 1. Fetch appointments and populate basic User details for the patient
    const appointments = await Appointment.find({ doctorId })
      .populate({
        path: 'patientId',
        select: 'name email profilePicture' // Only basic info
      })
      .sort({ date: 1 });

    // 2. Manually attach PatientProfile data to guarantee strict privacy
    // We map through appointments to fetch exactly what we need from PatientProfile
    const appointmentsWithPatientData = await Promise.all(appointments.map(async (appt) => {
      // Find the patient profile linked to this user ID
      const patientProfile = await PatientProfile.findOne({ userId: appt.patientId._id })
        .select('age medicalHistory allergy disease'); // Fetch strictly medical data

      // Convert mongoose doc to plain JS object to easily append data
      const apptData = appt.toObject(); 

      // Attach the medical profile. 
      // DoctorProfile is completely untouched and ignored here.
      apptData.patientMedicalDetails = patientProfile; 
      
      return apptData;
    }));

    res.status(200).json(appointmentsWithPatientData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
