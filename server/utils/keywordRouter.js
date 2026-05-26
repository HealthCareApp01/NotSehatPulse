import DoctorProfile from '../models/DoctorProfile.js';

const SPECIALIZATION_KEYWORDS = {
  'Cardiologist': ['heart', 'chest pain', 'blood pressure', 'bp', 'palpitation',
                   'cardiac', 'cholesterol', 'heartbeat', 'ecg'],
  'Dermatologist': ['skin', 'acne', 'rash', 'eczema', 'hair loss', 'pimple',
                    'allergy', 'itching', 'fungal', 'redness', 'dandruff'],
  'Pediatrician': ['child', 'baby', 'infant', 'kid', 'vaccination',
                   'toddler', 'newborn', 'teething'],
  'Neurologist': ['headache', 'migraine', 'nerve', 'brain', 'dizziness',
                  'seizure', 'numbness', 'vertigo', 'memory', 'tremor',
                  'vomiting', 'nausea']
};

export function detectSpecialization(messageContent) {
  if (!messageContent) return null;
  const lower = messageContent.toLowerCase();
  
  for (const [spec, keywords] of Object.entries(SPECIALIZATION_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return spec;
    }
  }
  return null;
}

export async function assignDoctor(specialization) {
  try {
    // Find all verified doctors with this specialization
    // Note: We need to populate userId to ensure the user is still active and has role Doctor
    const doctors = await DoctorProfile.find({ 
      specialization: new RegExp(`^${specialization}$`, 'i'),
      verified: true 
    }).populate('userId');

    const validDoctors = doctors.filter(doc => doc.userId && doc.userId.role === 'Doctor');

    if (validDoctors.length === 0) {
      return null;
    }

    // For simplicity right now, pick a random verified doctor of this spec.
    // (Could be upgraded to check active workload later)
    const randomIndex = Math.floor(Math.random() * validDoctors.length);
    return validDoctors[randomIndex].userId._id;
  } catch (error) {
    console.error('Error in assignDoctor:', error);
    return null;
  }
}
