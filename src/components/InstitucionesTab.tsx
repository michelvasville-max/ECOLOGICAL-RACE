import React from 'react';
import { Institucion, Aula, RegistroSemanal } from '../types';
import { Building2, Landmark, Trophy, Coins, Flame, Target, Sparkles, TrendingUp, Edit, Save, X, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import NeonLogo from './NeonLogo';

interface Props {
  instituciones: Institucion[];
  aulas: Aula[];
  registros: RegistroSemanal[];
  rolActual?: string;
  onGuardarInstitucion?: (inst: Institucion) => Promise<void>;
  onSubirLogo?: (file: File) => Promise<string>;
  onEliminarInstitucion?: (id: string) => Promise<void>;
  onEliminarAula?: (id: string) => Promise<void>;
  metaGlobalCO2?: number;
}

export default function InstitucionesTab({
  instituciones,
  aulas,
  registros,
  rolActual,
  onGuardarInstitucion,
  onSubirLogo,
  onEliminarInstitucion,
  onEliminarAula,
  metaGlobalCO2
}: Props) {
  const [editingSchoolId, setEditingSchoolId] = React.useState<string | null>(null);
  const [editSlogan, setEditSlogan] = React.useState('');
  const [editLogoUrl, setEditLogoUrl] = React.useState('');
  const [editMetaCO2, setEditMetaCO2] = React.useState<number>(750);
  const [subiendoLogoId, setSubiendoLogoId] = React.useState<string | null>(null);

  // Independent view tab per school: 'grado' | 'seccion' | 'all'
  const [vistasAdicionales, setVistasAdicionales] = React.useState<Record<string, 'grado' | 'seccion' | 'all'>>({});

  const startEditing = (inst: Institucion) => {
    setEditingSchoolId(inst.id);
    setEditSlogan(inst.slogan || '');
    setEditLogoUrl(inst.logoUrl || '');
    setEditMetaCO2(inst.metaCO2 || metaGlobalCO2 || 750);
  };

  const cancelEditing = () => {
    setEditingSchoolId(null);
  };

  const saveEditing = async (inst: Institucion) => {
    if (onGuardarInstitucion) {
      await onGuardarInstitucion({
        ...inst,
        slogan: editSlogan,
        logoUrl: editLogoUrl,
        metaCO2: Number(editMetaCO2) || 750
      });
    }
    setEditingSchoolId(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, inst: Institucion) => {
    if (e.target.files && e.target.files[0] && onSubirLogo) {
      setSubiendoLogoId(inst.id);
      try {
        const url = await onSubirLogo(e.target.files[0]);
        setEditLogoUrl(url);
      } catch (err) {
        console.error('Error al subir logo de IE:', err);
        alert('Error al subir la imagen del logo.');
      } finally {
        setSubiendoLogoId(null);
      }
    }
  };

  const handleLogoUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>, inst: Institucion) => {
    if (e.target.files && e.target.files[0] && onSubirLogo && onGuardarInstitucion) {
      setSubiendoLogoId(inst.id);
      try {
        const url = await onSubirLogo(e.target.files[0]);
        await onGuardarInstitucion({
          ...inst,
          logoUrl: url
        });
      } catch (err) {
        console.error('Error al subir logo de IE:', err);
        alert('Error al subir la imagen del logo.');
      } finally {
        setSubiendoLogoId(null);
      }
    }
  };

  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>('all');

  const filteredInstituciones = selectedSchoolId === 'all'
    ? instituciones
    : instituciones.filter((i) => i.id === selectedSchoolId);

  return (
    <div className="space-y-8" id="schools-sections-wrapper">
      {/* Selector de Sede Educativa */}
      <div className="bg-neutral-950 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(16,185,129,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div className="space-y-1">
          <h3 className="font-display font-black text-emerald-400 text-base uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            Visualización por Sede Educativa
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Selecciona una institución específica para ver su fondo común, metas y rendimiento de aulas sin mezclar datos.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-mono text-emerald-500/80 font-bold uppercase">Sede:</span>
          <select
            value={selectedSchoolId}
            onChange={(e) => setSelectedSchoolId(e.target.value)}
            className="bg-neutral-900 hover:bg-neutral-850 text-emerald-300 font-bold font-mono text-xs p-3 rounded-xl border border-emerald-500/30 focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:bg-neutral-900 transition cursor-pointer shadow-md"
          >
            <option value="all">Todas las Sedes Educativas</option>
            {instituciones.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredInstituciones.map((inst, idx) => {
        // Classrooms in this school
        const ieAulas = aulas.filter((a) => a.institucionId === inst.id);
        const ieAulasIds = ieAulas.map((a) => a.id);

        // Weekly logs for these classrooms
        const ieRegs = registros.filter((r) => ieAulasIds.includes(r.aulaId));

        // Aggregate statistics for this school
        let totalSoles = 0;
        let totalCO2 = 0;
        let totalKg = 0;
        let totalPlasticoKg = 0;
        let totalAluminioKg = 0;
        let totalPapelKg = 0;

        const classMap: Record<string, { 
          id: string; 
          name: string; 
          co2: number; 
          kg: number; 
          raceCollector: string;
          logoUrl?: string;
          slogan?: string;
          soles: number;
          plastico: number;
          aluminio: number;
          papel: number;
        }> = {};
        
        ieAulas.forEach((a) => {
          classMap[a.id] = { 
            id: a.id, 
            name: a.nombre, 
            co2: 0, 
            kg: 0, 
            raceCollector: a.raceCollector,
            logoUrl: a.logoUrl,
            slogan: a.slogan,
            soles: 0,
            plastico: 0,
            aluminio: 0,
            papel: 0
          };
        });

        ieRegs.forEach((r) => {
          totalSoles += r.montoVentaSoles || 0;
          const mult = r.multiplicadorVerde ? 1.2 : 1.0;
          const pKg = (r.kgPlastico || 0) * mult;
          const aKg = (r.kgAluminio || 0) * mult;
          const paKg = (r.kgPapel || 0) * mult;

          totalPlasticoKg += pKg;
          totalAluminioKg += aKg;
          totalPapelKg += paKg;

          const rKg = pKg + aKg + paKg;
          const rCO2 = (pKg * 1.5) + (aKg * 9.0) + (paKg * 1.0);

          totalKg += rKg;
          totalCO2 += rCO2;

          if (classMap[r.aulaId]) {
            classMap[r.aulaId].co2 += rCO2;
            classMap[r.aulaId].kg += rKg;
            classMap[r.aulaId].soles += r.montoVentaSoles || 0;
            classMap[r.aulaId].plastico += pKg;
            classMap[r.aulaId].aluminio += aKg;
            classMap[r.aulaId].papel += paKg;
          }
        });

        // Sorted internal classroom ranking
        const sortedClassRanking = Object.values(classMap).sort((a, b) => b.co2 - a.co2);

        // Specific school target goal
        const metaSchoolCO2 = inst.metaCO2 || metaGlobalCO2 || 750.0;
        const percentSchoolGoal = Math.min((totalCO2 / metaSchoolCO2) * 100, 100);

        // Top two classroom leaders of this specific school
        const ieLeader1 = sortedClassRanking[0];
        const ieLeader2 = sortedClassRanking[1];

        const ieSumCO2 = (ieLeader1?.co2 || 0) + (ieLeader2?.co2 || 0);
        const ieP1 = ieSumCO2 > 0 ? ((ieLeader1?.co2 || 0) / ieSumCO2) * 100 : 100;
        const ieP2 = ieSumCO2 > 0 && ieLeader2 ? ((ieLeader2?.co2 || 0) / ieSumCO2) * 100 : 0;

        // View tabs state for this school
        const activeViewTab = vistasAdicionales[inst.id] || 'grado';
        const setViewTab = (tab: 'grado' | 'seccion' | 'all') => {
          setVistasAdicionales(prev => ({ ...prev, [inst.id]: tab }));
        };

        // Helpers to parse Grades and Sections
        const getGradoLabel = (name: string) => {
          const match = name.match(/^(\d+)/);
          return match ? `${match[1]}° Grado` : "Otros";
        };

        const getSeccionLabel = (name: string) => {
          const match = name.match(/([A-Za-z])$/);
          return match ? `Sección "${match[1].toUpperCase()}"` : "Otras";
        };

        // Aggregations
        const statsPorGrado: Record<string, { co2: number; kg: number; soles: number; aulasCount: number }> = {};
        const statsPorSeccion: Record<string, { co2: number; kg: number; soles: number; aulasCount: number }> = {};

        ieAulas.forEach(aula => {
          const gLabel = getGradoLabel(aula.nombre);
          const sLabel = getSeccionLabel(aula.nombre);
          const clStats = classMap[aula.id] || { co2: 0, kg: 0, soles: 0 };

          if (!statsPorGrado[gLabel]) {
            statsPorGrado[gLabel] = { co2: 0, kg: 0, soles: 0, aulasCount: 0 };
          }
          statsPorGrado[gLabel].co2 += clStats.co2;
          statsPorGrado[gLabel].kg += clStats.kg;
          statsPorGrado[gLabel].soles += clStats.soles;
          statsPorGrado[gLabel].aulasCount += 1;

          if (!statsPorSeccion[sLabel]) {
            statsPorSeccion[sLabel] = { co2: 0, kg: 0, soles: 0, aulasCount: 0 };
          }
          statsPorSeccion[sLabel].co2 += clStats.co2;
          statsPorSeccion[sLabel].kg += clStats.kg;
          statsPorSeccion[sLabel].soles += clStats.soles;
          statsPorSeccion[sLabel].aulasCount += 1;
        });

        return (
          <motion.div
            key={inst.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="bg-[#e0f2fe] border-2 border-sky-300 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:shadow-[0_0_35px_rgba(56,189,248,0.25)] hover:border-sky-400 transition-all duration-300 flex flex-col gap-8 relative overflow-visible text-slate-800"
            id={`school-card-${inst.id}`}
          >
            {/* Ambient Background decoration block */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
              <div className="absolute top-0 right-0 p-6 opacity-[0.06] text-9xl font-black italic select-none font-display text-sky-500">
                {idx < 9 ? `IE 0${idx + 1}` : `IE ${idx + 1}`}
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:16px_16px]" />
            </div>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-sky-300/40 border-dashed relative z-10">
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-sky-850 bg-sky-200/90 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold w-fit border border-sky-300">
                  <Landmark className="w-3.5 h-3.5 text-sky-650" />
                  <span>Sede Registrada</span>
                </div>
                <h3 className="font-display font-black text-slate-900 text-xl md:text-3xl mt-1 tracking-tight uppercase">
                  {inst.nombre}
                </h3>
                <p className="text-xs text-slate-600 font-mono flex flex-wrap gap-x-4 gap-y-1">
                  <span>Distrito: <span className="text-sky-700 font-bold">{inst.distrito}</span></span>
                  <span>Provincia: <span className="text-slate-700 font-bold">{inst.provincia}</span></span>
                  <span>Nivel: <span className="text-slate-700 font-bold">{inst.nivel}</span></span>
                </p>
              </div>

              {/* School Logo with interactive popover & Admin Actions */}
              <div className="flex items-center gap-4 self-start md:self-auto">
                <div className="relative group/headlogo shrink-0 cursor-help">
                  <div className="relative overflow-visible">
                    <NeonLogo
                      src={inst.logoUrl}
                      fallbackType="institution"
                      sizeClass="w-20 h-20"
                      alt={`Logo de ${inst.nombre}`}
                    />
                    
                    {rolActual === 'ADMIN' && (
                      <label className="absolute inset-0 bg-slate-950/80 text-white flex flex-col items-center justify-center gap-1 opacity-0 group-hover/headlogo:opacity-100 transition rounded-full cursor-pointer text-center p-1.5 z-20 shadow-inner">
                        <Upload className="w-5 h-5 text-emerald-400" />
                        <span className="text-[8px] font-mono font-black tracking-wider text-emerald-300">
                          {subiendoLogoId === inst.id ? 'SUBIENDO...' : 'CAMBIAR'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUploadDirect(e, inst)}
                          className="hidden"
                          disabled={subiendoLogoId === inst.id}
                        />
                      </label>
                    )}
                  </div>

                  {/* Hover Popover with summary stats */}
                  <div className="absolute bottom-full right-0 md:left-1/2 md:-translate-x-1/2 mb-4 hidden group-hover/headlogo:flex flex-col bg-slate-900 text-white text-xs rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-sky-450 z-50 w-64 pointer-events-none transition duration-150 font-mono">
                    <span className="font-extrabold text-[10px] text-sky-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-800 block">
                      Resumen de Sede
                    </span>
                    <div className="space-y-3.5 text-[10px] text-slate-300 leading-normal">
                      <div className="flex justify-between items-center">
                        <span>💰 Fondo Común:</span>
                        <span className="font-bold text-amber-300">S/. {totalSoles.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>🔥 Bonus Carbón:</span>
                        <span className="font-bold text-sky-400">{totalCO2.toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>🎯 % Meta:</span>
                        <span className="font-bold text-blue-400">{percentSchoolGoal.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-slate-900 border-r border-b border-sky-500/30 rotate-45 absolute top-full right-6 md:right-auto md:left-1/2 md:-translate-x-1/2 -translate-y-1.5" />
                  </div>
                </div>

                {/* Admin edit/delete buttons */}
                {rolActual === 'ADMIN' && (
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEditing(inst)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-sky-850 bg-white/90 hover:bg-white border border-sky-300 rounded-lg transition"
                      title="Editar Sede"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>EDITAR</span>
                    </button>
                    {onEliminarInstitucion && (
                      <button
                        type="button"
                        onClick={() => onEliminarInstitucion(inst.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg transition shadow-xs"
                        title="ELIMINAR SEDE Y CASCADA"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ELIMINAR</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SCHOOL BONUS DE CARBONO PROGRESS BAR */}
            <div className="bg-white/85 border border-sky-300/40 rounded-2xl p-5 shadow-xs flex flex-col gap-3 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-sky-600 animate-pulse" />
                  <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                    Progreso de Bonus de Carbón: {inst.nombre}
                  </span>
                </div>
                <span className="text-sm font-mono font-extrabold text-sky-700">
                  {totalCO2.toFixed(1)} / {metaSchoolCO2.toFixed(0)} kg CO₂ evitados ({percentSchoolGoal.toFixed(1)}%)
                </span>
              </div>

              <div className="w-full h-10 bg-sky-100 rounded-xl relative overflow-hidden flex border border-sky-250">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentSchoolGoal}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 border-r-2 border-sky-300 rounded-l-lg shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                />
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none text-[10px] font-extrabold tracking-widest text-sky-900 uppercase font-mono">
                  <span>Meta de la Institución</span>
                  <span>{percentSchoolGoal.toFixed(1)}% Alcanzado</span>
                </div>
              </div>
            </div>

            {/* THREE COLUMN DETAILED STATS (Fondo Común, Bonus Carbón, Meta) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              {/* Fondo Común Transparente - Darker neon styling */}
              <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group/box">
                {/* Fixed Label with border and background to prevent cut off or overlapping */}
                <div className="absolute top-0 right-0 rounded-bl-xl rounded-tr-none border-l border-b border-amber-300 px-3 py-1 bg-amber-500 text-[9px] font-mono font-black uppercase text-white shadow-xs">
                  Fondo de Sede
                </div>
                <div className="pt-3">
                  <div className="flex items-center space-x-2 text-amber-700 mb-2 font-mono">
                    <Coins className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-wider">Fondo Común Transparente</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-2.5 py-1 rounded-md font-bold uppercase border border-amber-300/40 tracking-wider inline-block">
                    Caja Chica Escolar Co-Gestionada
                  </span>
                  <h4 className="text-2xl md:text-3xl font-black text-amber-700 font-mono mt-3 animate-pulse">
                    S/. {totalSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h4>
                  <p className="text-[10px] text-slate-600 font-mono mt-2 leading-normal">
                    Fondo 100% auditado y depositado directamente para el beneficio de los alumnos de {inst.nombre}.
                  </p>
                </div>
                <div className="mt-4 bg-white/70 border border-amber-200 rounded-lg p-2.5 text-[10px] text-amber-900 leading-relaxed italic">
                  ♻️ Dinero generado íntegramente por la comercialización y valorización de los materiales recolectados por las secciones de esta escuela.
                </div>
              </div>

              {/* Bonus Carbón */}
              <div className="bg-sky-50/90 border border-sky-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-sky-750 mb-2 font-mono">
                    <Flame className="w-4 h-4 text-sky-650" />
                    <span className="text-[10px] font-mono uppercase font-black tracking-wider">Bonus de Carbón</span>
                  </div>
                  <h4 className="text-2xl font-black text-sky-700 font-mono mt-1">
                    {totalCO2.toFixed(1)} <span className="text-xs font-bold text-slate-500 font-sans">kg CO₂</span>
                  </h4>
                  <p className="text-[10px] text-slate-600 font-mono mt-1">Gases de efecto invernadero evitados</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-1 text-[9px] font-mono text-center text-slate-700 bg-white/70 rounded-lg p-2 border border-sky-200">
                  <div>
                    <span className="block text-sky-600 text-[8px] uppercase font-bold">Plás.</span>
                    <span className="font-bold text-slate-800">{totalPlasticoKg.toFixed(0)} kg</span>
                  </div>
                  <div>
                    <span className="block text-sky-600 text-[8px] uppercase font-bold">Alu.</span>
                    <span className="font-bold text-slate-800">{totalAluminioKg.toFixed(0)} kg</span>
                  </div>
                  <div>
                    <span className="block text-sky-600 text-[8px] uppercase font-bold">Papel</span>
                    <span className="font-bold text-slate-800">{totalPapelKg.toFixed(0)} kg</span>
                  </div>
                </div>
              </div>

              {/* Meta Escolar */}
              <div className="bg-indigo-50/90 border border-indigo-255 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-700 mb-2 font-mono">
                    <Target className="w-4 h-4 text-indigo-650" />
                    <span className="text-[10px] font-mono uppercase font-black tracking-wider">Meta del Colegio</span>
                  </div>
                  <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">
                    {percentSchoolGoal.toFixed(1)}%
                  </h4>
                  <p className="text-[10px] text-slate-600 font-mono mt-1">Avance hacia la meta de {metaSchoolCO2} kg CO₂</p>
                </div>

                <div className="mt-4 bg-white/70 border border-indigo-200 rounded-lg p-2 text-center text-[10px] font-mono text-slate-700">
                  Faltan <span className="font-bold text-indigo-600">{Math.max(0, metaSchoolCO2 - totalCO2).toFixed(1)} kg CO₂</span> para la meta.
                </div>
              </div>
            </div>

            {/* CLASSROOM RANKING IN THIS SCHOOL & CIRCULAR FACE TO FACE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
              {/* Classroom Ranking (Left) */}
              <div className="bg-white/85 rounded-2xl p-5 border border-sky-200 flex flex-col justify-between text-slate-800">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4.5 h-4.5 text-amber-500" />
                      <h4 className="font-display font-bold text-slate-900 text-sm">
                        Ranking de Aulas de {inst.nombre}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-sky-750 font-bold bg-sky-100 px-2 py-0.5 border border-sky-300 rounded uppercase">
                      {ieAulas.length} Secciones Activas
                    </span>
                  </div>

                  <div className="space-y-2">
                    {sortedClassRanking.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-4 text-center font-mono">
                        ⌛ No hay pesajes reportados para esta institución educativa todavía.
                      </p>
                    ) : (
                      sortedClassRanking.map((cl, rIdx) => (
                        <div
                          key={cl.id || cl.name}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono p-4 rounded-2xl border transition duration-300 gap-4 hover:shadow-sm ${
                            rIdx === 0
                              ? 'bg-gradient-to-b from-sky-50 to-sky-100/60 border-sky-400 ring-1 ring-sky-300/30'
                              : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            {/* Large Classroom Logo with Rank Overlay */}
                            <div className="relative shrink-0">
                              <NeonLogo
                                src={cl.logoUrl}
                                fallbackType="classroom"
                                sizeClass="w-16 h-16"
                                alt={`Logo de ${cl.name}`}
                              />
                              <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-md border border-white z-20 ${
                                rIdx === 0
                                  ? 'bg-amber-500 text-white'
                                  : rIdx === 1
                                  ? 'bg-slate-300 text-slate-800'
                                  : rIdx === 2
                                  ? 'bg-amber-800 text-white'
                                  : 'bg-slate-400 text-white'
                              }`}>
                                {rIdx + 1}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-extrabold text-slate-900 font-sans text-sm">Aula {cl.name}</span>
                                {rIdx === 0 && (
                                  <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.2 rounded-full border border-amber-300 font-bold flex items-center gap-0.5 font-sans animate-pulse">
                                    <Sparkles className="w-2.5 h-2.5" /> Líder
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 font-sans">
                                Collector: <span className="text-sky-700 font-bold">{cl.raceCollector}</span>
                              </p>
                              {cl.slogan && (
                                <p className="text-[9px] text-sky-700 font-bold mt-1 font-sans bg-sky-100/60 px-2 py-0.5 rounded-md border border-sky-350 inline-block">
                                  "{cl.slogan}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-sky-200/50 pt-2 sm:pt-0">
                            <span className="text-slate-500 text-[10px]">
                              Material: <span className="text-slate-800 font-bold">{cl.kg.toFixed(1)} kg</span>
                            </span>
                            <span className="font-black text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-300 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-sky-650" />
                              <span>{cl.co2.toFixed(1)} kg CO₂</span>
                            </span>
                            {rolActual === 'ADMIN' && onEliminarAula && (
                              <button
                                type="button"
                                onClick={() => onEliminarAula(cl.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg border border-red-300 transition ml-1 cursor-pointer"
                                title="Eliminar Aula"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Circular Face to Face Component (Right) */}
              <div className="bg-white/85 rounded-2xl p-5 border border-sky-200 flex flex-col justify-between text-slate-800">
                <div>
                  {/* HEADER WITH LOGO, NAME, SLOGAN & ADMIN CONTROLS */}
                  <div className="border-b border-sky-100 pb-4 mb-4">
                    {editingSchoolId === inst.id ? (
                      <div className="space-y-3 p-3 bg-sky-50 border border-sky-300 rounded-xl text-slate-800">
                        <div className="flex items-center justify-between border-b border-sky-200 pb-1.5 mb-1.5">
                          <span className="text-[10px] font-mono text-sky-750 font-extrabold uppercase">Configuración de Sede (Admin)</span>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-[8px] font-mono text-sky-700 uppercase mb-1 font-bold">Eslogan o Lema Ambiental</label>
                          <input
                            type="text"
                            value={editSlogan}
                            onChange={(e) => setEditSlogan(e.target.value)}
                            className="w-full text-xs font-sans p-2 border border-sky-300 bg-white rounded text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-sky-400"
                            placeholder="Ingrese lema escolar..."
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-mono text-sky-700 uppercase mb-1 font-bold">Meta de Bonus de Carbón (kg CO₂)</label>
                          <input
                            type="number"
                            value={editMetaCO2}
                            onChange={(e) => setEditMetaCO2(Number(e.target.value))}
                            className="w-full text-xs font-mono p-2 border border-sky-300 bg-white rounded text-slate-800 font-semibold focus:outline-hidden focus:ring-1 focus:ring-sky-400"
                            placeholder="Ej. 750"
                          />
                        </div>

                        <div>
                          <label className="block text-[8px] font-mono text-sky-700 uppercase mb-1 font-bold">Logo de la Sede</label>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded border border-sky-300 flex items-center justify-center shrink-0 overflow-hidden">
                              {editLogoUrl ? (
                                <img src={editLogoUrl} alt="Logo preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                value={editLogoUrl}
                                onChange={(e) => setEditLogoUrl(e.target.value)}
                                className="w-full text-[10px] font-mono p-1 border border-sky-300 bg-white rounded focus:outline-hidden focus:ring-1 focus:ring-sky-400 text-slate-700"
                                placeholder="URL de imagen del logo..."
                              />
                              {onSubirLogo && (
                                <label className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-700 hover:text-sky-800 bg-sky-100 border border-sky-300 rounded px-2 py-1 cursor-pointer">
                                  <Upload className="w-2.5 h-2.5" />
                                  <span>{subiendoLogoId === inst.id ? 'Subiendo...' : 'Subir archivo'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleLogoUpload(e, inst)}
                                    className="hidden"
                                    disabled={subiendoLogoId === inst.id}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-200">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 font-mono"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditing(inst)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-white bg-sky-600 hover:bg-sky-700 rounded font-mono cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="relative group/headlogo2 shrink-0">
                          <div className="relative overflow-visible">
                            <NeonLogo
                              src={inst.logoUrl}
                              fallbackType="institution"
                              sizeClass="w-16 h-16"
                              alt={`Logo de ${inst.nombre}`}
                            />
                            {rolActual === 'ADMIN' && (
                              <label className="absolute inset-0 bg-slate-950/80 text-white flex flex-col items-center justify-center gap-1 opacity-0 group-hover/headlogo2:opacity-100 transition rounded-full cursor-pointer text-center p-1 z-20 shadow-inner">
                                <Upload className="w-4 h-4 text-emerald-400" />
                                <span className="text-[7px] font-mono font-black tracking-wider text-emerald-300">
                                  {subiendoLogoId === inst.id ? '...' : 'SUBIR'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleLogoUploadDirect(e, inst)}
                                  className="hidden"
                                  disabled={subiendoLogoId === inst.id}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Title and Slogan */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-extrabold text-amber-600 tracking-wider flex items-center gap-1 uppercase">
                              <Sparkles className="w-3 h-3" /> CARA A CARA: LÍDERES
                            </span>
                            {rolActual === 'ADMIN' && (
                              <button
                                type="button"
                                onClick={() => startEditing(inst)}
                                className="text-sky-600 hover:text-sky-700 p-1.5 rounded hover:bg-sky-50 transition cursor-pointer"
                                title="Editar Logo/Eslogan"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <h4 className="font-display font-black text-slate-900 text-xs md:text-sm truncate uppercase mt-0.5">
                            {inst.nombre}
                          </h4>
                          <p className="text-[10px] text-slate-600 italic font-medium leading-tight mt-1 line-clamp-2 border-l-2 border-sky-500 pl-1.5 bg-sky-100/50">
                            "{inst.slogan || '¡Compromiso ecológico y liderazgo escolar!'}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {ieLeader1 && ieLeader2 ? (
                    <div className="space-y-4">
                      {/* Duel Summary Circles / Cards */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {/* Leader 1 Box */}
                        <div className="bg-gradient-to-br from-sky-50 to-sky-100/60 border border-sky-300 p-3 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] font-mono uppercase bg-sky-600 text-white px-1.5 py-0.2 rounded w-fit font-black tracking-wider">PUESTO 1</span>
                            <span className="block font-sans text-sm font-black text-slate-900 mt-1">Aula {ieLeader1.name}</span>
                          </div>
                          <div className="mt-3">
                            <span className="block text-[8px] font-mono text-slate-500 uppercase">CO₂ Evitado</span>
                            <span className="text-sm font-black text-sky-700 font-mono leading-none">{ieLeader1.co2.toFixed(1)} kg</span>
                          </div>
                        </div>

                        {/* Leader 2 Box */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 border border-indigo-200 p-3 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-[8px] font-mono uppercase bg-indigo-600 text-white px-1.5 py-0.2 rounded w-fit font-black tracking-wider">PUESTO 2</span>
                            <span className="block font-sans text-sm font-black text-slate-900 mt-1">Aula {ieLeader2.name}</span>
                          </div>
                          <div className="mt-3">
                            <span className="block text-[8px] font-mono text-slate-500 uppercase">CO₂ Evitado</span>
                            <span className="text-sm font-black text-indigo-700 font-mono leading-none">{ieLeader2.co2.toFixed(1)} kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Horizontal progress bar comparison */}
                      <div className="space-y-1 font-mono text-[9px] text-slate-500">
                        <div className="flex justify-between font-bold">
                          <span className="text-sky-700 font-extrabold font-mono">Aula {ieLeader1.name} ({ieP1.toFixed(1)}%)</span>
                          <span className="text-indigo-600 font-extrabold font-mono">({ieP2.toFixed(1)}%) Aula {ieLeader2.name}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ieP1}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 border-r border-sky-400"
                          />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ieP2}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-l from-indigo-500 to-indigo-400"
                          />
                        </div>
                      </div>

                      {/* Detail row comparison table */}
                      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-150 overflow-hidden text-[10px] font-mono">
                        <div className="p-2 bg-slate-50 flex justify-between font-bold text-slate-500 text-[8px] uppercase tracking-wider">
                          <span>Material / Valor</span>
                          <span className="flex gap-4">
                            <span className="text-sky-700 font-bold">Aula {ieLeader1.name}</span>
                            <span className="text-indigo-600 font-bold font-mono">Aula {ieLeader2.name}</span>
                          </span>
                        </div>

                        <div className="p-2 flex justify-between text-slate-700">
                          <span>💰 Soles Recaudados</span>
                          <span className="flex gap-6 font-bold">
                            <span className="text-sky-700 font-extrabold">S/. {ieLeader1.soles.toFixed(1)}</span>
                            <span className="text-indigo-600 font-extrabold font-mono">S/. {ieLeader2.soles.toFixed(1)}</span>
                          </span>
                        </div>

                        <div className="p-2 flex justify-between text-slate-700">
                          <span>♻️ Plástico (kg)</span>
                          <span className="flex gap-6 font-bold font-mono">
                            <span className="text-sky-700 font-bold">{ieLeader1.plastico.toFixed(1)}</span>
                            <span className="text-indigo-600 font-bold">{ieLeader2.plastico.toFixed(1)}</span>
                          </span>
                        </div>

                        <div className="p-2 flex justify-between text-slate-700">
                          <span>🥫 Aluminio (kg)</span>
                          <span className="flex gap-6 font-bold font-mono">
                            <span className="text-sky-700 font-bold">{ieLeader1.aluminio.toFixed(1)}</span>
                            <span className="text-indigo-600 font-bold">{ieLeader2.aluminio.toFixed(1)}</span>
                          </span>
                        </div>

                        <div className="p-2 flex justify-between text-slate-700">
                          <span>📝 Papel (kg)</span>
                          <span className="flex gap-6 font-bold font-mono">
                            <span className="text-sky-700 font-bold">{ieLeader1.papel.toFixed(1)}</span>
                            <span className="text-indigo-600 font-bold">{ieLeader2.papel.toFixed(1)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-center p-8 text-xs text-slate-500 italic bg-slate-50 border border-slate-150 rounded-xl">
                      No hay suficientes datos de aulas para comparar en esta sede.
                    </div>
                  )}
                </div>

                <div className="text-center text-[9px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-150 leading-relaxed mt-4">
                  Duelo por el primer y segundo lugar del concurso ambiental dentro de esta sede.
                </div>
              </div>
            </div>

            {/* REQUIREMENT 5: STATISTICS GROUPED BY GRADE AND SECTION */}
            <div className="bg-white/85 rounded-3xl p-6 border border-sky-200 relative z-10 text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-150 pb-4 mb-4">
                <div className="space-y-1">
                  <h4 className="font-display font-black text-sky-700 text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
                    📊 Análisis Avanzado de Desempeño
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Visualiza mediciones acumuladas y agrupadas por nivel académico, distribución de secciones, o vista individual.
                  </p>
                </div>

                {/* Filter Selector tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto font-mono text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setViewTab('grado')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeViewTab === 'grado'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-850'
                    }`}
                  >
                    Por Grado
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('seccion')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeViewTab === 'seccion'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-850'
                    }`}
                  >
                    Por Sección
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeViewTab === 'all'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-850'
                    }`}
                  >
                    Todas las Aulas
                  </button>
                </div>
              </div>

              {/* View Content Panels */}
              {activeViewTab === 'grado' && (
                <div className="space-y-3 font-mono">
                  {Object.keys(statsPorGrado).length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">No hay datos agregados por grado aún.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(statsPorGrado).sort((a,b) => b[1].co2 - a[1].co2).map(([grado, data]) => (
                        <div key={grado} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-300 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md font-bold">
                                {data.aulasCount} {data.aulasCount === 1 ? 'aula' : 'aulas'}
                              </span>
                              <h5 className="text-base font-black text-slate-800 mt-1.5 font-sans uppercase">{grado}</h5>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 uppercase font-bold">CO₂ Evitado Total</span>
                              <p className="text-sky-750 font-black text-sm">{data.co2.toFixed(1)} kg</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-150/60 flex justify-between text-[10px] text-slate-500">
                            <span>📦 Material: <strong className="text-slate-700">{data.kg.toFixed(1)} kg</strong></span>
                            <span>💰 Soles: <strong className="text-amber-600 font-bold">S/. {data.soles.toFixed(1)}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeViewTab === 'seccion' && (
                <div className="space-y-3 font-mono">
                  {Object.keys(statsPorSeccion).length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">No hay datos agregados por sección aún.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(statsPorSeccion).sort((a,b) => b[1].co2 - a[1].co2).map(([seccion, data]) => (
                        <div key={seccion} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-300 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md font-bold">
                                {data.aulasCount} {data.aulasCount === 1 ? 'grado' : 'grados'}
                              </span>
                              <h5 className="text-base font-black text-slate-800 mt-1.5 font-sans uppercase">{seccion}</h5>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 uppercase font-bold">CO₂ Evitado Total</span>
                              <p className="text-indigo-700 font-black text-sm">{data.co2.toFixed(1)} kg</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-150/60 flex justify-between text-[10px] text-slate-500">
                            <span>📦 Material: <strong className="text-slate-700">{data.kg.toFixed(1)} kg</strong></span>
                            <span>💰 Soles: <strong className="text-amber-600 font-bold">S/. {data.soles.toFixed(1)}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeViewTab === 'all' && (
                <div className="space-y-2 font-mono">
                  {ieAulas.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4">No hay aulas en esta institución aún.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] text-left divide-y divide-slate-150">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest font-bold">
                          <tr>
                            <th className="p-3">Aula</th>
                            <th className="p-3">Race Collector</th>
                            <th className="p-3 font-bold text-sky-700">Plástico</th>
                            <th className="p-3 font-bold text-indigo-600">Aluminio</th>
                            <th className="p-3 font-bold text-amber-600">Papel</th>
                            <th className="p-3">Total CO₂ Evitado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 bg-white/45">
                          {ieAulas.map(aula => {
                            const stats = classMap[aula.id] || { plastico: 0, aluminio: 0, papel: 0, co2: 0 };
                            return (
                              <tr key={aula.id} className="hover:bg-slate-50/80 transition">
                                <td className="p-3 font-extrabold text-slate-800">Aula {aula.nombre}</td>
                                <td className="p-3 text-slate-600">{aula.raceCollector}</td>
                                <td className="p-3 text-sky-700 font-bold">{stats.plastico.toFixed(1)} kg</td>
                                <td className="p-3 text-indigo-600 font-bold">{stats.aluminio.toFixed(1)} kg</td>
                                <td className="p-3 text-amber-600 font-bold">{stats.papel.toFixed(1)} kg</td>
                                <td className="p-3 font-black text-sky-700">{stats.co2.toFixed(1)} kg</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
