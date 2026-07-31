import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Layers, Zap, GlassWater, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

const SLIDE_DATA = [
  {
    filename: 'slider-1.png',
    title: 'EDUCACIÓN COOPERATIVA',
    desc: 'Sembrando conciencia y corresponsabilidad ecológica en las aulas de Cajamarca.'
  },
  {
    filename: 'slider-2.png',
    title: 'SEGREGACIÓN EFICIENTE',
    desc: 'Canalizando el reciclaje de plástico, aluminio y cartón con trazabilidad total.'
  },
  {
    filename: 'slider-3.png',
    title: 'TECNOLOGÍA DE SEGUIMIENTO',
    desc: 'Monitoreo de gases de efecto invernadero evitados y bonus de carbón en tiempo real.'
  },
  {
    filename: 'slider-4.png',
    title: 'DESARROLLO SOSTENIBLE',
    desc: 'Transformando residuos en recursos tangibles para equipar nuestras escuelas.'
  }
];

export default function FuturisticImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    SLIDE_DATA.forEach((slide) => {
      const storageRef = ref(storage, slide.filename);
      getDownloadURL(storageRef)
        .then((url) => {
          if (isMounted) {
            setImageUrls((prev) => ({ ...prev, [slide.filename]: url }));
          }
        })
        .catch((err) => {
          console.warn(`Error al obtener URL de Firebase Storage para ${slide.filename}:`, err);
          if (isMounted) {
            setFailedImages((prev) => ({ ...prev, [slide.filename]: true }));
          }
        });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDE_DATA.length);
    }, 4500); // Transitions every 4.5s
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDE_DATA.length) % SLIDE_DATA.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDE_DATA.length);
  };

  const currentSlide = SLIDE_DATA[currentIndex];
  const currentUrl = imageUrls[currentSlide.filename];
  const isImageFailed = failedImages[currentSlide.filename];

  return (
    <div className="space-y-4" id="slider-and-materials-block">
      {/* 1. THE SLIDER (WITHOUT DARK OVERLAYS / FILTERS OVER IMAGE) */}
      <div 
        className="relative w-full h-[285px] md:h-[355px] bg-emerald-950 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-200 group/slider"
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
              {/* The Image / Fallback Container */}
              {isImageFailed || !currentUrl ? (
                <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex flex-col items-center justify-center text-emerald-400 p-6 select-none">
                  <ImageOff className="w-12 h-12 text-emerald-400/30 mb-2 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400/60 uppercase">
                    {isImageFailed ? 'Imagen no disponible' : 'Cargando imagen...'}
                  </span>
                </div>
              ) : (
                <img 
                  src={currentUrl} 
                  alt={currentSlide.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    setFailedImages((prev) => ({ ...prev, [currentSlide.filename]: true }));
                  }}
                />
              )}
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
          {SLIDE_DATA.map((_, idx) => (
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

      {/* Dynamic Text Description Box (Fixed block below image slider) */}
      <div 
        className="bg-emerald-950 p-4 md:p-5 rounded-2xl border border-emerald-800/40 shadow-md space-y-1.5 select-none"
        id="slider-info-box-below"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="space-y-1.5"
          >
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black tracking-[0.2em] text-emerald-400 uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {currentSlide.title}
            </span>
            <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight font-display">
              ECOLOGICAL RACE 2026
            </h3>
            <p className="text-[11px] md:text-xs text-slate-200 font-medium leading-relaxed">
              {currentSlide.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. THE THREE MATERIALS WITH OUTLINE FUTURE DESIGN */}
      <div 
        className="grid grid-cols-3 gap-4 text-center pt-2"
        id="materials-ecological-grid"
      >
        {/* PAPEL */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:border-emerald-500/50 hover:shadow-xs transition duration-300 group">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center transition duration-300 group-hover:scale-110">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block leading-none">Material 01</span>
            <span className="text-[11px] font-display font-black text-slate-800 uppercase tracking-tight mt-0.5 block">Papel</span>
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
