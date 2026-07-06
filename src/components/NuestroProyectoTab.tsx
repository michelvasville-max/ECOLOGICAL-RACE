import React, { useState } from 'react';
import { ShieldCheck, Heart, Globe, Landmark, Edit, Save, X, Image as ImageIcon, Sparkles, BookOpen, Target, Upload, Leaf, Flame, Zap, Droplet, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { IntegranteEquipo } from '../types';

export interface ProyectoMetadata {
  id?: string;
  logoUrl: string;
  mision: string;
  vision: string;
  nombreProyecto: string;
  categoria: string;
  institucionBase: string;
  asesoraOficial?: string;
  metaGlobalCO2?: number;
  imagenMisionUrl?: string;
  imagenVisionUrl?: string;
  tiktokUser?: string;
  tiktokUrl?: string;
  instagramUser?: string;
  instagramUrl?: string;
}

interface Props {
  metadata: ProyectoMetadata;
  rolActual?: string;
  equipo: IntegranteEquipo[];
  onGuardarMetadata: (newData: ProyectoMetadata) => void;
  onSubirLogo?: (file: File) => Promise<string>;
}

export default function NuestroProyectoTab({ metadata, rolActual, equipo, onGuardarMetadata, onSubirLogo }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [subiendoMision, setSubiendoMision] = useState(false);
  const [subiendoVision, setSubiendoVision] = useState(false);

  const [editedData, setEditedData] = useState<ProyectoMetadata>({
    ...metadata,
    metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
    imagenMisionUrl: metadata.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    imagenVisionUrl: metadata.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    tiktokUser: metadata.tiktokUser || '@ecologicalrace',
    tiktokUrl: metadata.tiktokUrl || 'https://www.tiktok.com/@ecologicalrace',
    instagramUser: metadata.instagramUser || '@ecologicalrace',
    instagramUrl: metadata.instagramUrl || 'https://www.instagram.com/ecologicalrace'
  });

  React.useEffect(() => {
    setEditedData({
      ...metadata,
      metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
      imagenMisionUrl: metadata.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      imagenVisionUrl: metadata.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      tiktokUser: metadata.tiktokUser || '@ecologicalrace',
      tiktokUrl: metadata.tiktokUrl || 'https://www.tiktok.com/@ecologicalrace',
      instagramUser: metadata.instagramUser || '@ecologicalrace',
      instagramUrl: metadata.instagramUrl || 'https://www.instagram.com/ecologicalrace'
    });
  }, [metadata]);

  // Dynamically resolve the official advisor from the team members list
  const asesoraMiembro = equipo.find((m) => 
    m.esAsesora === true || 
    (m.cargo && m.cargo.toLowerCase().includes('asesora'))
  );
  const nombreAsesora = asesoraMiembro ? asesoraMiembro.nombreCompleto : 'Sin asignar';

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onSubirLogo) {
      setSubiendoLogo(true);
      try {
        const url = await onSubirLogo(e.target.files[0]);
        setEditedData((prev) => ({ ...prev, logoUrl: url }));
        if (!isEditing) {
          onGuardarMetadata({ ...metadata, logoUrl: url });
        }
      } catch (err) {
        console.error('Error al subir logo del proyecto:', err);
        alert('Ocurrió un error al subir el logo.');
      } finally {
        setSubiendoLogo(false);
      }
    }
  };

  const handleMisionImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onSubirLogo) {
      setSubiendoMision(true);
      try {
        const url = await onSubirLogo(e.target.files[0]);
        setEditedData((prev) => ({ ...prev, imagenMisionUrl: url }));
        if (!isEditing) {
          onGuardarMetadata({ ...metadata, imagenMisionUrl: url });
        }
      } catch (err) {
        console.error('Error al subir imagen de misión:', err);
        alert('Ocurrió un error al subir la imagen.');
      } finally {
        setSubiendoMision(false);
      }
    }
  };

  const handleVisionImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onSubirLogo) {
      setSubiendoVision(true);
      try {
        const url = await onSubirLogo(e.target.files[0]);
        setEditedData((prev) => ({ ...prev, imagenVisionUrl: url }));
        if (!isEditing) {
          onGuardarMetadata({ ...metadata, imagenVisionUrl: url });
        }
      } catch (err) {
        console.error('Error al subir imagen de visión:', err);
        alert('Ocurrió un error al subir la imagen.');
      } finally {
        setSubiendoVision(false);
      }
    }
  };

  const handleSave = () => {
    onGuardarMetadata(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData({
      ...metadata,
      metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
      imagenMisionUrl: metadata.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      imagenVisionUrl: metadata.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      tiktokUser: metadata.tiktokUser || '@ecologicalrace',
      tiktokUrl: metadata.tiktokUrl || 'https://www.tiktok.com/@ecologicalrace',
      instagramUser: metadata.instagramUser || '@ecologicalrace',
      instagramUrl: metadata.instagramUrl || 'https://www.instagram.com/ecologicalrace'
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-12" id="project-info-tab">
      {/* 1. UPPER HERO BANNER */}
      <div className="bg-gradient-to-br from-sky-300/90 via-sky-100/80 to-cyan-300/90 border-2 border-sky-400 rounded-3xl p-6 md:p-8 relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-[0_10px_35px_rgba(14,165,233,0.18)]" id="hero-banner-neon">
        {/* Deco Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* LEFT COLUMN: LOGO CONTAINER (Takes 50% width and centers the logo) */}
        <div className="flex items-center justify-center w-full h-full py-4 z-10">
          <div className="relative group shrink-0">
            <div className="w-64 h-64 md:w-76 md:h-76 bg-white rounded-3xl border-2 border-sky-400 p-5 flex flex-col items-center justify-center overflow-hidden shadow-[0_12px_35px_rgba(14,165,233,0.25),inset_0_0_15px_rgba(14,165,233,0.05)] transition-all duration-300 hover:scale-103">
              {(editedData.logoUrl || metadata.logoUrl) ? (
                <img
                  src={editedData.logoUrl || metadata.logoUrl}
                  alt="Logo del Proyecto"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="text-center p-3">
                  <Leaf className="w-16 h-16 text-sky-500 mx-auto mb-2" />
                  <span className="text-xs font-bold text-sky-850 block">SIN LOGO PERSONALIZADO</span>
                  <span className="text-[10px] text-sky-700 block mt-1">Sube el logo de tu proyecto</span>
                </div>
              )}
            </div>

            {rolActual === 'ADMIN' && (
              <label className="absolute inset-0 bg-slate-950/85 text-white flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition rounded-3xl cursor-pointer text-center p-2 z-10">
                <Upload className="w-6 h-6 text-sky-400" />
                <span className="text-[9px] font-mono font-bold tracking-wider text-sky-300">
                  {subiendoLogo ? 'SUBIENDO...' : 'SUBIR LOGO'}
                </span>
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PROYECTO PRESENTATION HEADER (Description of the project) */}
        <div className="text-left space-y-4 z-10">
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-sky-950 bg-sky-200/90 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold w-fit border border-sky-300/85">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Nuestra Identidad</span>
          </div>

          <h2 className="font-display font-black text-slate-950 text-2.5xl md:text-3.5xl tracking-tight leading-none">
            {isEditing ? (
              <input
                type="text"
                value={editedData.nombreProyecto}
                onChange={(e) => setEditedData((prev) => ({ ...prev, nombreProyecto: e.target.value }))}
                className="bg-white text-slate-950 border border-sky-300 rounded-xl px-3 py-1 text-xl font-bold font-sans w-full max-w-md focus:outline-sky-400 focus:bg-white shadow-[0_0_10px_rgba(14,165,233,0.1)]"
              />
            ) : (
              metadata.nombreProyecto || 'Ecological Race'
            )}
          </h2>

          <div className="text-xs md:text-sm text-slate-950 leading-relaxed font-sans font-semibold space-y-2.5 text-justify">
            <p>
              <strong className="text-slate-950 font-black font-display">Ecological Race</strong> es un proyecto de innovación ambiental y social que implementa una <strong className="text-slate-950 font-black font-display">Cooperativa Ecológica Autofinanciada</strong> en una institución educativa. Su objetivo es promover una cultura de reciclaje sostenible mediante la segregación de plástico, papel y aluminio desde los hogares, aplicando principios de economía circular.
            </p>
            <p>
              Además, fortalece el liderazgo estudiantil a través de los <strong className="text-slate-950 font-black font-display">Race Collectors (Brigadistas Ambientales)</strong>, quienes lideran y coordinan las acciones ambientales dentro de cada aula. Periódicamente, el equipo ejecutor brinda seguimiento, capacitación y apoyo en el pesaje de los residuos.
            </p>
            <p>
              Los ingresos obtenidos por la venta del material reciclado se destinan, de manera transparente, a atender las necesidades de la institución, mientras se mide el impacto ambiental mediante el cálculo del CO₂ evitado. El propósito final es que la cooperativa funcione de forma autónoma y se consolide como una iniciativa sostenible dentro de la comunidad educativa.
            </p>
          </div>

          {rolActual === 'ADMIN' && !isEditing && (
            <button
              onClick={() => {
                setEditedData({
                  ...metadata,
                  metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
                  imagenMisionUrl: metadata.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
                  imagenVisionUrl: metadata.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
                  tiktokUser: metadata.tiktokUser || '@ecologicalrace',
                  tiktokUrl: metadata.tiktokUrl || 'https://www.tiktok.com/@ecologicalrace',
                  instagramUser: metadata.instagramUser || '@ecologicalrace',
                  instagramUrl: metadata.instagramUrl || 'https://www.instagram.com/ecologicalrace'
                });
                setIsEditing(true);
              }}
              className="mt-3 inline-flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs px-4 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(6,182,212,0.2)] cursor-pointer transition duration-300 font-bold"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar Todo el Proyecto</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC, NON-LINEAR MISSION AND VISION SHOWCASE */}
      <div className="space-y-12">
        {/* Row 1: MISIÓN (Text Left, Image Right) */}
        <div className="flex flex-col lg:flex-row items-stretch gap-8 lg:gap-12">
          {/* Text Block */}
          <div className="flex-1 bg-cyan-50/40 border border-cyan-200/80 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(6,182,212,0.05)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-cyan-800 font-display font-black text-sm uppercase tracking-wide">
                <Heart className="w-5 h-5 text-cyan-500 fill-cyan-100/50" />
                <span>Nuestra Misión</span>
              </div>

              {isEditing ? (
                <textarea
                  value={editedData.mision}
                  onChange={(e) => setEditedData((prev) => ({ ...prev, mision: e.target.value }))}
                  className="w-full h-36 bg-white border border-cyan-200 rounded-xl p-3 text-xs font-sans text-slate-800 leading-relaxed focus:outline-cyan-400 focus:bg-white shadow-inner"
                />
              ) : (
                <p className="text-sm text-cyan-900 leading-relaxed font-sans font-semibold">
                  {metadata.mision}
                </p>
              )}
            </div>
            
            <div className="bg-cyan-100/40 border border-cyan-200/50 rounded-xl p-4 text-xs font-mono text-cyan-850 mt-6 flex items-center space-x-2">
              <span className="text-cyan-600 font-black">🎯</span>
              <span>Propósito que impulsa cada kilo recolectado por el concurso.</span>
            </div>
          </div>

          {/* Image Block */}
          <div className="lg:w-2/5 shrink-0 relative group rounded-3xl overflow-hidden border border-cyan-200 bg-cyan-50/50 min-h-[220px] shadow-sm flex items-center justify-center">
            <img
              src={editedData.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800'}
              alt="Misión del Proyecto"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-cyan-950/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 text-white text-[10px] font-mono bg-cyan-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md uppercase tracking-wider font-bold">
              Ilustración Misión
            </div>

            {rolActual === 'ADMIN' && (
              <label className="absolute inset-0 bg-slate-950/85 text-white flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition cursor-pointer p-4 z-10">
                <Upload className="w-6 h-6 text-cyan-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-300">
                  {subiendoMision ? 'CARGANDO...' : 'REEMPLAZAR IMAGEN'}
                </span>
                <input type="file" accept="image/*" onChange={handleMisionImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Row 2: VISIÓN (Image Left, Text Right) */}
        <div className="flex flex-col-reverse lg:flex-row items-stretch gap-8 lg:gap-12">
          {/* Image Block */}
          <div className="lg:w-2/5 shrink-0 relative group rounded-3xl overflow-hidden border border-cyan-200 bg-cyan-50/50 min-h-[220px] shadow-sm flex items-center justify-center">
            <img
              src={editedData.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800'}
              alt="Visión del Proyecto"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-cyan-950/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 text-white text-[10px] font-mono bg-cyan-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md uppercase tracking-wider font-bold">
              Ilustración Visión
            </div>

            {rolActual === 'ADMIN' && (
              <label className="absolute inset-0 bg-slate-950/85 text-white flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition cursor-pointer p-4 z-10">
                <Upload className="w-6 h-6 text-cyan-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-300">
                  {subiendoVision ? 'CARGANDO...' : 'REEMPLAZAR IMAGEN'}
                </span>
                <input type="file" accept="image/*" onChange={handleVisionImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Text Block */}
          <div className="flex-1 bg-cyan-50/40 border border-cyan-200/80 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(6,182,212,0.05)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-cyan-800 font-display font-black text-sm uppercase tracking-wide">
                <Globe className="w-5 h-5 text-cyan-500 fill-cyan-100/50" />
                <span>Nuestra Visión</span>
              </div>

              {isEditing ? (
                <textarea
                  value={editedData.vision}
                  onChange={(e) => setEditedData((prev) => ({ ...prev, vision: e.target.value }))}
                  className="w-full h-36 bg-white border border-cyan-200 rounded-xl p-3 text-xs font-sans text-slate-800 leading-relaxed focus:outline-cyan-400 focus:bg-white shadow-inner"
                />
              ) : (
                <p className="text-sm text-cyan-900 leading-relaxed font-sans font-semibold">
                  {metadata.vision}
                </p>
              )}
            </div>

            <div className="bg-cyan-100/40 border border-cyan-200/50 rounded-xl p-4 text-xs font-mono text-cyan-850 mt-6 flex items-center space-x-2">
              <span className="text-cyan-600 font-black">🌱</span>
              <span>El legado de transparencia y corresponsabilidad que queremos heredar.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TECHNICAL SHEET & EDITABLE GLOBAL CONFIGURATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card A: General Metadata */}
        <div className="bg-cyan-50/40 border border-cyan-200/80 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(6,182,212,0.05)] space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-150 pb-4">
            <div className="flex items-center space-x-2">
              <Landmark className="w-5 h-5 text-cyan-600" />
              <h3 className="font-display font-black text-cyan-950 text-sm uppercase tracking-tight">
                Ficha Técnica del Proyecto
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded font-extrabold uppercase border border-cyan-200">
              Metadatos
            </span>
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-3.5 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-cyan-800/80 font-bold uppercase block text-[8px]">Categoría del Proyecto</label>
                  <input
                    type="text"
                    value={editedData.categoria}
                    onChange={(e) => setEditedData((prev) => ({ ...prev, categoria: e.target.value }))}
                    className="w-full bg-white border border-cyan-200 rounded-xl p-2.5 text-slate-800 font-sans focus:outline-cyan-400 focus:bg-white text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-cyan-800/80 font-bold uppercase block text-[8px]">Institución Co-Gestora Base</label>
                  <input
                    type="text"
                    value={editedData.institucionBase}
                    onChange={(e) => setEditedData((prev) => ({ ...prev, institucionBase: e.target.value }))}
                    className="w-full bg-white border border-cyan-200 rounded-xl p-2.5 text-slate-800 font-sans focus:outline-cyan-400 focus:bg-white text-xs font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs font-mono">
                <div className="bg-white rounded-xl p-4 border border-cyan-150/70 flex items-start gap-3 shadow-2xs">
                  <BookOpen className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-cyan-800/70 block uppercase text-[8px] font-bold">Categoría Oficial</span>
                    <span className="text-cyan-950 font-bold text-xs tracking-tight">{metadata.categoria}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-cyan-150/70 flex items-start gap-3 shadow-2xs">
                  <Landmark className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-cyan-800/70 block uppercase text-[8px] font-bold">Institución Co-Gestora Base</span>
                    <span className="text-cyan-950 font-bold text-xs tracking-tight">{metadata.institucionBase}</span>
                  </div>
                </div>
              </div>
            )}

            {/* UNIFIED ADVISOR COMPONENT (READ ONLY / AUTO CALC FROM TEAM) */}
            <div className="bg-white rounded-xl p-4 border border-cyan-150/70 flex items-start gap-3 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-cyan-800/70 block uppercase text-[8px] font-bold">Asesora Oficial COAR</span>
                <span className="text-cyan-950 font-bold text-xs tracking-tight block truncate">
                  {nombreAsesora}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Global Carbon Goal & Social Networks (All Editable) */}
        <div className="bg-cyan-50/40 border border-cyan-200/80 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(6,182,212,0.05)] space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-150 pb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-600" />
              <h3 className="font-display font-black text-cyan-950 text-sm uppercase tracking-tight">
                Metas y Canales Oficiales
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-extrabold uppercase border border-teal-200">
              Admin
            </span>
          </div>

          <div className="space-y-4">
            {/* Meta de Carbono Global Input */}
            <div>
              <label className="block text-[8px] font-mono text-cyan-800/80 uppercase mb-1 font-bold">
                Meta Global de Carbono del Proyecto (kg CO₂)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.metaGlobalCO2 || 1500}
                  onChange={(e) => setEditedData((prev) => ({ ...prev, metaGlobalCO2: Number(e.target.value) }))}
                  className="w-full bg-white border border-cyan-200 rounded-xl p-2.5 text-slate-800 font-mono focus:outline-cyan-400 focus:bg-white text-xs font-bold"
                  placeholder="Ej. 1500"
                />
              ) : (
                <div className="bg-white rounded-xl p-3 border border-cyan-150/70 flex items-center justify-between shadow-2xs">
                  <span className="text-xs font-mono font-bold text-cyan-800/80">Meta Global de Respaldo:</span>
                  <span className="text-sm font-mono font-black text-cyan-600">
                    {(metadata.metaGlobalCO2 || 1500).toFixed(0)} kg CO₂
                  </span>
                </div>
              )}
            </div>

            {/* TikTok Config */}
            <div className="border border-cyan-150 rounded-xl p-3.5 space-y-3 bg-white shadow-2xs">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-cyan-700 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.43-.17-.11-.32-.23-.48-.36v7.24c0 1.27-.31 2.56-.93 3.65-1.16 2.05-3.5 3.34-5.85 3.17-2.73-.08-5.22-2.12-5.75-4.8-.62-2.78.71-5.86 3.19-7.1 1.02-.53 2.19-.74 3.34-.64V13.8c-.89-.13-1.85.08-2.58.63-.8.56-1.21 1.58-1.07 2.54.14.99.98 1.8 1.96 1.89 1.15.11 2.27-.64 2.54-1.74.07-.3.09-.6.09-.9V0h1.88z" />
                </svg>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-800">TikTok del Proyecto</span>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] font-mono text-cyan-800/70 block uppercase mb-0.5">Usuario</label>
                    <input
                      type="text"
                      value={editedData.tiktokUser || ''}
                      onChange={(e) => setEditedData((prev) => ({ ...prev, tiktokUser: e.target.value }))}
                      className="w-full bg-white border border-cyan-200 rounded-lg p-2 text-slate-800 font-sans focus:outline-cyan-400 focus:bg-white text-xs"
                      placeholder="@ecologicalrace"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-cyan-800/70 block uppercase mb-0.5">URL Directa</label>
                    <input
                      type="text"
                      value={editedData.tiktokUrl || ''}
                      onChange={(e) => setEditedData((prev) => ({ ...prev, tiktokUrl: e.target.value }))}
                      className="w-full bg-white border border-cyan-200 rounded-lg p-2 text-slate-800 font-sans focus:outline-cyan-400 focus:bg-white text-xs"
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-cyan-800/60">Usuario:</span>
                    <span className="text-cyan-950 font-bold">{metadata.tiktokUser || '@ecologicalrace'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-800/60">Enlace:</span>
                    <a href={metadata.tiktokUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline truncate max-w-[200px]">
                      {metadata.tiktokUrl || 'No definido'}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Instagram Config */}
            <div className="border border-cyan-150 rounded-xl p-3.5 space-y-3 bg-white shadow-2xs">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-cyan-700 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-800">Instagram del Proyecto</span>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] font-mono text-cyan-800/70 block uppercase mb-0.5">Usuario</label>
                    <input
                      type="text"
                      value={editedData.instagramUser || ''}
                      onChange={(e) => setEditedData((prev) => ({ ...prev, instagramUser: e.target.value }))}
                      className="w-full bg-white border border-cyan-200 rounded-lg p-2 text-slate-800 font-sans focus:outline-cyan-400 focus:bg-white text-xs"
                      placeholder="@ecologicalrace"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-mono text-cyan-800/70 block uppercase mb-0.5">URL Directa</label>
                    <input
                      type="text"
                      value={editedData.instagramUrl || ''}
                      onChange={(e) => setEditedData((prev) => ({ ...prev, instagramUrl: e.target.value }))}
                      className="w-full bg-white border border-cyan-200 rounded-lg p-2 text-slate-800 font-sans focus:outline-cyan-400 focus:bg-white text-xs"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-cyan-800/60">Usuario:</span>
                    <span className="text-cyan-950 font-bold">{metadata.instagramUser || '@ecologicalrace'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-800/60">Enlace:</span>
                    <a href={metadata.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline truncate max-w-[200px]">
                      {metadata.instagramUrl || 'No definido'}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div> {/* Closes Card B div */}
        </div> {/* Closes Grid (Card A & B) opened at line 338 */}
      </div>

      {/* 2 APARTADOS INFORMATIVOS FIJOS - ESTILO ESMERALDA CIBERNÉTICA / QUANTUM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        
        {/* APARTADO 1 - BONUS DE CARBONO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-emerald-950 border border-emerald-800/40 p-6 md:p-8 shadow-[0_0_30px_rgba(16,185,129,0.06)] hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] transition-all duration-500 flex flex-col justify-between group"
        >
          {/* Cyberpunk Grid Background Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none rounded-3xl" />
          
          {/* Glowing Ambient Light in the corner */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* HUD Header */}
            <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-1.5 rounded-full bg-emerald-500/20 blur-xs animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-emerald-900 border border-emerald-500/40 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-emerald-400 fill-emerald-500/10 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-base uppercase tracking-wider">
                    Bonus de Carbono
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[9px] font-mono text-emerald-400/80 font-bold uppercase tracking-widest">
                      Eco-Quantum Tracker
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                CO₂ Evitado
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
              El <span className="text-emerald-400 font-semibold font-mono">Bonus de Carbono</span> mide en kilogramos la cantidad de <span className="text-emerald-400 font-semibold font-mono">CO₂</span> (gases de efecto invernadero) que se evita emitir gracias al reciclaje de cada aula, calculated en tiempo real según el tipo de material procesado.
            </p>

            {/* Futuristic Tech Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              {/* Plástico Card */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative overflow-hidden bg-emerald-900/40 border border-emerald-800/60 hover:border-emerald-500/40 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3 group/item transition-all duration-300 shadow-inner"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-2xl shadow-md relative group-hover/item:border-emerald-500/40 transition-colors">
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  🥤
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-100 tracking-wider uppercase font-display">Plástico</span>
                  <div className="text-[9px] font-mono text-emerald-300/85 font-bold uppercase tracking-wider">1 KG Reciclado =</div>
                  <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/20 mt-1">
                    <span className="text-xs font-mono font-black text-emerald-400 tracking-tight">1.5 kg CO₂</span>
                  </div>
                </div>
              </motion.div>

              {/* Aluminio Card */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative overflow-hidden bg-emerald-900/40 border border-emerald-800/60 hover:border-cyan-500/40 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3 group/item transition-all duration-300 shadow-inner"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-2xl shadow-md relative group-hover/item:border-cyan-500/40 transition-colors">
                  <div className="absolute inset-0 bg-cyan-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  🥫
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-100 tracking-wider uppercase font-display">Aluminio</span>
                  <div className="text-[9px] font-mono text-emerald-300/85 font-bold uppercase tracking-wider">1 KG Reciclado =</div>
                  <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/20 mt-1">
                    <span className="text-xs font-mono font-black text-cyan-400 tracking-tight">9.0 kg CO₂</span>
                  </div>
                </div>
              </motion.div>

              {/* Papel Card */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative overflow-hidden bg-emerald-900/40 border border-emerald-800/60 hover:border-teal-500/40 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3 group/item transition-all duration-300 shadow-inner"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-2xl shadow-md relative group-hover/item:border-teal-500/40 transition-colors">
                  <div className="absolute inset-0 bg-teal-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  📦
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-black text-slate-100 tracking-wider uppercase font-display">Papel</span>
                  <div className="text-[9px] font-mono text-emerald-300/85 font-bold uppercase tracking-wider">1 KG Reciclado =</div>
                  <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-teal-500/5 border border-teal-500/20 mt-1">
                    <span className="text-xs font-mono font-black text-teal-400 tracking-tight">1.0 kg CO₂</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>

        {/* APARTADO 2 - RETOS DE ECOEFICIENCIA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-emerald-950 border border-emerald-800/40 p-6 md:p-8 shadow-[0_0_30px_rgba(6,182,212,0.06)] hover:shadow-[0_0_30px_rgba(6,182,212,0.12)] transition-all duration-500 flex flex-col justify-between group"
        >
          {/* Cyberpunk Grid Background Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none rounded-3xl" />
          
          {/* Glowing Ambient Light in the corner */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-500" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* HUD Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/15 pb-4">
              <div className="flex items-center space-x-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-1.5 rounded-full bg-cyan-500/20 blur-xs animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-emerald-900 border border-emerald-500/40 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-cyan-400 fill-cyan-500/10 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-base uppercase tracking-wider">
                    Retos de Ecoeficiencia
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                    <span className="text-[9px] font-mono text-cyan-400/80 font-bold uppercase tracking-widest">
                      Global Ecoeficiencia Engine
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                +20% Multiplicador
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
              Cada aula puede ganar el <span className="text-cyan-400 font-semibold font-mono">Multiplicador Verde (+20% sobre sus kg recolectados)</span> si cumple al 100% una cartilla diaria de buenas prácticas ambientales en el salón:
            </p>

            {/* List of Cyber Challenges */}
            <div className="space-y-3 pt-2">
              
              {/* Item 1 */}
              <div className="relative group/line overflow-hidden bg-emerald-950/40 rounded-2xl p-4 border border-emerald-800/60 hover:border-cyan-500/30 transition-all duration-300 flex items-center gap-4">
                <div className="absolute inset-y-0 left-0 w-[3px] bg-yellow-500/50" />
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-yellow-400 shrink-0 relative shadow-sm">
                  <div className="absolute inset-0 bg-yellow-500/5 rounded-xl" />
                  <Zap className="w-5 h-5 fill-yellow-500/10" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                    Apagar Luces
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">Apagar las luces cuando no se usan.</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative group/line overflow-hidden bg-emerald-950/40 rounded-2xl p-4 border border-emerald-800/60 hover:border-cyan-500/30 transition-all duration-300 flex items-center gap-4">
                <div className="absolute inset-y-0 left-0 w-[3px] bg-cyan-500/50" />
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-cyan-400 shrink-0 relative shadow-sm">
                  <div className="absolute inset-0 bg-cyan-500/5 rounded-xl" />
                  <Droplet className="w-5 h-5 fill-cyan-500/10" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                    Cerrar Caños
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">Cerrar bien los caños de agua.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative group/line overflow-hidden bg-emerald-950/40 rounded-2xl p-4 border border-emerald-800/60 hover:border-cyan-500/30 transition-all duration-300 flex items-center gap-4">
                <div className="absolute inset-y-0 left-0 w-[3px] bg-emerald-500/50" />
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0 relative shadow-sm">
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-xl" />
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                    Uso Responsable del Papel
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">Usar el papel de forma responsable (ambas caras, sin desperdiciar).</p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. ACTIONS BAR */}
      {isEditing && (
        <div className="flex items-center justify-end gap-3 p-5 bg-white border border-cyan-200 rounded-2xl shadow-md">
          <button
            onClick={handleCancel}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <X className="w-4 h-4" />
            <span>Cancelar Edición</span>
          </button>
          <button
            onClick={handleSave}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 font-bold shadow-md hover:shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      )}
    </div>
  );
}
