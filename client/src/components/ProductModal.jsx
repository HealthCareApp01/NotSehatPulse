import React from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingCart, Tag, ShieldCheck, Clock, CheckCircle2, Star } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product, onAddToCart, isLabTest = false }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-[40px] max-w-2xl w-full shadow-2xl relative border border-secondary flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors z-20 cursor-pointer backdrop-blur-sm shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Left Side: Image Area */}
        <div className="md:w-1/2 relative bg-secondary/20 flex-shrink-0 min-h-[300px]">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-primary shadow-sm flex items-center gap-2">
            <Tag size={14} />
            {isLabTest ? product.brand : product.category}
          </div>
        </div>

        {/* Right Side: Details Area */}
        <div className="md:w-1/2 p-8 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-amber-400">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} className="text-slate-200" />
            </div>
            <span className="text-xs font-bold text-slate-400">(128 Reviews)</span>
          </div>

          <h2 className="text-3xl font-black text-text mb-4 leading-tight">{product.name}</h2>
          
          <div className="flex-1 space-y-6">
            <div>
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Detailed Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex gap-3 items-center">
                <ShieldCheck size={24} className="text-emerald-500" />
                <div>
                  <span className="block text-[10px] font-bold text-emerald-600/70 uppercase">Authenticity</span>
                  <span className="block text-xs font-black text-emerald-700">100% Genuine</span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl flex gap-3 items-center">
                <Clock size={24} className="text-blue-500" />
                <div>
                  <span className="block text-[10px] font-bold text-blue-600/70 uppercase">Delivery Time</span>
                  <span className="block text-xs font-black text-blue-700">{isLabTest ? 'Same Day' : 'Within 60 Mins'}</span>
                </div>
              </div>
            </div>

            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <CheckCircle2 size={16} className="text-primary" />
                {isLabTest ? 'Home sample collection available' : 'Easy returns policy'}
              </li>
              <li className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <CheckCircle2 size={16} className="text-primary" />
                {isLabTest ? 'E-Reports within 24 hours' : 'Requires valid prescription (if applicable)'}
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-secondary">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Final Price</span>
                <span className="text-4xl font-black text-text">₹{product.price}</span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">15% OFF</span>
                <span className="text-xs text-slate-400 line-through">₹{Math.floor(product.price * 1.15)}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20 hover:bg-primary-dark flex items-center justify-center gap-3 cursor-pointer group"
            >
              <ShoppingCart className="group-hover:-translate-x-1 transition-transform" />
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductModal;
