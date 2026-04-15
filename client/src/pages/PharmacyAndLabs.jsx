import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Upload, 
  FileText, 
  ShoppingCart, 
  Beaker, 
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const medicines = [
  { id: 1, name: 'Paracetamol 500mg', price: '₹40', category: 'Fever' },
  { id: 2, name: 'Amoxicillin 250mg', price: '₹120', category: 'Antibiotic' },
  { id: 3, name: 'Cetirizine 10mg', price: '₹30', category: 'Allergy' },
];

const PharmacyAndLabs = () => {
  const [activeTab, setActiveTab] = useState('pharmacy'); // 'pharmacy' or 'labs'
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileUpload = () => {
    setIsUploading(true);
    // Simulate LLM analysis
    setTimeout(() => {
      setAnalysisResult({
        medicines: [
          { name: 'Augmentin 625 DUO', dosage: 'Twice a day', duration: '5 days' },
          { name: 'Pan 40', dosage: 'Once a day (Empty stomach)', duration: '5 days' }
        ],
        tests: [
          { code: 'CBC', name: 'Complete Blood Count', price: '₹299' },
          { code: 'CRP', name: 'C-Reactive Protein', price: '₹450' }
        ]
      });
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-text">Pharmacy & Labs</h1>
          <p className="text-slate-500 mt-2">Order medicines and book lab tests instantly.</p>
        </div>
        <div className="bg-white p-1.5 rounded-2xl border border-secondary flex gap-2">
          <button 
            onClick={() => setActiveTab('pharmacy')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'pharmacy' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}
          >
            E-Pharmacy
          </button>
          <button 
            onClick={() => setActiveTab('labs')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'labs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary'}`}
          >
            Lab Tests
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Upload and Search */}
        <div className="lg:col-span-2 space-y-10">
          {/* Prescription Upload Card */}
          <div className="bg-white border-2 border-dashed border-primary/30 p-10 rounded-[40px] text-center hover:bg-primary/5 transition-all cursor-pointer group relative overflow-hidden">
             <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
             />
             <div className="w-20 h-20 bg-secondary rounded-3xl mx-auto flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
               {isUploading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Upload /></motion.div> : <Upload size={32} />}
             </div>
             <h3 className="text-2xl font-bold text-text mb-2">Upload Prescription</h3>
             <p className="text-slate-400 max-w-sm mx-auto mb-6">
                Our AI will automatically extract medicines and tests to save your time.
             </p>
             <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-secondary text-xs font-bold text-slate-500 shadow-sm">
                <CheckCircle2 size={14} className="text-green-500" /> Supports JPG, PNG, PDF
             </div>
          </div>

          {/* Analysis Results Display */}
          {analysisResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[40px] border border-primary/30 shadow-xl shadow-primary/5"
            >
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-secondary">
                 <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                   <FileText size={20} />
                 </div>
                 <h3 className="text-xl font-bold text-text underline decoration-primary/30">Extracted Prescription Details</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Recommended Medicines</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.medicines.map((med, idx) => (
                      <div key={idx} className="bg-secondary/30 p-4 rounded-2xl flex justify-between items-center group">
                        <div>
                          <span className="block font-bold text-text">{med.name}</span>
                          <span className="text-xs text-slate-500">{med.dosage} • {med.duration}</span>
                        </div>
                        <button className="bg-white p-2 rounded-xl text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all">
                          <Plus size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">Recommended Lab Tests</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.tests.map((test, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-text rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                            {test.code}
                          </div>
                          <div>
                            <span className="block font-bold text-text text-sm">{test.name}</span>
                            <span className="text-xs text-primary font-bold">{test.price}</span>
                          </div>
                        </div>
                        <button className="bg-white p-2 rounded-xl text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all">
                          <Plus size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Manual Search */}
          <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-text">Manual {activeTab === 'pharmacy' ? 'Medicine' : 'Lab Test'} Search</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {medicines.map(med => (
                  <div key={med.id} className="bg-white p-6 rounded-3xl border border-secondary shadow-sm hover:border-primary/30 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">{med.category}</span>
                    <h4 className="font-bold text-text mb-4">{med.name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black">{med.price}</span>
                      <button className="bg-secondary text-primary p-2 rounded-xl hover:bg-primary hover:text-white transition-all">
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Cart and Info */}
        <div className="space-y-10">
          <div className="bg-white p-8 rounded-[40px] border border-secondary shadow-sm">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-text">Your Cart</h3>
               <ShoppingCart className="text-slate-300" />
             </div>
             <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-300">
                   <ShoppingCart />
                </div>
                <p className="text-slate-400 font-medium italic">Cart is empty</p>
             </div>
             <button disabled className="w-full py-4 bg-secondary text-text/40 rounded-2xl font-bold transition-all">
               Place Order
             </button>
          </div>

          <div className="bg-text text-white p-8 rounded-[40px] shadow-sm relative overflow-hidden">
             <div className="relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                 <AlertCircle className="text-primary" />
               </div>
               <h3 className="text-lg font-bold mb-2">Report Analysis</h3>
               <p className="text-white/40 text-sm mb-6 leading-relaxed">
                 Already have a report? Upload it to get an easy-to-understand AI summary of your health stats.
               </p>
               <button className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors">
                 Analyze Report
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyAndLabs;
