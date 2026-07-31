import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Mail, BookOpen, ShieldCheck, Trophy, Calendar, Leaf, Zap, MessageSquare, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AyudaSoporteModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative max-w-3xl w-full my-auto cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated LED Neon Border Frame */}
          <div className="relative p-[2.5px] rounded-3xl bg-gradient-to-r from-emerald-500 via-cyan-400 via-teal-300 to-emerald-400 animate-pulse shadow-[0_0_35px_rgba(16,185,129,0.45)]">
            <div className="bg-[#031d16] text-slate-200 rounded-[22px] p-5 sm:p-8 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl relative">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-emerald-500/20 pb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-mono font-black text-white uppercase tracking-wider font-display">
                      MANUAL DE INSTRUCCIONES
                    </h2>
                    <p className="text-[11px] font-mono text-emerald-400 uppercase font-bold tracking-widest mt-0.5">
                      Centro de Ayuda y Soporte Oficial
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-500/30 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-5 text-sm font-sans">
                
                {/* Item 1 */}
                <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 space-y-1.5">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">1</span>
                    ¿Cuál fue la finalidad de crear esta plataforma?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7">
                    Ecological Race es el proyecto de reciclaje escolar impulsado por el COAR Cajamarca. Esta plataforma web se creó para darle seguimiento en vivo: aquí puedes ver el ranking de aulas, consultar los reportes semanales de pesaje y seguir el avance del proyecto en tiempo real.
                  </p>
                </div>

                {/* Item 2 */}
                <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 space-y-1.5">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">2</span>
                    Tipos de acceso
                  </h3>
                  <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7 space-y-1 list-disc list-inside">
                    <li><strong className="text-white font-mono text-xs uppercase">Visitante:</strong> puede ver todo el contenido público (ranking, reportes, instituciones, proyecto). Si inicia sesión con Google, también puede comentar y reaccionar a las evidencias.</li>
                    <li><strong className="text-white font-mono text-xs uppercase">Administrador:</strong> además de todo lo anterior, puede editar información, cargar pesajes, subir evidencias y moderar comentarios. Se activa con un código de acceso especial, independiente del login de Google.</li>
                  </ul>
                </div>

                {/* Item 3 */}
                <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 space-y-1.5">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">3</span>
                    ¿Cómo funciona el Ranking?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7">
                    Mide los kg reciclados y el CO₂ evitado por cada aula, determinando así el primer lugar.
                  </p>
                </div>

                {/* Item 4 */}
                <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 space-y-1.5">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">4</span>
                    ¿Cómo se registra el pesaje semanal?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7">
                    Entrar a "Reportes Semanales y Evidencias" → seleccionar el aula → cargar el pesaje de cada material (función de Administrador).
                  </p>
                </div>

                {/* Item 5 */}
                <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 space-y-1.5">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">5</span>
                    ¿Qué es el Bonus de Carbono?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7">
                    Cada kilogramo reciclado equivale a una cantidad distinta de CO₂ evitado según el material (plástico, aluminio, papel).
                  </p>
                </div>

                {/* Item 6 */}
                <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 space-y-1.5">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">6</span>
                    ¿Qué son los Retos de Ecoeficiencia?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7">
                    Cada aula puede ganar el Multiplicador Verde (+20% sobre sus kg recolectados) si cumple al 100% una cartilla diaria de buenas prácticas ambientales.
                  </p>
                </div>

                {/* Item 7 */}
                <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 space-y-1.5">
                  <h3 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">7</span>
                    ¿Cómo comentar o reaccionar a una evidencia?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7">
                    Cualquier visitante que inicie sesión con Google puede dejar comentarios y reaccionar con 👍 a las fotos publicadas en el Mosaico de Evidencias.
                  </p>
                </div>

                {/* Item 8 */}
                <div className="bg-gradient-to-r from-emerald-900/80 to-cyan-950/80 border border-cyan-500/40 rounded-2xl p-5 space-y-3 shadow-inner">
                  <h3 className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-[10px] shrink-0">8</span>
                    ¿Tienes un problema o duda?
                  </h3>
                  <div className="pl-7 pt-1">
                    <a
                      href="mailto:ecologicalrace.coar@gmail.com"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono text-xs font-black px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition hover:scale-105 cursor-pointer uppercase tracking-wider"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Solicitar Apoyo</span>
                    </a>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
