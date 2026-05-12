import { motion } from 'framer-motion';
import { Star, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    spec: 'Cardiologist',
    exp: '12 Yrs',
    rating: '4.9',
    fee: '₹500',
    img: 'https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    spec: 'Dermatologist',
    exp: '8 Yrs',
    rating: '4.8',
    fee: '₹400',
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 3,
    name: 'Dr. Amrita Singh',
    spec: 'Pediatrician',
    exp: '15 Yrs',
    rating: '4.9',
    fee: '₹600',
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    spec: 'Neurologist',
    exp: '10 Yrs',
    rating: '4.7',
    fee: '₹800',
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
  },
];

const DoctorsCarousel = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-text">Our Expert Doctors</h2>
            <p className="text-slate-500 mt-2">Book consultations with verified specialists</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">←</button>
            <button className="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">→</button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar">
          {doctors.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ y: -10 }}
              className="min-w-[300px] bg-white rounded-[32px] p-6 shadow-sm border border-secondary hover:shadow-xl hover:shadow-primary/10 transition-all group"
            >
              <div className="relative mb-6">
                <img 
                  src={doc.img} 
                  alt={doc.name} 
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {doc.rating}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-text">{doc.name}</h3>
                    <p className="text-primary font-semibold text-sm">{doc.spec}</p>
                  </div>
                  <div className="bg-secondary text-primary-dark px-2 py-1 rounded-lg text-xs font-bold">
                    {doc.exp}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-500 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    Available Today
                  </div>
                </div>

                <div className="pt-4 border-t border-secondary flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">Consultation Fee</span>
                    <span className="text-xl font-bold text-text">{doc.fee}</span>
                  </div>
                  <button
                    onClick={() => navigate('/find-doctors')}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsCarousel;
