import React from 'react';
import { IntegranteEquipo } from '../types';
import { ShieldCheck, Mail, Heart, Globe, Users, Cpu, Activity, Zap, FileCode, Award } from 'lucide-react';
import { motion } from 'motion/react';
import NeonLogo from './NeonLogo';

interface Props {
  equipo: IntegranteEquipo[];
  onEditarEquipo?: (miembro: IntegranteEquipo) => void;
  rolActual?: string;
}

export default function NuestroEquipoTab({ equipo, onEditarEquipo, rolActual }: Props) {
  const asesoras = equipo.filter((e) => e.esAsesora);
  const estudiantes = equipo.filter((e) => !e.esAsesora);

  return (
    <div className="space-y-8 text-white" id="team-cyber-terminal">
      {/* Top Telemetry Header */}
      <div className="bg-emerald-950 border border-emerald-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[9px] font-mono font-black text-emerald-400 tracking-widest uppercase">
                SISTEMA COOPERATIVO EN DIRECTO
              </span>
            </div>
            <h3 className="font-display font-black text-white text-sm uppercase tracking-tight">
              Panel de Identidades y Rangos Verdes
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>RED: <strong className="text-emerald-400">COAR-CAJ</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ESTUDIANTES: <strong className="text-white">{estudiantes.length}</strong></span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: ASESORA */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-neutral-800 pb-2">
          <Award className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h4 className="font-display font-black text-white text-xs uppercase tracking-wider">
            ASESORA DEL PROYECTO (DIRECTORA DE ESTACIÓN)
          </h4>
        </div>

        {asesoras.length === 0 ? (
          <div className="bg-emerald-950/50 border border-dashed border-emerald-500/30 rounded-2xl p-8 text-center text-slate-350 font-mono text-xs italic">
            ⚠️ No se ha registrado ninguna Asesora oficial en este momento. El administrador puede registrar una marcando la opción "Asesora" en el formulario.
          </div>
        ) : (
          <div className="space-y-4">
            {asesoras.map((asesora) => (
              <motion.div
                key={asesora.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.12)]"
              >
                {/* Neon grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.01)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative shrink-0">
                  <NeonLogo
                    src={asesora.fotoUrl}
                    fallbackType="team"
                    sizeClass="w-24 h-24"
                    alt={asesora.nombreCompleto}
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-neutral-950 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-black shadow-[0_0_8px_rgba(16,185,129,0.5)] z-20">
                    ★
                  </span>
                </div>
                <div className="text-center md:text-left flex-1 space-y-2 relative z-10">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950 border border-emerald-500/30 px-2.5 py-0.5 rounded uppercase tracking-widest">
                      DIRECTORA DE ESTACIÓN / ASESORA OFICIAL
                    </span>
                    <span className="text-[9px] font-mono text-blue-400 font-bold bg-blue-950 border border-blue-500/30 px-2 py-0.5 rounded tracking-widest uppercase">
                      NIVEL DE ACCESO: SUPREMO
                    </span>
                  </div>
                  <h4 className="font-display font-black text-white text-lg tracking-tight uppercase">
                    {asesora.nombreCompleto}
                  </h4>
                  <p className="text-xs text-slate-200 max-w-xl leading-relaxed font-mono bg-emerald-950/60 p-2 border border-emerald-500/20 rounded-lg">
                    CARGO: <span className="text-emerald-400 font-bold">{asesora.cargo}</span>
                  </p>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Coordinadora académica y mentora ambiental en Cajamarca. Supervisa la articulación institucional de la carrera ecológica, coordina las alianzas de reciclaje de alto rendimiento y lidera la gobernanza del fondo cooperativo educativo transparente.
                  </p>
                </div>

                {rolActual === 'ADMIN' && onEditarEquipo && (
                  <div className="shrink-0 relative z-10">
                    <button
                      onClick={() => onEditarEquipo(asesora)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold text-xs hover:underline bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 hover:border-emerald-400 px-3 py-1.5 rounded transition cursor-pointer"
                    >
                      MODIFICAR CARGO
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: EQUIPO DE ESTUDIANTES */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2 border-b border-neutral-800 pb-2">
          <Users className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h4 className="font-display font-black text-white text-xs uppercase tracking-wider">
            EQUIPO DE ESTUDIANTES (AGRUPACIÓN DE AGENTES DE OPERACIONES)
          </h4>
        </div>

        {estudiantes.length === 0 ? (
          <div 
            className="bg-emerald-950/80 border-2 border-dashed border-emerald-500/30 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.04)] relative overflow-hidden"
            id="empty-team-sci-fi"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.03),transparent_60%)]" />
            <Cpu className="w-12 h-12 text-emerald-500/30 mx-auto animate-pulse" />
            <div className="space-y-2 relative z-10">
              <h5 className="font-display font-black text-white text-sm uppercase tracking-wide">
                [ REGISTRO DE AGENTES VACÍO ]
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                La cooperativa ambiental está en modo "Lista para Producción" en Cajamarca.
                {rolActual === 'ADMIN' ? (
                  <span className="text-emerald-400 font-medium block mt-2 font-mono">
                    AUTORIZADO: Presiona el botón flotante "Añadir Integrante" en la parte superior derecha para dar de alta las credenciales de los alumnos ejecutores.
                  </span>
                ) : (
                  <span className="text-slate-500 block mt-2 font-mono">
                    Esperando a que la administración inicie la asignación de roles y firmas holográficas.
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {estudiantes.map((integrante, i) => (
              <motion.div
                key={integrante.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-emerald-950 border border-emerald-500/30 hover:border-emerald-400/80 rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                {/* Visual sci-fi scanner bar on hover */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400/50 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-950/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />

                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Photo Frame */}
                  <div className="relative mb-3">
                    <NeonLogo
                      src={integrante.fotoUrl}
                      fallbackType="team"
                      sizeClass="w-20 h-20"
                      alt={integrante.nombreCompleto}
                    />
                    {/* Active light indicator */}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-emerald-950 rounded-full flex items-center justify-center z-20" title="Agente en línea">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    </span>
                  </div>

                  {/* ID Profile */}
                  <div className="space-y-1 w-full">
                    <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950 border border-emerald-500/20 px-1.5 py-0.5 rounded tracking-widest uppercase">
                      ID-{integrante.id.substring(0, 8).toUpperCase()}
                    </span>
                    <h5 className="font-display font-black text-white text-xs tracking-tight uppercase truncate max-w-full">
                      {integrante.nombreCompleto}
                    </h5>
                    <p className="text-[9px] text-slate-200 font-mono font-medium mt-1 uppercase tracking-wider bg-emerald-900/60 border border-emerald-500/15 px-2 py-0.5 rounded-full inline-block">
                      {integrante.cargo}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    RANGO: AGENTE
                  </span>
                  
                  {rolActual === 'ADMIN' && onEditarEquipo ? (
                    <button
                      onClick={() => onEditarEquipo(integrante)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 hover:border-emerald-400 px-2 py-0.5 rounded transition cursor-pointer"
                    >
                      MODIFICAR CARGO
                    </button>
                  ) : (
                    <span className="text-emerald-500/70 font-semibold uppercase">AUTORIZADO</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
