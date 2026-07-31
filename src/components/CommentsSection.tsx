import React, { useState } from 'react';
import { Comentario, RolUsuario } from '../types';
import { MessageSquare, ShieldCheck, Trash, User, Info, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';

interface Props {
  comentarios: Comentario[];
  referenciaId: string;
  referenciaTipo: 'acta' | 'resumen';
  rolActual: RolUsuario;
  onAgregarComentario: (nuevo: Comentario) => void;
  onAprobarComentario: (id: string) => void;
  onEliminarComentario: (id: string) => void;
  onActualizarEstadoComentario?: (id: string, estado: 'pendiente' | 'aprobado') => void;
  usuarioGoogle: FirebaseUser | null;
  onReaccionarComentario?: (comentarioId: string, tipo: 'like' | 'dislike') => void;
  iniciarSesionConGoogle?: (nickname?: string) => Promise<void>;
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
  usuarioGoogle,
  onReaccionarComentario,
  iniciarSesionConGoogle,
}: Props) {
  const [texto, setTexto] = useState('');

  const filtrarComentarios = comentarios.filter(
    (c) => c.referenciaId === referenciaId && c.referenciaTipo === referenciaTipo
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioGoogle) {
      alert("Debes iniciar sesión con Google para comentar.");
      return;
    }
    if (!texto.trim()) return;

    const autorName = usuarioGoogle.displayName || usuarioGoogle.email?.split('@')[0] || 'Usuario de Google';

    const nuevo: Comentario = {
      id: `com-${Date.now()}`,
      referenciaId,
      referenciaTipo,
      autor: autorName,
      texto: texto.trim(),
      fecha: new Date().toISOString(),
      estado: rolActual === 'ADMIN' ? 'aprobado' : 'pendiente', // Los comentarios de usuarios normales requieren aprobación de administrador
    };

    onAgregarComentario(nuevo);
    setTexto('');
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100" id="comments-engine">
      <h5 className="font-display font-bold text-slate-800 text-sm mb-4 flex items-center space-x-2">
        <MessageSquare className="w-4 h-4 text-emerald-600" />
        <span>Comentarios ({filtrarComentarios.filter(c => c.estado === 'aprobado').length})</span>
      </h5>

      {/* ADMIN PANEL FOR MODERATION (Only visible to ADMIN) */}
      {rolActual === 'ADMIN' && (
        <div className="bg-emerald-950 text-slate-100 rounded-xl p-4 mb-6 border border-emerald-500/45 shadow-lg" id="comment-moderation-panel">
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-400">
                Panel de Moderación de Comentarios (ADMIN)
              </span>
            </div>
            <span className="text-[9px] font-mono bg-emerald-900 px-2 py-0.5 rounded text-emerald-250">
              Total comentarios: {filtrarComentarios.length}
            </span>
          </div>
          
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {filtrarComentarios.length === 0 ? (
              <p className="text-[11px] text-slate-300 italic text-center py-2 font-mono">
                No hay comentarios registrados para moderar aquí.
              </p>
            ) : (
              filtrarComentarios.map((com) => (
                <div key={com.id} className="bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
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

      {/* Comment Form or Google Sign-In Callout */}
      {!usuarioGoogle ? (
        <div className="mb-6 bg-white p-5 rounded-xl border border-slate-200/60 shadow-2xs text-center flex flex-col items-center">
          <Info className="w-8 h-8 text-amber-500 mb-2" />
          <h6 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Identificación Obligatoria</h6>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-3">
            Debes identificarte con Google para poder comentar sobre los pesajes o reaccionar a los comentarios de la comunidad.
          </p>
          
          <button
            type="button"
            onClick={() => iniciarSesionConGoogle?.()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm hover:shadow-md cursor-pointer flex items-center space-x-2"
          >
            <span className="font-bold text-emerald-100 font-mono">G</span>
            <span>Iniciar Sesión con Google</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-xl border border-slate-200/60 shadow-2xs">
          <div className="flex items-center space-x-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
            {usuarioGoogle.photoURL ? (
              <img
                src={usuarioGoogle.photoURL}
                alt={usuarioGoogle.displayName || 'Google user'}
                className="w-6 h-6 rounded-full border border-emerald-500"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
                {usuarioGoogle.displayName?.charAt(0) || 'G'}
              </div>
            )}
            <div className="text-xs">
              <span className="text-slate-500">Comentando como </span>
              <strong className="font-extrabold text-slate-800">{usuarioGoogle.displayName}</strong>
              <span className="text-[10px] text-slate-400 font-mono ml-1">({usuarioGoogle.email})</span>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
              Mensaje para el equipo *
            </label>
            <input
              type="text"
              required
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe tu consulta o felicitación sobre este pesaje..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
            <span className={`text-[10px] font-semibold font-mono flex items-center gap-1 ${
              rolActual === 'ADMIN' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              <Lock className="w-3.5 h-3.5 animate-pulse" />
              {rolActual === 'ADMIN' 
                ? '⚡ Como administrador, tu comentario se publicará al instante en tiempo real.' 
                : '🔒 Tu comentario se enviará a moderación y aparecerá una vez aprobado por el administrador.'}
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

              const yaLeDioLike = usuarioGoogle && com.likesUsers?.includes(usuarioGoogle.uid);

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

                  {/* Comment Reactions */}
                  <div className="flex items-center space-x-2.5 mt-3 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (!usuarioGoogle) {
                          alert("Inicia sesión con Google para dar Me gusta.");
                          iniciarSesionConGoogle?.();
                        } else {
                          onReaccionarComentario?.(com.id, 'like');
                        }
                      }}
                      className={`flex items-center space-x-1 text-[11px] font-mono px-2 py-1 rounded-lg border transition cursor-pointer select-none ${
                        yaLeDioLike
                          ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span>👍</span>
                      <span>{com.likes || 0}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
