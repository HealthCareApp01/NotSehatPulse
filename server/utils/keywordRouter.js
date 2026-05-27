import DoctorProfile from '../models/DoctorProfile.js';

// In-memory pointer for round-robin assignment
const lastAssignedIndex = {};

export async function assignDoctor(specialization) {
  try {
    if (!specialization) return null;

    // Find all verified doctors with this specialization
    const doctors = await DoctorProfile.find({ 
      specialization: new RegExp(`^${specialization}$`, 'i'),
      verified: true 
    }).populate('userId');

    const validDoctors = doctors.filter(doc => doc.userId && doc.userId.role === 'Doctor');

    if (validDoctors.length === 0) {
      return null;
    }

    // Initialize pointer if not exists
    const specKey = specialization.toLowerCase();
    if (lastAssignedIndex[specKey] === undefined) {
      lastAssignedIndex[specKey] = 0;
    }

    // Assign based on current pointer
    let currentIndex = lastAssignedIndex[specKey];
    if (currentIndex >= validDoctors.length) {
      currentIndex = 0; // Wrap around if doctors were removed
    }

    const assignedDoctor = validDoctors[currentIndex].userId._id;

    // Increment pointer for next assignment
    lastAssignedIndex[specKey] = (currentIndex + 1) % validDoctors.length;

    return assignedDoctor;
  } catch (error) {
    console.error('Error in assignDoctor:', error);
    return null;
  }
}

