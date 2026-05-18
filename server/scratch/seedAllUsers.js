import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import PatientProfile from '../models/PatientProfile.js';

dotenv.config();

const doctorsData = [
  { name: 'Dr. Sarah Jenkins', email: 'dr.jenkins@sehatpulse.com', spec: 'Cardiologist', deg: 'M.B.B.S, M.D. (Cardiology)', exp: 15, fee: 800, rating: 4.9, bio: 'Senior cardiologist specializing in interventional cardiology and preventive vascular therapies.' },
  { name: 'Dr. Amit Verma', email: 'dr.verma@sehatpulse.com', spec: 'Neurologist', deg: 'M.B.B.S, D.M. (Neurology)', exp: 18, fee: 1000, rating: 4.9, bio: 'Renowned neurologist specialized in post-stroke rehabilitation, epilepsy, and migraine treatment.' },
  { name: 'Dr. Priya Nair', email: 'dr.nair@sehatpulse.com', spec: 'Pediatrician', deg: 'M.B.B.S, M.D. (Pediatrics)', exp: 12, fee: 500, rating: 4.8, bio: 'Compassionate pediatrician dedicated to pediatric immunizations and childhood developmental health.' },
  { name: 'Dr. Rohan Sharma', email: 'dr.sharma@sehatpulse.com', spec: 'Dermatologist', deg: 'M.B.B.S, D.D.V.L (Dermatology)', exp: 9, fee: 600, rating: 4.7, bio: 'Consultant dermatologist focused on clinical acne care, skin cancers, and advanced cosmetic procedures.' },
  { name: 'Dr. Elena Rostova', email: 'dr.rostova@sehatpulse.com', spec: 'Dermatologist', deg: 'M.D. (Dermatology & Venereology)', exp: 14, fee: 750, rating: 4.8, bio: 'Expert clinical dermatologist specializing in chronic eczema, anti-aging therapies, and pediatric dermatology.' },
  { name: 'Dr. Matthew Carter', email: 'dr.carter@sehatpulse.com', spec: 'Cardiologist', deg: 'M.B.B.S, F.A.C.C', exp: 22, fee: 1200, rating: 4.9, bio: 'Professor of Cardiology specializing in valvular heart disease and complex rhythm disorders.' },
  { name: 'Dr. Sofia Martinez', email: 'dr.martinez@sehatpulse.com', spec: 'Pediatrician', deg: 'M.B.B.S, M.D. (Pediatrics)', exp: 8, fee: 450, rating: 4.7, bio: 'Experienced in pediatric acute care, allergy diagnostics, and nutrition planning for newborns.' },
  { name: 'Dr. Kenneth Liang', email: 'dr.liang@sehatpulse.com', spec: 'Neurologist', deg: 'M.D., Ph.D. (Neurosciences)', exp: 16, fee: 900, rating: 4.8, bio: 'Consultant in neuromuscular disorders, peripheral neuropathies, and cognitive neuro-wellness.' },
  { name: 'Dr. Chloe DuPont', email: 'dr.dupont@sehatpulse.com', spec: 'Dermatologist', deg: 'M.D. (Dermatopathology)', exp: 11, fee: 700, rating: 4.8, bio: 'Expert in skin biopsies, psoriasis care, chemical peels, and chronic inflammatory skin issues.' },
  { name: 'Dr. Rajesh Khanna', email: 'dr.khanna@sehatpulse.com', spec: 'Cardiologist', deg: 'M.B.B.S, D.M. (Cardiology)', exp: 25, fee: 1500, rating: 4.9, bio: 'Director of Cardiology with expertise in coronary angioplasty, pacemaker installations, and heart failure care.' },
  { name: 'Dr. Olivia Vance', email: 'dr.vance@sehatpulse.com', spec: 'Pediatrician', deg: 'M.B.B.S, D.C.H (Pediatrics)', exp: 10, fee: 500, rating: 4.7, bio: 'Specialist in pediatric asthma, childhood infections, growth assessment, and immunizations.' },
  { name: 'Dr. Marcus Thorne', email: 'dr.thorne@sehatpulse.com', spec: 'Neurologist', deg: 'M.B.B.S, D.N.B (Neurology)', exp: 20, fee: 1100, rating: 4.9, bio: 'Senior neurologist focusing on Parkinson disease, movement disorders, and neurodegenerative conditions.' },
  { name: 'Dr. Yasmin Al-Fayed', email: 'dr.alfayed@sehatpulse.com', spec: 'Dermatologist', deg: 'M.B.B.S, M.S. (Dermatology)', exp: 7, fee: 550, rating: 4.6, bio: 'Clinical practitioner in laser resurfacing, hair-fall treatments, and customized skincare regimens.' },
  { name: 'Dr. David Miller', email: 'dr.miller@sehatpulse.com', spec: 'Cardiologist', deg: 'M.B.B.S, M.R.C.P (Cardiology)', exp: 14, fee: 850, rating: 4.8, bio: 'Interventional specialist focusing on hypertension, radial angioplasty, and cardiovascular risk profiling.' },
  { name: 'Dr. Lisa Zhang', email: 'dr.zhang@sehatpulse.com', spec: 'Pediatrician', deg: 'M.D. (Pediatrics)', exp: 15, fee: 600, rating: 4.8, bio: 'Dedicated child health expert focusing on adolescent counseling, juvenile diabetes, and thyroid tracking.' },
  { name: 'Dr. Julian Vance', email: 'dr.j.vance@sehatpulse.com', spec: 'Neurologist', deg: 'M.B.B.S, M.D. (Neurology)', exp: 13, fee: 950, rating: 4.7, bio: 'Specialist in clinical epilepsy management, electroencephalography (EEG), and sleep disorders.' },
  { name: 'Dr. Fiona Gallagher', email: 'dr.gallagher@sehatpulse.com', spec: 'Dermatologist', deg: 'M.B.B.S, D.D.V', exp: 8, fee: 600, rating: 4.6, bio: 'Focuses on pediatric eczema, contact dermatitis, customized skin-cleansing therapies, and scar removal.' },
  { name: 'Dr. Arjun Mehta', email: 'dr.mehta@sehatpulse.com', spec: 'Cardiologist', deg: 'M.B.B.S, D.N.B (Cardiology)', exp: 19, fee: 1100, rating: 4.8, bio: 'Expert in echocardiography, stress tests, congenital heart conditions, and lipid disorders.' },
  { name: 'Dr. Emily Watson', email: 'dr.watson@sehatpulse.com', spec: 'Pediatrician', deg: 'M.D., F.A.A.P', exp: 16, fee: 700, rating: 4.9, bio: 'Specializes in neonatal intensive care, pediatric infectious diseases, and developmental screenings.' },
  { name: 'Dr. Thomas Wright', email: 'dr.wright@sehatpulse.com', spec: 'Neurologist', deg: 'M.D. (Neurology), D.M.', exp: 24, fee: 1300, rating: 4.9, bio: 'Expert in spinal cord disorders, stroke prevention, multiple sclerosis, and advanced neuro-diagnostics.' }
];

const patientsData = [
  { name: 'Aarav Patel', email: 'aarav@sehatpulse.com', history: 'Eczema and childhood asthma.' },
  { name: 'Emily Smith', email: 'emily@sehatpulse.com', history: 'No chronic diseases. Annual checkups.' },
  { name: 'James Johnson', email: 'james@sehatpulse.com', history: 'Managed hypertension and high cholesterol.' },
  { name: 'Priya Sharma', email: 'priya@sehatpulse.com', history: 'Seasonal dust and pollen allergies.' },
  { name: 'Michael Brown', email: 'michael@sehatpulse.com', history: 'Type 2 diabetes managed with metformin.' },
  { name: 'Sarah Davis', email: 'sarah@sehatpulse.com', history: 'No major medical history.' },
  { name: 'David Wilson', email: 'david@sehatpulse.com', history: 'Chronic migraine headaches.' },
  { name: 'Linda Taylor', email: 'linda@sehatpulse.com', history: 'Mild hypothyroidism under levothyroxine treatment.' },
  { name: 'Robert Thomas', email: 'robert@sehatpulse.com', history: 'Healthy, no prior hospitalization.' },
  { name: 'Anita Gupta', email: 'anita@sehatpulse.com', history: 'Mild asthma managed with inhalers.' },
  { name: 'William Anderson', email: 'william@sehatpulse.com', history: 'Borderline high cholesterol, managed by diet.' },
  { name: 'Elizabeth Thomas', email: 'elizabeth@sehatpulse.com', history: 'Healthy. Regular physical training history.' },
  { name: 'Vikram Rao', email: 'vikram@sehatpulse.com', history: 'Lower back muscle strain due to posture.' },
  { name: 'Jennifer Garcia', email: 'jennifer@sehatpulse.com', history: 'No medical conditions.' },
  { name: 'Charles Martinez', email: 'charles@sehatpulse.com', history: 'Mild osteoarthritis in left knee.' },
  { name: 'Susan Robinson', email: 'susan@sehatpulse.com', history: 'Healthy. No surgical history.' },
  { name: 'Arjun Deshmukh', email: 'arjun@sehatpulse.com', history: 'Chronic gastroesophageal reflux disease (GERD).' },
  { name: 'Margaret Clark', email: 'margaret@sehatpulse.com', history: 'No major chronic conditions.' },
  { name: 'Daniel Rodriguez', email: 'daniel@sehatpulse.com', history: 'Chronic sinusitis managed seasonally.' },
  { name: 'Patricia Lewis', email: 'patricia@sehatpulse.com', history: 'No major illnesses.' }
];

async function seedDB() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
  
  console.log('🔌 Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database.');

    // 1. Process Doctors
    console.log(`\n👨‍⚕️ Seeding ${doctorsData.length} Doctors...`);
    const salt = await bcrypt.genSalt(10);
    const doctorPassword = await bcrypt.hash('DoctorPassword123!', salt);

    for (const d of doctorsData) {
      let user = await User.findOne({ email: d.email });
      if (!user) {
        user = new User({
          name: d.name,
          email: d.email,
          password: doctorPassword,
          role: 'Doctor',
          isVerified: true
        });
        await user.save();
      } else {
        user.name = d.name;
        await user.save();
      }

      let profile = await DoctorProfile.findOne({ userId: user._id });
      const docProfileData = {
        specialization: d.spec,
        degree: d.deg,
        experience: d.exp,
        consultationFee: d.fee,
        rating: d.rating,
        bio: d.bio,
        verified: true,
        availability: [
          { day: 'Mon', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'] },
          { day: 'Wed', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 5:00 PM'] },
          { day: 'Fri', slots: ['10:00 AM - 1:00 PM', '2:00 PM - 4:00 PM'] }
        ]
      };

      if (!profile) {
        profile = new DoctorProfile({ userId: user._id, ...docProfileData });
      } else {
        Object.assign(profile, docProfileData);
      }
      await profile.save();
    }
    console.log(`✅ Doctor users and profiles seeded successfully!`);

    // 2. Process Patients
    console.log(`\n🤒 Seeding ${patientsData.length} Patients...`);
    const patientPassword = await bcrypt.hash('PatientPassword123!', salt);

    for (const p of patientsData) {
      let user = await User.findOne({ email: p.email });
      if (!user) {
        user = new User({
          name: p.name,
          email: p.email,
          password: patientPassword,
          role: 'Patient',
          isVerified: true
        });
        await user.save();
      } else {
        user.name = p.name;
        await user.save();
      }

      let profile = await PatientProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = new PatientProfile({
          userId: user._id,
          medicalHistory: p.history,
          uploadedPrescriptions: [],
          pastReports: []
        });
      } else {
        profile.medicalHistory = p.history;
      }
      await profile.save();
    }
    console.log(`✅ Patient users and profiles seeded successfully!`);

    console.log('\n🎉 ALL 40 FAKE USERS (20 DOCTORS & 20 PATIENTS) SEEDED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
    process.exit(0);
  }
}

seedDB();
