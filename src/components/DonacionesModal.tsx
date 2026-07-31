import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Upload, Loader2, Edit2, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { ProyectoMetadata } from './NuestroProyectoTab';
import { RolUsuario } from '../types';
import { subirImagenAFirebase } from '../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  metadata: ProyectoMetadata;
  rolActual: RolUsuario;
  onGuardarMetadata?: (meta: ProyectoMetadata) => Promise<void>;
}

export default function DonacionesModal({
  isOpen,
  onClose,
  metadata,
  rolActual,
  onGuardarMetadata
}: Props) {
  const [editandoAdmin, setEditandoAdmin] = useState(false);
  const [titularInput, setTitularInput] = useState(metadata.donacionesTitular || 'Neida Villegas');
  const [archivoQr, setArchivoQr] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const handleGuardarAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      let nuevaUrl = metadata.donacionesQrUrl || '';
      if (archivoQr) {
        nuevaUrl = await subirImagenAFirebase(archivoQr, 'donaciones');
      }

      const metaActualizada: ProyectoMetadata = {
        ...metadata,
        donacionesQrUrl: nuevaUrl,
        donacionesTitular: titularInput.trim() || 'Neida Villegas'
      };

      if (onGuardarMetadata) {
        await onGuardarMetadata(metaActualizada);
      }

      setEditandoAdmin(false);
      setArchivoQr(null);
    } catch (error) {
      console.error("Error al guardar datos de donación:", error);
      alert("Hubo un error al guardar los cambios de donación.");
    } finally {
      setGuardando(false);
    }
  };

  const titularActual = metadata.donacionesTitular || 'Neida Villegas';
  const qrUrlActual = metadata.donacionesQrUrl;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative max-w-lg w-full my-auto cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Futuristic frame container */}
          <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_0_35px_rgba(16,185,129,0.35)]">
            <div className="bg-[#041c16] text-slate-100 rounded-[22px] p-6 sm:p-8 space-y-6 relative overflow-hidden">
              
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between border-b border-emerald-500/20 pb-4 gap-4 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                    <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400/30" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-mono font-black text-white uppercase tracking-wider font-display">
                      Apoya a Ecological Race
                    </h2>
                    <p className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest mt-0.5">
                      Donaciones y Fondo de Sostenibilidad
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

              {/* Destination Explanation */}
              <div className="bg-emerald-950/60 border border-emerald-800/50 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed font-sans text-center relative z-10">
                <p>
                  Los aportes se destinan a materiales de reciclaje, premios para las aulas ganadoras y el mantenimiento de esta plataforma.
                </p>
              </div>

              {/* Main Content: QR & Account Owner */}
              {!editandoAdmin ? (
                <div className="space-y-4 text-center relative z-10">
                  {/* QR Image Container */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-3 bg-white rounded-2xl border-2 border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.25)] relative group">
                      {qrUrlActual ? (
                        <img
                          src={qrUrlActual}
                          alt="Código QR Yape/Plin"
                          className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
                        />
                      ) : (
                        <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-xl bg-slate-900 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 p-4 space-y-2">
                          <QrCode className="w-16 h-16 text-emerald-400/60" />
                          <span className="text-[11px] font-mono text-center font-bold">
                            Código QR Yape / Plin
                          </span>
                          <span className="text-[9px] font-sans text-slate-500 text-center">
                            Escanear desde tu app bancaria
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Owner Badge */}
                  <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-4 py-2 rounded-xl text-center shadow-inner">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wide">
                      Titular: <span className="text-emerald-300">{titularActual}</span>
                    </span>
                  </div>

                  {/* Admin Edit Trigger */}
                  {rolActual === 'ADMIN' && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTitularInput(metadata.donacionesTitular || 'Neida Villegas');
                          setArchivoQr(null);
                          setEditandoAdmin(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar QR / Titular (Admin)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Admin Edit Form */
                <form onSubmit={handleGuardarAdmin} className="space-y-4 bg-emerald-950/80 border border-amber-500/40 rounded-2xl p-4 text-left relative z-10">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Edición de Donaciones
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditandoAdmin(false)}
                      className="text-slate-400 hover:text-white text-xs font-mono"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Input Titular */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase">
                      Nombre del Titular de la Cuenta:
                    </label>
                    <input
                      type="text"
                      value={titularInput}
                      onChange={(e) => setTitularInput(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-400 font-mono"
                      placeholder="Ej. Neida Villegas"
                      required
                    />
                  </div>

                  {/* Input QR Image */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase">
                      Imagen del Código QR (Yape/Plin):
                    </label>
                    <div className="flex items-center gap-3">
                      {(archivoQr || qrUrlActual) && (
                        <img
                          src={archivoQr ? URL.createObjectURL(archivoQr) : qrUrlActual}
                          alt="Vista previa QR"
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-500/40 shrink-0"
                        />
                      )}
                      <div className="relative flex-1 border border-dashed border-emerald-500/40 rounded-xl p-2.5 text-center hover:bg-emerald-900/30 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setArchivoQr(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="text-xs text-emerald-300 font-mono font-bold block truncate">
                          {archivoQr ? archivoQr.name : 'Seleccionar nueva imagen QR...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Save buttons */}
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      disabled={guardando}
                      onClick={() => setEditandoAdmin(false)}
                      className="px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      className="px-4 py-1.5 text-xs font-mono font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                    >
                      {guardando ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
