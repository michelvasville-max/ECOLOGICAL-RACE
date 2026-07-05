import React, { useState, useEffect } from 'react';
import { Comentario, RolUsuario } from '../types';
import { MessageSquare, ShieldCheck, Trash, User, Info, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  comentarios: Comentario[];
  referenciaId: string;
  referenciaTipo: 'acta' | 'resumen';
  rolActual: RolUsuario;
  onAgregarComentario: (nuevo: Comentario) => void;
  onAprobarComentario: (id: string) => void;
  onEliminarComentario: (id: string) => void;
  onActualizarEstadoComentario?: (id: string, estado: 'pendiente' | 'aprobado') => void;
}

export default function CommentsSection({
  comentarios,
  referenciaId,
  referenciaTipo,
  rolActual,
  onAgregarComentario,
  onAprobarComentario,
  onEliminarComentario,
  onActualizarEstadoComentario,
}: Props) {
  const [autor, setAutor] = useState('');
  const [texto, setTexto] = useState('');
  const [yaComento, setYaComento] = useState(false);

  const storageKey = `coar_co2_comentado_${referenciaTipo}_${referenciaId}`;

  // Check if this device has already commented on this specific entry
  useEffect(() => {
    const hasCommented = localStorage.getItem(storageKey);
    if (hasCommented === 'true') {
      setYaComento(true);
    } else {
      setYaComento(false);
    }
  }, [referenciaId, referenciaTipo, storageKey]);

  const filtrarComentarios = comentarios.filter(
    (c) => c.referenciaId === referenciaId && c.referenciaTipo === referenciaTipo
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autor.trim()) return;
    if (!texto.trim()) return;

    // Reject if already commented and not admin
    if (yaComento && rolActual !== 'ADMIN') {
      return;
    }

    const nuevo: Comentario = {
      id: `com-${Date.now()}`,
      referenciaId,
      referenciaTipo,
      autor: autor.trim(),
      texto: texto.trim(),
      fecha: new Date().toISOString(),
      estado: 'pendiente', // Always defaults to 'pendiente' (pending approval)
    };

    onAgregarComentario(nuevo);
    setAutor('');
    setTexto('');

    // Save device comment restriction
    if (rolActual !== 'ADMIN') {
      localStorage.setItem(storageKey, 'true');
      setYaComento(true);
    }
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100" id="comments-engine">
      <h5 className="font-display font-bold text-slate-800 text-sm mb-4 flex items-center space-x-2">
        <MessageSquare className="w-4 h-4 text-emerald-600" />
        <span>Comentarios y Rendición de Cuentas ({filtrarComentarios.filter(c => c.estado === 'aprobado').length})</span>
      </h5>

      {/* ADMIN PANEL FOR MODERATION (Only visible to ADMIN) */}
      {rolActual === 'ADMIN' && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 mb-6 border border-emerald-500/30 shadow-lg" id="comment-moderation-panel">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-400">
                Panel de Moderación de Comentarios (ADMIN)
              </span>
            </div>
            <span className="text-[9px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              Total comentarios: {filtrarComentarios.length}
            </span>
          </div>
          
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {filtrarComentarios.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic text-center py-2 font-mono">
                No hay comentarios registrados para moderar aquí.
              </p>
            ) : (
              filtrarComentarios.map((com) => (
                <div key={com.id} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-bold text-slate-200 font-sans text-xs">{com.autor}</span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-sm ${
                        com.estado === 'aprobado'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/20'
                      }`}>
                        {com.estado === 'aprobado' ? 'PÚBLICO / APROBADO' : 'PENDIENTE DE APROBACIÓN'}
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs break-words">{com.texto}</p>
                    <span className="text-[9px] text-slate-500 block font-mono">
                      {new Date(com.fecha).toLocaleString('es-PE')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {com.estado === 'pendiente' ? (
                      <button
                        type="button"
                        onClick={() => onAprobarComentario(com.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded transition cursor-pointer"
                      >
                        Aprobar/Mostrar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onActualizarEstadoComentario?.(com.id, 'pendiente')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-2.5 py-1 rounded transition cursor-pointer"
                      >
                        Ocultar/Rechazar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEliminarComentario(com.id)}
                      className="bg-red-950/60 text-red-400 hover:bg-red-900/60 border border-red-900/40 font-bold text-[10px] px-2.5 py-1 rounded transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Comment Form or Device Limit Banner */}
      {yaComento && rolActual !== 'ADMIN' ? (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 mb-6 text-xs text-amber-900 leading-relaxed font-sans shadow-2xs">
          <div className="flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950 mb-0.5">Límite de un comentario por dispositivo alcanzado</p>
              <p className="text-amber-800">
                Ya has enviado un comentario para este registro desde este dispositivo. Para garantizar la moderación y evitar spam, limitamos las participaciones de forma local.
              </p>
              <span className="text-[9px] block mt-1.5 font-mono text-amber-600/85 uppercase tracking-wide">
                * Nota: Esta limitación es básica del navegador y no evita comentar desde otro dispositivo o red.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-xl border border-slate-200/60 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
                Tu Nombre y Apellido *
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder="Nombre y Apellido obligatorio"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white transition font-bold"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
                Mensaje para el equipo *
              </label>
              <input
                type="text"
                required
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe tu consulta o felicitación sobre este pesaje..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              {rolActual === 'ADMIN' 
                ? '✍️ Comentando como Administrador (Se guardará como pendiente para validar el flujo)' 
                : '⌛ Tu comentario se guardará como pendiente de aprobación por el Administrador.'}
            </span>
            <button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm hover:shadow-xs transition duration-150 cursor-pointer"
            >
              Enviar Comentario
            </button>
          </div>
        </form>
      )}

      {/* Public Comments List (Only approved comments are shown) */}
      <div className="space-y-3">
        {filtrarComentarios.filter(c => c.estado === 'aprobado').length === 0 ? (
          <p className="text-xs text-slate-400 font-mono italic text-center py-4 bg-white/50 rounded-xl border border-dashed border-slate-200">
            No hay comentarios públicos aún para este registro. ¡Sé el primero en dejar uno!
          </p>
        ) : (
          <AnimatePresence>
            {filtrarComentarios.map((com) => {
              if (com.estado !== 'aprobado') return null;

              return (
                <motion.div
                  key={com.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-white border border-slate-150/80 shadow-3xs p-3.5 rounded-xl transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{com.autor}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(com.fecha).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{com.texto}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
