import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SpecialtiesGrid from './components/SpecialtiesGrid';
import DoctorsCarousel from './components/DoctorsCarousel';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <SpecialtiesGrid />
        <DoctorsCarousel />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

export default App;
