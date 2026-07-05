import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Layers, Zap, GlassWater } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SLIDE_IMAGES = [
  {
    url: 'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'EDUCACIÓN COOPERATIVA',
    desc: 'Sembrando conciencia y corresponsabilidad ecológica en las aulas de Cajamarca.'
  },
  {
    url: 'https://images.pexels.com/photos/6591428/pexels-photo-6591428.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'SEGREGACIÓN EFICIENTE',
    desc: 'Canalizando el reciclaje de plástico, aluminio y cartón con trazabilidad total.'
  },
  {
    url: 'https://images.pexels.com/photos/31438304/pexels-photo-31438304.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'TECNOLOGÍA DE SEGUIMIENTO',
    desc: 'Monitoreo de gases de efecto invernadero evitados y bonus de carbón en tiempo real.'
  },
  {
    url: 'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'DESARROLLO SOSTENIBLE',
    desc: 'Transformando residuos en recursos tangibles para equipar nuestras escuelas.'
  }
];

export default function FuturisticImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 4500); // Transitions every 4.5s
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDE_IMAGES.length);
  };

  return (
    <div className="space-y-4" id="slider-and-materials-block">
      {/* 1. THE SLIDER (WITHOUT DARK OVERLAYS / FILTERS OVER IMAGE) */}
      <div 
        className="relative w-full h-[260px] md:h-[340px] bg-emerald-950 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-200 group/slider"
        id="futuristic-image-slider-container"
      >
        {/* Slide Images Container */}
        <div className="absolute inset-0 w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              {/* The Image (Vivid, 100% brightness, original colors) */}
              <img 
                src={SLIDE_IMAGES[currentIndex].url} 
                alt={SLIDE_IMAGES[currentIndex].title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* High-contrast Elegant Overlay behind text only */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-20 max-w-xl select-none">
                <div className="bg-emerald-950/90 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 shadow-2xl space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black tracking-[0.2em] text-emerald-400 uppercase">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {SLIDE_IMAGES[currentIndex].title}
                  </span>
                  <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight font-display">
                    ECOLOGICAL RACE 2026
                  </h3>
                  <p className="text-[11px] md:text-xs text-slate-200 font-medium leading-relaxed">
                    {SLIDE_IMAGES[currentIndex].desc}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/95 hover:bg-emerald-55 font-bold border border-slate-200 text-slate-700 flex items-center justify-center shadow-lg transition-all duration-300 hover:text-emerald-700 hover:scale-105 cursor-pointer opacity-0 group-hover/slider:opacity-100"
          id="btn-slider-prev"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button 
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/95 hover:bg-emerald-55 font-bold border border-slate-200 text-slate-700 flex items-center justify-center shadow-lg transition-all duration-300 hover:text-emerald-700 hover:scale-105 cursor-pointer opacity-0 group-hover/slider:opacity-100"
          id="btn-slider-next"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dots */}
        <div className="absolute top-4 right-4 z-30 flex items-center space-x-1.5" id="slider-dots-indicator">
          {SLIDE_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex 
                  ? 'bg-emerald-600 w-5 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                  : 'bg-white/80 border border-slate-300 hover:bg-white'
              }`}
              aria-label={`Ir al slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. THE THREE MATERIALS WITH OUTLINE FUTURE DESIGN */}
      <div 
        className="grid grid-cols-3 gap-4 text-center pt-2"
        id="materials-ecological-grid"
      >
        {/* PAPEL / CARTÓN */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:border-emerald-500/50 hover:shadow-xs transition duration-300 group">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center transition duration-300 group-hover:scale-110">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block leading-none">Material 01</span>
            <span className="text-[11px] font-display font-black text-slate-800 uppercase tracking-tight mt-0.5 block">Papel / Cartón</span>
          </div>
        </div>

        {/* ALUMINIO */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:border-emerald-500/50 hover:shadow-xs transition duration-300 group">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center transition duration-300 group-hover:scale-110">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block leading-none">Material 02</span>
            <span className="text-[11px] font-display font-black text-slate-800 uppercase tracking-tight mt-0.5 block">Aluminio</span>
          </div>
        </div>

        {/* PLÁSTICO (PET) */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:border-emerald-500/50 hover:shadow-xs transition duration-300 group">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center transition duration-300 group-hover:scale-110">
            <GlassWater className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block leading-none">Material 03</span>
            <span className="text-[11px] font-display font-black text-slate-800 uppercase tracking-tight mt-0.5 block">Plástico (PET)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
