import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Mail, Edit, Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { ProyectoMetadata, ManualSeccion, obtenerManualSecciones } from './NuestroProyectoTab';
import { RolUsuario } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  metadata?: ProyectoMetadata;
  rolActual?: RolUsuario;
  onGuardarMetadata?: (metadata: ProyectoMetadata) => Promise<void>;
}

export default function AyudaSoporteModal({
  isOpen,
  onClose,
  metadata,
  rolActual,
  onGuardarMetadata
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [secciones, setSecciones] = useState<ManualSeccion[]>(() => obtenerManualSecciones(metadata));

  useEffect(() => {
    if (metadata) {
      setSecciones(obtenerManualSecciones(metadata));
    }
  }, [metadata]);

  if (!isOpen) return null;

  const handleStartEdit = () => {
    setSecciones(obtenerManualSecciones(metadata));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSecciones(obtenerManualSecciones(metadata));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!metadata || !onGuardarMetadata) return;
    setGuardando(true);
    try {
      const updatedMeta: ProyectoMetadata = {
        ...metadata,
        manualSecciones: secciones
      };
      await onGuardarMetadata(updatedMeta);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar secciones del manual:', error);
      alert('Ocurrió un error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  const handleAddSection = () => {
    const nueva: ManualSeccion = {
      id: `m-${Date.now()}`,
      pregunta: '',
      respuesta: ''
    };
    setSecciones((prev) => [...prev, nueva]);
  };

  const handleUpdateSection = (index: number, field: 'pregunta' | 'respuesta', value: string) => {
    setSecciones((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteSection = (index: number) => {
    setSecciones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === secciones.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setSecciones((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

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
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 gap-4 flex-wrap">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-mono font-black text-white uppercase tracking-wider font-display truncate">
                      MANUAL DE INSTRUCCIONES
                    </h2>
                    <p className="text-[11px] font-mono text-emerald-400 uppercase font-bold tracking-widest mt-0.5 truncate">
                      Centro de Ayuda y Soporte Oficial
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {rolActual === 'ADMIN' && (
                    !isEditing ? (
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={guardando}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{guardando ? 'Guardando...' : 'Guardar'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={guardando}
                          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                          title="Cancelar edición"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    )
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-500/30 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                    title="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* VIEW MODE */}
              {!isEditing && (
                <div className="space-y-5 text-sm font-sans">
                  {secciones.map((item, idx) => {
                    const isSupportItem = 
                      item.pregunta.toLowerCase().includes('problema') || 
                      item.pregunta.toLowerCase().includes('duda') || 
                      item.pregunta.toLowerCase().includes('apoyo') ||
                      item.id === 'm8';

                    if (isSupportItem) {
                      return (
                        <div key={item.id || idx} className="bg-gradient-to-r from-emerald-900/80 to-cyan-950/80 border border-cyan-500/40 rounded-2xl p-5 space-y-3 shadow-inner">
                          <h3 className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-[10px] shrink-0">
                              {idx + 1}
                            </span>
                            {item.pregunta || '¿Tienes un problema o duda?'}
                          </h3>
                          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7 space-y-2">
                            {item.respuesta.split('\n').map((line, lIdx) => (
                              <p key={lIdx}>{line}</p>
                            ))}
                          </div>
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
                      );
                    }

                    return (
                      <div key={item.id || idx} className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 space-y-1.5">
                        <h3 className="text-xs font-mono font-bold uppercase text-emerald-300 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          {item.pregunta}
                        </h3>
                        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal pl-7 space-y-1">
                          {item.respuesta.split('\n').map((line, lIdx) => (
                            <p key={lIdx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {secciones.length === 0 && (
                    <div className="text-center py-8 text-slate-400 font-mono text-xs">
                      No hay puntos registrados en el manual de instrucciones.
                    </div>
                  )}
                </div>
              )}

              {/* EDIT MODE */}
              {isEditing && (
                <div className="space-y-5 text-sm font-sans">
                  <div className="flex items-center justify-between bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/50">
                    <span className="text-xs font-mono text-emerald-300 font-bold uppercase">
                      Modo Edición del Manual ({secciones.length} puntos)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black px-3 py-1.5 rounded-lg transition cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Punto</span>
                    </button>
                  </div>

                  {secciones.map((item, idx) => (
                    <div key={item.id || idx} className="bg-emerald-950/90 border border-emerald-600/50 rounded-2xl p-4 space-y-3 shadow-lg relative">
                      <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                        <span className="text-xs font-mono font-black text-emerald-400 uppercase flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          Punto #{idx + 1}
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 disabled:opacity-30 disabled:hover:bg-emerald-900/60 transition cursor-pointer"
                            title="Mover arriba"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, 'down')}
                            disabled={idx === secciones.length - 1}
                            className="p-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 disabled:opacity-30 disabled:hover:bg-emerald-900/60 transition cursor-pointer"
                            title="Mover abajo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(idx)}
                            className="p-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 transition cursor-pointer ml-2"
                            title="Eliminar este punto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-emerald-300 uppercase font-bold block">
                          Pregunta / Título del Punto
                        </label>
                        <input
                          type="text"
                          value={item.pregunta}
                          onChange={(e) => handleUpdateSection(idx, 'pregunta', e.target.value)}
                          className="w-full bg-[#021812] border border-emerald-600/70 text-white rounded-xl p-2.5 text-xs font-mono focus:outline-emerald-400 focus:border-emerald-400"
                          placeholder="Ej. ¿Cómo funciona el Ranking?"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-emerald-300 uppercase font-bold block">
                          Respuesta / Contenido
                        </label>
                        <textarea
                          value={item.respuesta}
                          onChange={(e) => handleUpdateSection(idx, 'respuesta', e.target.value)}
                          rows={3}
                          className="w-full bg-[#021812] border border-emerald-600/70 text-slate-200 rounded-xl p-2.5 text-xs font-sans leading-relaxed focus:outline-emerald-400 focus:border-emerald-400"
                          placeholder="Escribe la respuesta o explicación detallada..."
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="inline-flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Otro Punto al Manual</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
