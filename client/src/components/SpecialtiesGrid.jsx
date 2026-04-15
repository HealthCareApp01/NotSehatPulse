import React from 'react';
import { motion } from 'framer-motion';
import { Baby, Activity, Heart, Eye, Brain, Stethoscope } from 'lucide-react';

const specialties = [
  { name: 'Pediatrics', icon: <Baby size={32} />, color: 'bg-blue-50 text-blue-600' },
  { name: 'Gynaecology', icon: <Heart size={32} />, color: 'bg-pink-50 text-pink-600' },
  { name: 'Dermatology', icon: <Activity size={32} />, color: 'bg-orange-50 text-orange-600' },
  { name: 'Oncology', icon: <Brain size={32} />, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Physician', icon: <Stethoscope size={32} />, color: 'bg-green-50 text-green-600' },
  { name: 'Ophthalmology', icon: <Eye size={32} />, color: 'bg-purple-50 text-purple-600' },
];

const SpecialtiesGrid = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-text">Consult Top Specialties</h2>
            <p className="text-slate-500 mt-2">Professional advice for all your health concerns</p>
          </div>
          <button className="text-primary font-bold hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {specialties.map((spec, index) => (
            <motion.div
              key={spec.name}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center p-8 rounded-[32px] border border-secondary hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group"
            >
              <div className={`w-16 h-16 ${spec.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {spec.icon}
              </div>
              <h3 className="font-bold text-text text-center">{spec.name}</h3>
              <span className="text-primary text-xs font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Consult Now</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesGrid;
