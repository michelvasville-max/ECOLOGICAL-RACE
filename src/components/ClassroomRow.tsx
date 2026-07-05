import React from 'react';
import { AulaStats } from './LeaderboardCompare';
import { Award, Leaf, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import NeonLogo from './NeonLogo';

interface Props {
  key?: string;
  stats: AulaStats;
  index: number;
  totalSchoolCO2: number;
}

export default function ClassroomRow({ stats, index, totalSchoolCO2 }: Props) {
  const percentageOfTotal = totalSchoolCO2 > 0 ? (stats.totalCO2 / totalSchoolCO2) * 100 : 0;
  const isTop3 = index < 3;

  const medalColors = [
    'bg-amber-500 text-white border-white', // 1st
    'bg-slate-400 text-white border-white', // 2nd
    'bg-amber-700 text-white border-white' // 3rd
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className={`bg-white border rounded-3xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden ${
        index === 0 
          ? 'border-emerald-300 ring-2 ring-emerald-500/10 bg-linear-to-b from-white to-emerald-500/5' 
          : 'border-slate-200'
      }`}
    >
      <div className="flex items-center space-x-5">
        {/* Large Classroom Logo with Rank Overlay */}
        <div className="relative shrink-0">
          <NeonLogo
            src={stats.aula.logoUrl}
            fallbackType="classroom"
            sizeClass="w-20 h-20"
            alt={`Insignia de ${stats.aula.nombre}`}
          />
          {/* Overlay Rank Badge */}
          <div
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-mono font-extrabold text-[10px] shadow-sm z-20 ${
              isTop3 ? medalColors[index] : 'bg-slate-500 text-white border-white'
            }`}
          >
            {index + 1}°
          </div>
        </div>

        {/* Classroom details */}
        <div>
          <div className="flex items-center space-x-2">
            <h5 className="font-display font-black text-slate-900 text-lg tracking-tight">
              Aula {stats.aula.nombre}
            </h5>
            {stats.multiplicadoresVerdesCount > 0 && (
              <span className="flex items-center space-x-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
                <Leaf className="w-2.5 h-2.5" />
                <span>Multiplicador x{stats.multiplicadoresVerdesCount}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Líder: <span className="text-slate-700 font-bold">{stats.aula.raceCollector}</span>
          </p>
          {stats.aula.slogan && (
            <p className="text-[10px] text-emerald-600 font-bold mt-1 font-sans bg-emerald-50/50 px-2.5 py-0.5 rounded-lg border border-emerald-100/50 inline-block">
              "{stats.aula.slogan}"
            </p>
          )}
        </div>
      </div>

      {/* Numerical Metrics and Progress Bar */}
      <div className="flex-1 max-w-md">
        <div className="flex justify-between items-center text-xs font-mono mb-1 text-slate-500">
          <span className="flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Aporte al total</span>
          </span>
          <span className="font-bold text-slate-900">{percentageOfTotal.toFixed(3)}%</span>
        </div>
        {/* Percentage bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${percentageOfTotal}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              index === 0
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 animate-neon-pulse'
                : index === 1
                ? 'bg-gradient-to-r from-emerald-450 to-teal-400'
                : 'bg-gradient-to-r from-slate-400 to-emerald-400/60'
            }`}
          />
        </div>
      </div>

      {/* Materials Summary / Totals */}
      <div className="flex items-center space-x-6 self-end md:self-auto">
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Peso Recolectado</div>
          <div className="font-mono text-sm font-bold text-slate-800 mt-0.5">
            {stats.totalKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
        </div>

        <div className="text-right border-l border-slate-100 pl-6">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">CO₂ Evitado</div>
          <div className="font-mono text-sm font-extrabold text-emerald-600 mt-0.5">
            {stats.totalCO2.toFixed(1)} <span className="text-xs font-normal text-emerald-500">kg</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
