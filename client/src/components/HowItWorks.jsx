import React from 'react';
import { Search, Calendar, Video } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Find Your Specialist',
    desc: 'Search from our wide range of verified doctors by specialty or name.',
    icon: <Search className="text-white" size={32} />,
  },
  {
    id: 2,
    title: 'Book a Slot',
    desc: 'Choose a convenient time and pay securely via our payment gateway.',
    icon: <Calendar className="text-white" size={32} />,
  },
  {
    id: 3,
    title: 'Start Consultation',
    desc: 'Connect with your doctor via high-quality video call or chat.',
    icon: <Video className="text-white" size={32} />,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-text mb-4">How it Works</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-16">
          Getting professional healthcare advice is now simple, secure, and fast.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 bg-secondary -z-10" />

          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center medical-gradient mb-6 shadow-xl shadow-primary/20 transform group-hover:rotate-6 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-text mb-4">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
