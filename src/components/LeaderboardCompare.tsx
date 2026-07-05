import React from 'react';
import { Aula, RegistroSemanal } from '../types';
import { Award, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  aulas: Aula[];
  registros: RegistroSemanal[];
}

export interface AulaStats {
  aula: Aula;
  kgPlastico: number;
  kgAluminio: number;
  kgPapel: number;
  totalKg: number;
  totalCO2: number;
  montoSoles: number;
  multiplicadoresVerdesCount: number;
}

export default function LeaderboardCompare({ aulas, registros }: Props) {
  // Aggregate stats per classroom
  const statsMap: Record<string, AulaStats> = {};

  aulas.forEach((aula) => {
    statsMap[aula.id] = {
      aula,
      kgPlastico: 0,
      kgAluminio: 0,
      kgPapel: 0,
      totalKg: 0,
      totalCO2: 0,
      montoSoles: 0,
      multiplicadoresVerdesCount: 0,
    };
  });

  registros.forEach((reg) => {
    if (statsMap[reg.aulaId]) {
      const stats = statsMap[reg.aulaId];
      const factor = reg.multiplicadorVerde ? 1.2 : 1.0;

      const pKg = (reg.kgPlastico || 0) * factor;
      const aKg = (reg.kgAluminio || 0) * factor;
      const paKg = (reg.kgPapel || 0) * factor;

      stats.kgPlastico += pKg;
      stats.kgAluminio += aKg;
      stats.kgPapel += paKg;
      stats.totalKg += pKg + aKg + paKg;
      stats.totalCO2 += (pKg * 1.5) + (aKg * 9.0) + (paKg * 1.0);
      stats.montoSoles += reg.montoVentaSoles || 0;
      if (reg.multiplicadorVerde) {
        stats.multiplicadoresVerdesCount += 1;
      }
    }
  });

  const sortedStats = Object.values(statsMap).sort((a, b) => b.totalCO2 - a.totalCO2);

  if (sortedStats.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
        No hay datos suficientes para calcular el ranking.
      </div>
    );
  }

  const leader1 = sortedStats[0];
  const leader2 = sortedStats[1] || null;

  // Let's calculate the relative percentages between the two leaders
  const sumCO2Leaders = leader1.totalCO2 + (leader2 ? leader2.totalCO2 : 0);
  const p1 = sumCO2Leaders > 0 ? (leader1.totalCO2 / sumCO2Leaders) * 100 : 100;
  const p2 = sumCO2Leaders > 0 && leader2 ? (leader2.totalCO2 / sumCO2Leaders) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" id="onpe-face-to-face">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-semibold text-slate-800 text-sm tracking-tight uppercase">
              Cara a Cara: Líderes Ambientales
            </h4>
            <p className="text-[10px] font-mono text-slate-400">COMPARATIVA DE CO₂ EVITADO ENTRE LOS DOS PRIMEROS LUGARES</p>
          </div>
        </div>
        <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium border border-emerald-100">
          Duelo en la Cima
        </span>
      </div>

      {leader2 ? (
        <div className="space-y-6">
          {/* Main big compare numbers */}
          <div className="grid grid-cols-2 gap-4 text-center relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-100 border-2 border-slate-200 text-slate-600 text-xs font-mono font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
              VS
            </div>

            {/* First Place */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100/60 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                <span>1° PUESTO</span>
              </div>
              <h5 className="font-display text-2xl font-bold text-slate-900 leading-none">
                Aula {leader1.aula.nombre}
              </h5>
              <p className="text-xs text-slate-500 font-mono mt-1 max-w-[120px] truncate">
                {leader1.aula.raceCollector}
              </p>
              <div className="mt-4 font-mono text-3xl font-extrabold text-emerald-600">
                {p1.toFixed(3)}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {leader1.totalCO2.toFixed(1)} kg CO₂ Evitados
              </div>
            </div>

            {/* Second Place */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100/60 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-1.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                <span>2° PUESTO</span>
              </div>
              <h5 className="font-display text-2xl font-bold text-slate-900 leading-none">
                Aula {leader2.aula.nombre}
              </h5>
              <p className="text-xs text-slate-500 font-mono mt-1 max-w-[120px] truncate">
                {leader2.aula.raceCollector}
              </p>
              <div className="mt-4 font-mono text-3xl font-extrabold text-blue-600">
                {p2.toFixed(3)}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {leader2.totalCO2.toFixed(1)} kg CO₂ Evitados
              </div>
            </div>
          </div>

          {/* Comparative horizontal bars */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-500 px-1">
              <span>{leader1.aula.nombre} ({p1.toFixed(1)}%)</span>
              <span>{leader2.aula.nombre} ({p2.toFixed(1)}%)</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p1}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p2}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
              />
            </div>
          </div>

          {/* Comparison summary table */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 divide-y divide-slate-200 text-xs font-mono">
            <div className="flex justify-between py-2 text-slate-500">
              <span>Monto Financiado</span>
              <span className="flex justify-between w-40 text-slate-800 font-bold">
                <span>S/. {leader1.montoSoles.toFixed(0)}</span>
                <span className="text-slate-400 font-normal">vs</span>
                <span>S/. {leader2.montoSoles.toFixed(0)}</span>
              </span>
            </div>
            <div className="flex justify-between py-2 text-slate-500">
              <span>Plástico Reciclado</span>
              <span className="flex justify-between w-40 text-slate-800 font-bold">
                <span>{leader1.kgPlastico.toFixed(1)} kg</span>
                <span className="text-slate-400 font-normal">vs</span>
                <span>{leader2.kgPlastico.toFixed(1)} kg</span>
              </span>
            </div>
            <div className="flex justify-between py-2 text-slate-500">
              <span>Aluminio Reciclado</span>
              <span className="flex justify-between w-40 text-slate-800 font-bold">
                <span>{leader1.kgAluminio.toFixed(1)} kg</span>
                <span className="text-slate-400 font-normal">vs</span>
                <span>{leader2.kgAluminio.toFixed(1)} kg</span>
              </span>
            </div>
            <div className="flex justify-between py-2 text-slate-500">
              <span>Multiplicadores Verdes</span>
              <span className="flex justify-between w-40 text-slate-800 font-bold">
                <span>⭐ {leader1.multiplicadoresVerdesCount}</span>
                <span className="text-slate-400 font-normal">vs</span>
                <span>⭐ {leader2.multiplicadoresVerdesCount}</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Only one classroom is configured so comparison is disabled */
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <TrendingUp className="w-10 h-10 text-emerald-400 mb-2" />
          <h5 className="font-display font-semibold text-slate-800">{leader1.aula.nombre} está liderando</h5>
          <p className="text-xs text-slate-500 mt-1">Cargue más secciones para habilitar el gráfico cara a cara estilo ONPE.</p>
        </div>
      )}
    </div>
  );
}
