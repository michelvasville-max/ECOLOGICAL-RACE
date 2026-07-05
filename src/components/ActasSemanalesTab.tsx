import React, { useState } from 'react';
import { Aula, RegistroSemanal, Comentario, RolUsuario, Institucion } from '../types';
import CommentsSection from './CommentsSection';
import { Calendar, FileText, Camera, Edit2, Plus, ArrowLeft, ArrowRight, ShieldAlert, BadgeHelp, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  registros: RegistroSemanal[];
  aulas: Aula[];
  instituciones: Institucion[];
  comentarios: Comentario[];
  rolActual: RolUsuario;
  onAgregarComentario: (nuevo: Comentario) => void;
  onAprobarComentario: (id: string) => void;
  onEliminarComentario: (id: string) => void;
  onActualizarEstadoComentario?: (id: string, estado: 'pendiente' | 'aprobado') => void;
  onEditarRegistro: (reg: RegistroSemanal) => void;
  onNuevoRegistro: () => void;
}

// Curated high-fidelity, kid-safe photography for Cajamarca eco-activities (Unsplash)
const FOTOS_EVIDENCIAS: Record<number, { receipt: string; eco: string; caption: string }> = {
  1: {
    receipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=350&h=250',
    eco: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400&h=280',
    caption: 'Manos de alumnos clasificando botellas PET celestes de gaseosas en contenedores de reciclaje.'
  },
  2: {
    receipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=350&h=250',
    eco: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400&h=280',
    caption: 'Coordinadores vaciando contenedores llenos de botellas prensadas. Tomas enfocadas únicamente en las manos.'
  },
  3: {
    receipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=350&h=250',
    eco: 'https://images.unsplash.com/photo-1595275313391-cf14755290b3?auto=format&fit=crop&q=80&w=400&h=280',
    caption: 'Embalaje de cajas de cartón y archivadores. Se aprecian espaldas de los alumnos pesando los materiales.'
  },
  4: {
    receipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=350&h=250',
    eco: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400&h=280',
    caption: 'Sacos de latas de aluminio prensadas de forma óptima por el equipo de logística.'
  },
  5: {
    receipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=350&h=250',
    eco: 'https://images.unsplash.com/photo-1605600611283-c4530f54aff5?auto=format&fit=crop&q=80&w=400&h=280',
    caption: 'Delegados ambientales completando la cartilla diaria de luces y caños en la I.E.'
  }
};

const DEFAULT_FOTO = {
  receipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=350&h=250',
  eco: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&q=80&w=400&h=280',
  caption: 'Jornada de pesaje semanal. Segregación transparente de materiales reciclables.'
};

export default function ActasSemanalesTab({
  registros,
  aulas,
  instituciones,
  comentarios,
  rolActual,
  onAgregarComentario,
  onAprobarComentario,
  onEliminarComentario,
  onActualizarEstadoComentario,
  onEditarRegistro,
  onNuevoRegistro,
}: Props) {
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(5);
  const [ieFiltrada, setIeFiltrada] = useState<string>('all');

  const totalSemanas = 17;

  // Filter records belonging to selected week and selected school
  const registrosSemana = registros.filter((r) => {
    if (r.semana !== semanaSeleccionada) return false;
    if (ieFiltrada === 'all') return true;
    const aula = aulas.find((a) => a.id === r.aulaId);
    return aula?.institucionId === ieFiltrada;
  });

  // Totals for this selected week
  let totalKgPlastico = 0;
  let totalKgAluminio = 0;
  let totalKgPapel = 0;
  let totalSolesSemana = 0;
  let totalCO2Semana = 0;

  registrosSemana.forEach((r) => {
    const factor = r.multiplicadorVerde ? 1.2 : 1.0;
    const pKg = (r.kgPlastico || 0) * factor;
    const aKg = (r.kgAluminio || 0) * factor;
    const paKg = (r.kgPapel || 0) * factor;

    totalKgPlastico += pKg;
    totalKgAluminio += aKg;
    totalKgPapel += paKg;
    totalSolesSemana += r.montoVentaSoles || 0;
    totalCO2Semana += (pKg * 1.5) + (aKg * 9.0) + (paKg * 1.0);
  });

  const totalKgSemana = totalKgPlastico + totalKgAluminio + totalKgPapel;

  const handlePrevWeek = () => {
    if (semanaSeleccionada > 1) setSemanaSeleccionada(semanaSeleccionada - 1);
  };

  const handleNextWeek = () => {
    if (semanaSeleccionada < totalSemanas) setSemanaSeleccionada(semanaSeleccionada + 1);
  };

  const fotoInfo = FOTOS_EVIDENCIAS[semanaSeleccionada] || DEFAULT_FOTO;

  return (
    <div className="space-y-6" id="actas-semanales-wrapper">
      {/* Selector and Main metrics header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
          {/* Back/Forward Selector */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrevWeek}
              disabled={semanaSeleccionada === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>

            <div className="text-center sm:text-left">
              <h4 className="font-display font-extrabold text-slate-900 text-lg">
                Actas de la Semana {semanaSeleccionada}
              </h4>
              <p className="text-[10px] font-mono text-slate-400">
                REGISTROS OFICIALES DE ENTREGA Y COMERCIALIZACIÓN
              </p>
            </div>

            <button
              onClick={handleNextWeek}
              disabled={semanaSeleccionada === totalSemanas}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Institution Filter and Admin action */}
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Institución:</span>
              <select
                value={ieFiltrada}
                onChange={(e) => setIeFiltrada(e.target.value)}
                className="bg-slate-100 text-slate-800 font-bold font-mono text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Todas las I.E.</option>
                {instituciones.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
            </div>

            {rolActual === 'ADMIN' && (
              <button
                onClick={onNuevoRegistro}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs hover:shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cargar Pesaje Semanal</span>
              </button>
            )}
          </div>
        </div>

        {/* Weekly aggregated indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Fecha del Acta</span>
            <span className="font-mono text-sm font-bold text-slate-800 block mt-1">
              Jueves {registrosSemana.length > 0 ? new Date(registrosSemana[0].fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pendiente'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Fondo Recaudado</span>
            <span className="font-mono text-sm font-extrabold text-slate-900 block mt-1">
              S/. {totalSolesSemana.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Recolectado</span>
            <span className="font-mono text-sm font-bold text-slate-800 block mt-1">
              {totalKgSemana.toFixed(1)} kg
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl text-center">
            <span className="block text-[10px] font-mono text-emerald-700 font-semibold uppercase tracking-wider">CO₂ Evitado Sem.</span>
            <span className="font-mono text-sm font-extrabold text-emerald-800 block mt-1">
              -{totalCO2Semana.toFixed(1)} kg
            </span>
          </div>
        </div>
      </div>

      {/* Grid of records and Evidence Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: detailed table of classroom records */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <h5 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">
                Desglose por Secciones Participantes
              </h5>
              <span className="text-[10px] font-mono text-slate-500">
                {registrosSemana.length} aulas reportadas
              </span>
            </div>

            <div className="divide-y divide-slate-200 max-h-[450px] overflow-y-auto">
              {registrosSemana.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-mono text-xs italic">
                  ⌛ No hay pesajes registrados para la Semana {semanaSeleccionada} todavía. 
                  {rolActual === 'ADMIN' && ' ¡Haz clic en "Cargar Pesaje" arriba para empezar!'}
                </div>
              ) : (
                registrosSemana.map((reg) => {
                  const aula = aulas.find((a) => a.id === reg.aulaId);
                  const inst = aula ? instituciones.find((i) => i.id === aula.institucionId) : null;
                  const mult = reg.multiplicadorVerde ? 1.2 : 1.0;
                  const weightSum = (reg.kgPlastico + reg.kgAluminio + reg.kgPapel) * mult;
                  const co2Sum = (reg.kgPlastico * 1.5 + reg.kgAluminio * 9.0 + reg.kgPapel * 1.0) * mult;

                  return (
                    <div key={reg.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition duration-150">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-emerald-150 uppercase">
                            {inst ? inst.nombre : 'Sin Sede'}
                          </span>
                          <span className="bg-slate-100 text-slate-800 text-[10px] font-mono font-black px-2.5 py-0.5 rounded border border-slate-200 uppercase">
                            Aula {aula ? aula.nombre : 'S/N'}
                          </span>
                          {reg.multiplicadorVerde && (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-mono border border-amber-150 px-2 py-0.5 rounded-full font-bold">
                              ⭐ Multiplicador x1.2
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Race Collector: <span className="font-medium text-slate-700">{aula ? aula.raceCollector : 'Sin asignar'}</span>
                        </p>
                        {reg.descripcionEvidencia && (
                          <p className="text-[10px] text-slate-400 italic mt-1.5 max-w-sm">
                            💬 "{reg.descripcionEvidencia}"
                          </p>
                        )}
                      </div>

                      {/* Weight Breakdown per class */}
                      <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                        <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-[10px] text-slate-500">
                          <div>
                            <span className="block text-[8px] text-slate-400">Plás.</span>
                            <span className="font-bold">{(reg.kgPlastico * mult).toFixed(1)}k</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400">Alu.</span>
                            <span className="font-bold">{(reg.kgAluminio * mult).toFixed(1)}k</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400">Papel</span>
                            <span className="font-bold">{(reg.kgPapel * mult).toFixed(1)}k</span>
                          </div>
                        </div>

                        {/* Totals */}
                        <div className="text-right border-l border-slate-200 pl-4 font-mono">
                          <div className="text-[11px] font-bold text-slate-800">
                            {weightSum.toFixed(1)} kg
                          </div>
                          <div className="text-[10px] font-bold text-emerald-600">
                            -{co2Sum.toFixed(1)} kg CO₂
                          </div>
                          <div className="text-[9px] text-slate-400">
                            S/. {reg.montoVentaSoles.toFixed(1)}
                          </div>
                        </div>

                        {/* Admin Action */}
                        {rolActual === 'ADMIN' && (
                          <button
                            onClick={() => onEditarRegistro(reg)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 rounded-lg transition cursor-pointer"
                            title="Editar Pesaje"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Integrated Comments Section for this week's records */}
          <CommentsSection
            comentarios={comentarios}
            referenciaId={String(semanaSeleccionada)}
            referenciaTipo="acta"
            rolActual={rolActual}
            onAgregarComentario={onAgregarComentario}
            onAprobarComentario={onAprobarComentario}
            onEliminarComentario={onEliminarComentario}
            onActualizarEstadoComentario={onActualizarEstadoComentario}
          />
        </div>

        {/* Right Column: Visual Evidence Attachments and Kid-Safe Guard */}
        <div className="space-y-6">
          {/* Actividades Ecológicas (Kid-Safe) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 text-slate-800 font-display font-bold text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Evidencia Fotográfica de la I.E.</span>
            </div>

            <div className="relative group overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
              <img
                src={fotoInfo.eco}
                alt="Evidencia Ambiental de Trabajo"
                referrerPolicy="no-referrer"
                className="w-full h-44 object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-slate-950/20" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mt-3 italic font-medium">
              "{fotoInfo.caption}"
            </p>

            {/* Kid Safe Badge Warning */}
            <div className="mt-4 bg-amber-50/50 border border-amber-200/60 p-3 rounded-xl flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[10px] font-mono text-amber-800 leading-tight">
                <strong>Cláusula de Protección al Menor:</strong> Por políticas estrictas de privacidad del COAR y Splash Perú, las evidencias fotográficas nunca muestran rostros de estudiantes menores de edad visibles. Se priorizan tomas de manos, espaldas o perfiles.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function totalSolesSemanas(regs: RegistroSemanal[]) {
  return regs.reduce((sum, r) => sum + (r.montoVentaSoles || 0), 0);
}
