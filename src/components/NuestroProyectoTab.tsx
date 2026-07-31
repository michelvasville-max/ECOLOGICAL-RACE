import React, { useState } from 'react';
import { ShieldCheck, Heart, Globe, Landmark, Edit, Save, X, Image as ImageIcon, Sparkles, BookOpen, Target, Upload, Leaf, Flame, Zap, Droplet, FileText, Trash2, Plus, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { IntegranteEquipo } from '../types';

export interface RedSocial {
  id: string;
  nombre: string;
  icono: string;
  usuario: string;
  url: string;
}

export const DEFAULT_REDES_SOCIALES: RedSocial[] = [
  {
    id: 'tiktok-default',
    nombre: 'TikTok',
    icono: 'tiktok',
    usuario: '@ecologicalrace',
    url: 'https://www.tiktok.com/@ecologicalrace'
  },
  {
    id: 'instagram-default',
    nombre: 'Instagram',
    icono: 'instagram',
    usuario: '@ecologicalrace',
    url: 'https://www.instagram.com/ecologicalrace'
  }
];

export interface MaterialBonus {
  id: string;
  icono: string;
  nombre: string;
  valorCO2: number;
}

export interface RetoEcoeficiencia {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
}

export const DEFAULT_MATERIALES_BONUS: MaterialBonus[] = [
  { id: 'plastico-default', icono: '🥤', nombre: 'Plástico', valorCO2: 1.5 },
  { id: 'aluminio-default', icono: '🥫', nombre: 'Aluminio', valorCO2: 9.0 },
  { id: 'papel-default', icono: '📦', nombre: 'Papel / Cartón', valorCO2: 1.0 }
];

export const DEFAULT_RETOS_ECOEFICIENCIA: RetoEcoeficiencia[] = [
  { id: 'luces-default', icono: '💡', nombre: 'Apagar Luces', descripcion: 'Apagar las luces cuando no se usan.' },
  { id: 'canos-default', icono: '💧', nombre: 'Cerrar Caños', descripcion: 'Cerrar bien los caños de agua.' },
  { id: 'papel-reto-default', icono: '📄', nombre: 'Uso Responsable del Papel', descripcion: 'Usar el papel de forma responsable (ambas caras, sin desperdiciar).' }
];

export interface ManualSeccion {
  id: string;
  pregunta: string;
  respuesta: string;
}

export const DEFAULT_MANUAL_SECCIONES: ManualSeccion[] = [
  {
    id: 'm1',
    pregunta: '¿Cuál fue la finalidad de crear esta plataforma?',
    respuesta: 'Ecological Race es el proyecto de reciclaje escolar impulsado por el COAR Cajamarca. Esta plataforma web se creó para darle seguimiento en vivo: aquí puedes ver el ranking de aulas, consultar los reportes semanales de pesaje y seguir el avance del proyecto en tiempo real.'
  },
  {
    id: 'm2',
    pregunta: 'Tipos de acceso',
    respuesta: '• Visitante: puede ver todo el contenido público (ranking, reportes, instituciones, proyecto). Si inicia sesión con Google, también puede comentar y reaccionar a las evidencias.\n• Administrador: además de todo lo anterior, puede editar información, cargar pesajes, subir evidencias y moderar comentarios. Se activa con un código de acceso especial, independiente del login de Google.'
  },
  {
    id: 'm3',
    pregunta: '¿Cómo funciona el Ranking?',
    respuesta: 'Mide los kg reciclados y el CO₂ evitado por cada aula, determinando así el primer lugar.'
  },
  {
    id: 'm4',
    pregunta: '¿Cómo se registra el pesaje semanal?',
    respuesta: 'Entrar a "Reportes Semanales y Evidencias" → seleccionar el aula → cargar el pesaje de cada material (función de Administrador).'
  },
  {
    id: 'm5',
    pregunta: '¿Qué es el Bonus de Carbono?',
    respuesta: 'Cada kilogramo reciclado equivale a una cantidad distinta de CO₂ evitado según el material (plástico, aluminio, papel).'
  },
  {
    id: 'm6',
    pregunta: '¿Qué son los Retos de Ecoeficiencia?',
    respuesta: 'Cada aula puede ganar el Multiplicador Verde (+20% sobre sus kg recolectados) si cumple al 100% una cartilla diaria de buenas prácticas ambientales.'
  },
  {
    id: 'm7',
    pregunta: '¿Cómo comentar o reaccionar a una evidencia?',
    respuesta: 'Cualquier visitante que inicie sesión con Google puede dejar comentarios y reaccionar con 👍 a las fotos publicadas en el Mosaico de Evidencias.'
  },
  {
    id: 'm8',
    pregunta: '¿Tienes un problema o duda?',
    respuesta: 'Escríbenos directamente a través de nuestro botón de "Solicitar Apoyo" o al correo oficial de soporte.'
  }
];

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
  redesSociales?: RedSocial[];
  materialesBonus?: MaterialBonus[];
  retosEcoeficiencia?: RetoEcoeficiencia[];
  manualSecciones?: ManualSeccion[];
  donacionesQrUrl?: string;
  donacionesTitular?: string;
  aliadosIntroTexto?: string;
  aliadosImagenUrl?: string;
  actividadesImagenUrl?: string;
}

export function obtenerManualSecciones(metadata?: ProyectoMetadata | null): ManualSeccion[] {
  if (!metadata) return DEFAULT_MANUAL_SECCIONES;
  if (metadata.manualSecciones && metadata.manualSecciones.length > 0) {
    return metadata.manualSecciones;
  }
  return DEFAULT_MANUAL_SECCIONES;
}

export function obtenerMaterialesBonus(metadata?: ProyectoMetadata | null): MaterialBonus[] {
  if (!metadata) return DEFAULT_MATERIALES_BONUS;
  if (metadata.materialesBonus && metadata.materialesBonus.length > 0) {
    return metadata.materialesBonus;
  }
  return DEFAULT_MATERIALES_BONUS;
}

export function obtenerRetosEcoeficiencia(metadata?: ProyectoMetadata | null): RetoEcoeficiencia[] {
  if (!metadata) return DEFAULT_RETOS_ECOEFICIENCIA;
  if (metadata.retosEcoeficiencia && metadata.retosEcoeficiencia.length > 0) {
    return metadata.retosEcoeficiencia;
  }
  return DEFAULT_RETOS_ECOEFICIENCIA;
}

export function obtenerRedesSociales(metadata?: ProyectoMetadata | null): RedSocial[] {
  if (!metadata) return DEFAULT_REDES_SOCIALES;
  if (metadata.redesSociales && metadata.redesSociales.length > 0) {
    return metadata.redesSociales;
  }
  const result: RedSocial[] = [];
  if (metadata.tiktokUser || metadata.tiktokUrl) {
    result.push({
      id: 'tiktok-fallback',
      nombre: 'TikTok',
      icono: 'tiktok',
      usuario: metadata.tiktokUser || '@ecologicalrace',
      url: metadata.tiktokUrl || 'https://www.tiktok.com/@ecologicalrace'
    });
  }
  if (metadata.instagramUser || metadata.instagramUrl) {
    result.push({
      id: 'instagram-fallback',
      nombre: 'Instagram',
      icono: 'instagram',
      usuario: metadata.instagramUser || '@ecologicalrace',
      url: metadata.instagramUrl || 'https://www.instagram.com/ecologicalrace'
    });
  }
  if (result.length === 0) {
    return DEFAULT_REDES_SOCIALES;
  }
  return result;
}

export function renderSocialIcon(icono: string = '', className: string = 'w-4 h-4') {
  const norm = (icono || '').toLowerCase();
  if (norm.includes('tiktok')) {
    return (
      <svg className={`${className} fill-current`} viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.43-.17-.11-.32-.23-.48-.36v7.24c0 1.27-.31 2.56-.93 3.65-1.16 2.05-3.5 3.34-5.85 3.17-2.73-.08-5.22-2.12-5.75-4.8-.62-2.78.71-5.86 3.19-7.1 1.02-.53 2.19-.74 3.34-.64V13.8c-.89-.13-1.85.08-2.58.63-.8.56-1.21 1.58-1.07 2.54.14.99.98 1.8 1.96 1.89 1.15.11 2.27-.64 2.54-1.74.07-.3.09-.6.09-.9V0h1.88z" />
      </svg>
    );
  }
  if (norm.includes('instagram')) {
    return (
      <svg className={`${className} fill-none stroke-current stroke-2`} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (norm.includes('facebook')) {
    return (
      <svg className={`${className} fill-current`} viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  if (norm.includes('youtube')) {
    return (
      <svg className={`${className} fill-current`} viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (norm.includes('x') || norm.includes('twitter')) {
    return (
      <svg className={`${className} fill-current`} viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (norm.includes('whatsapp')) {
    return (
      <svg className={`${className} fill-current`} viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99 0-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
      </svg>
    );
  }
  return <Globe className={className} />;
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
    redesSociales: obtenerRedesSociales(metadata),
    materialesBonus: obtenerMaterialesBonus(metadata),
    retosEcoeficiencia: obtenerRetosEcoeficiencia(metadata)
  });

  React.useEffect(() => {
    setEditedData({
      ...metadata,
      metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
      imagenMisionUrl: metadata.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      imagenVisionUrl: metadata.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      redesSociales: obtenerRedesSociales(metadata),
      materialesBonus: obtenerMaterialesBonus(metadata),
      retosEcoeficiencia: obtenerRetosEcoeficiencia(metadata)
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
      redesSociales: obtenerRedesSociales(metadata),
      materialesBonus: obtenerMaterialesBonus(metadata),
      retosEcoeficiencia: obtenerRetosEcoeficiencia(metadata)
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
                  redesSociales: obtenerRedesSociales(metadata),
                  materialesBonus: obtenerMaterialesBonus(metadata),
                  retosEcoeficiencia: obtenerRetosEcoeficiencia(metadata)
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
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-xl p-4 border border-cyan-150/70 hover:border-cyan-400 flex items-start gap-3 shadow-2xs transition-all duration-300"
                >
                  <BookOpen className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-cyan-800/70 block uppercase text-[8px] font-bold">Categoría Oficial</span>
                    <span className="text-cyan-950 font-bold text-xs tracking-tight">{metadata.categoria}</span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-xl p-4 border border-cyan-150/70 hover:border-cyan-400 flex items-start gap-3 shadow-2xs transition-all duration-300"
                >
                  <Landmark className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-cyan-800/70 block uppercase text-[8px] font-bold">Institución Co-Gestora Base</span>
                    <span className="text-cyan-950 font-bold text-xs tracking-tight">{metadata.institucionBase}</span>
                  </div>
                </motion.div>
              </div>
            )}

            {/* UNIFIED ADVISOR COMPONENT (READ ONLY / AUTO CALC FROM TEAM) */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl p-4 border border-cyan-150/70 hover:border-cyan-400 flex items-start gap-3 shadow-2xs transition-all duration-300"
            >
              <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-cyan-800/70 block uppercase text-[8px] font-bold">Asesora Oficial COAR</span>
                <span className="text-cyan-950 font-bold text-xs tracking-tight block truncate">
                  {nombreAsesora}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Card B: Global Carbon Goal & Social Networks (All Editable) */}
        <div className="bg-cyan-50/40 border border-cyan-200/80 rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(6,182,212,0.05)] space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-150 pb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-600" />
              <h3 className="font-display font-black text-cyan-950 text-sm uppercase tracking-tight">
                Metas y Canales Oficiales
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              {rolActual === 'ADMIN' && (
                !isEditing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditedData({
                        ...metadata,
                        metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
                        imagenMisionUrl: metadata.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
                        imagenVisionUrl: metadata.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
                        redesSociales: obtenerRedesSociales(metadata)
                      });
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm cursor-pointer transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm cursor-pointer transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-[11px] font-bold px-2.5 py-1.5 rounded-xl cursor-pointer transition"
                      title="Cancelar cambios"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              )}
              <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-extrabold uppercase border border-teal-200">
                Admin
              </span>
            </div>
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
                <motion.div 
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-xl p-3 border border-cyan-150/70 hover:border-cyan-400 flex items-center justify-between shadow-2xs transition-all duration-300"
                >
                  <span className="text-xs font-mono font-bold text-cyan-800/80">Meta Global de Respaldo:</span>
                  <span className="text-sm font-mono font-black text-cyan-600">
                    {(metadata.metaGlobalCO2 || 1500).toFixed(0)} kg CO₂
                  </span>
                </motion.div>
              )}
            </div>

            {/* Dynamic Social Networks List */}
            <div className="space-y-3 pt-2 border-t border-cyan-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-cyan-900">
                  Canales Oficiales y Redes Sociales
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentList = editedData.redesSociales || obtenerRedesSociales(metadata);
                      const nuevaRed: RedSocial = {
                        id: `red-${Date.now()}`,
                        nombre: 'Facebook',
                        icono: 'facebook',
                        usuario: '@ecologicalrace',
                        url: 'https://facebook.com/ecologicalrace'
                      };
                      setEditedData((prev) => ({
                        ...prev,
                        redesSociales: [...currentList, nuevaRed]
                      }));
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-cyan-600 hover:bg-cyan-700 text-white px-2.5 py-1 rounded-lg transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Red</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  {(editedData.redesSociales || obtenerRedesSociales(metadata)).map((red, idx) => (
                    <div key={red.id || idx} className="border border-cyan-200 rounded-xl p-3.5 space-y-3 bg-white shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-cyan-700">
                            {renderSocialIcon(red.icono || red.nombre, 'w-4 h-4')}
                          </span>
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-800">
                            Red #{idx + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = editedData.redesSociales || obtenerRedesSociales(metadata);
                            const updated = currentList.filter((_, i) => i !== idx);
                            setEditedData((prev) => ({ ...prev, redesSociales: updated }));
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                          title="Eliminar red social"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[8px] font-mono text-cyan-800/70 block uppercase mb-0.5">Nombre Red</label>
                          <input
                            type="text"
                            value={red.nombre}
                            onChange={(e) => {
                              const currentList = [...(editedData.redesSociales || obtenerRedesSociales(metadata))];
                              currentList[idx] = { ...currentList[idx], nombre: e.target.value };
                              setEditedData((prev) => ({ ...prev, redesSociales: currentList }));
                            }}
                            className="w-full bg-white border border-cyan-200 rounded-lg p-1.5 text-slate-800 font-sans focus:outline-cyan-400 text-xs"
                            placeholder="Ej. Facebook"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] font-mono text-cyan-800/70 block uppercase mb-0.5">Tipo / Ícono</label>
                          <select
                            value={red.icono || 'globe'}
                            onChange={(e) => {
                              const currentList = [...(editedData.redesSociales || obtenerRedesSociales(metadata))];
                              currentList[idx] = { ...currentList[idx], icono: e.target.value };
                              setEditedData((prev) => ({ ...prev, redesSociales: currentList }));
                            }}
                            className="w-full bg-white border border-cyan-200 rounded-lg p-1.5 text-slate-800 font-sans focus:outline-cyan-400 text-xs"
                          >
                            <option value="tiktok">TikTok</option>
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                            <option value="youtube">YouTube</option>
                            <option value="x">X / Twitter</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="globe">Web / Sitio</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[8px] font-mono text-cyan-800/70 block uppercase mb-0.5">Usuario / Identificador</label>
                          <input
                            type="text"
                            value={red.usuario}
                            onChange={(e) => {
                              const currentList = [...(editedData.redesSociales || obtenerRedesSociales(metadata))];
                              currentList[idx] = { ...currentList[idx], usuario: e.target.value };
                              setEditedData((prev) => ({ ...prev, redesSociales: currentList }));
                            }}
                            className="w-full bg-white border border-cyan-200 rounded-lg p-1.5 text-slate-800 font-sans focus:outline-cyan-400 text-xs"
                            placeholder="Ej. @ecologicalrace"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] font-mono text-cyan-800/70 block uppercase mb-0.5">Enlace URL</label>
                          <input
                            type="text"
                            value={red.url}
                            onChange={(e) => {
                              const currentList = [...(editedData.redesSociales || obtenerRedesSociales(metadata))];
                              currentList[idx] = { ...currentList[idx], url: e.target.value };
                              setEditedData((prev) => ({ ...prev, redesSociales: currentList }));
                            }}
                            className="w-full bg-white border border-cyan-200 rounded-lg p-1.5 text-slate-800 font-sans focus:outline-cyan-400 text-xs"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!editedData.redesSociales || editedData.redesSociales.length === 0) && (
                    <p className="text-xs text-slate-400 font-mono text-center py-2">
                      No hay redes sociales configuradas. Haz clic en "Agregar Red".
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {obtenerRedesSociales(metadata).map((red) => (
                    <motion.div 
                      key={red.id || red.nombre}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="border border-cyan-150 hover:border-cyan-400 rounded-xl p-3 bg-white shadow-2xs flex items-center justify-between transition-all duration-300"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                          {renderSocialIcon(red.icono || red.nombre, 'w-4 h-4')}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-900 block leading-none truncate">
                            {red.nombre}
                          </span>
                          <span className="text-xs font-mono font-semibold text-cyan-700 block truncate">
                            {red.usuario}
                          </span>
                        </div>
                      </div>
                      <a
                        href={red.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-600 hover:text-cyan-800 hover:underline bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100 transition shrink-0"
                      >
                        <span>Visitar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
            <div className="flex items-center justify-between border-b border-emerald-500/15 pb-4 flex-wrap gap-2">
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

              <div className="flex items-center gap-2">
                {rolActual === 'ADMIN' && (
                  !isEditing ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditedData({
                          ...metadata,
                          metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
                          imagenMisionUrl: metadata.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
                          imagenVisionUrl: metadata.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
                          redesSociales: obtenerRedesSociales(metadata),
                          materialesBonus: obtenerMaterialesBonus(metadata),
                          retosEcoeficiencia: obtenerRetosEcoeficiencia(metadata)
                        });
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs cursor-pointer transition"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs cursor-pointer transition"
                    >
                      <Save className="w-3 h-3" />
                      <span>Guardar</span>
                    </button>
                  )
                )}
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  CO₂ Evitado
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
              El <span className="text-emerald-400 font-semibold font-mono">Bonus de Carbono</span> mide en kilogramos la cantidad de <span className="text-emerald-400 font-semibold font-mono">CO₂</span> (gases de efecto invernadero) que se evita emitir gracias al reciclaje de cada aula, calculado en tiempo real según el tipo de material procesado.
            </p>

            {/* Dynamic Materials Grid or Edit List */}
            {isEditing ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-300">
                    Materiales del Bonus de Carbono
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentList = editedData.materialesBonus || obtenerMaterialesBonus(metadata);
                      const nuevoMat: MaterialBonus = {
                        id: `mat-${Date.now()}`,
                        icono: '📦',
                        nombre: 'Nuevo Material',
                        valorCO2: 1.0
                      };
                      setEditedData((prev) => ({ ...prev, materialesBonus: [...currentList, nuevoMat] }));
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Material</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(editedData.materialesBonus || obtenerMaterialesBonus(metadata)).map((mat, idx) => (
                    <div key={mat.id || idx} className="bg-emerald-900/60 border border-emerald-700/60 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">
                          Material #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = editedData.materialesBonus || obtenerMaterialesBonus(metadata);
                            const updated = currentList.filter((_, i) => i !== idx);
                            setEditedData((prev) => ({ ...prev, materialesBonus: updated }));
                          }}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition cursor-pointer"
                          title="Eliminar material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[8px] font-mono text-emerald-300/80 block uppercase mb-0.5">Ícono / Emoji</label>
                          <input
                            type="text"
                            value={mat.icono}
                            onChange={(e) => {
                              const currentList = [...(editedData.materialesBonus || obtenerMaterialesBonus(metadata))];
                              currentList[idx] = { ...currentList[idx], icono: e.target.value };
                              setEditedData((prev) => ({ ...prev, materialesBonus: currentList }));
                            }}
                            className="w-full bg-emerald-950/80 border border-emerald-700 rounded-lg p-1.5 text-white font-sans text-xs focus:outline-emerald-400"
                            placeholder="Ej. 🥤"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] font-mono text-emerald-300/80 block uppercase mb-0.5">Nombre Material</label>
                          <input
                            type="text"
                            value={mat.nombre}
                            onChange={(e) => {
                              const currentList = [...(editedData.materialesBonus || obtenerMaterialesBonus(metadata))];
                              currentList[idx] = { ...currentList[idx], nombre: e.target.value };
                              setEditedData((prev) => ({ ...prev, materialesBonus: currentList }));
                            }}
                            className="w-full bg-emerald-950/80 border border-emerald-700 rounded-lg p-1.5 text-white font-sans text-xs focus:outline-emerald-400"
                            placeholder="Ej. Plástico"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] font-mono text-emerald-300/80 block uppercase mb-0.5">Valor CO₂ (kg/kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={mat.valorCO2}
                            onChange={(e) => {
                              const currentList = [...(editedData.materialesBonus || obtenerMaterialesBonus(metadata))];
                              currentList[idx] = { ...currentList[idx], valorCO2: parseFloat(e.target.value) || 0 };
                              setEditedData((prev) => ({ ...prev, materialesBonus: currentList }));
                            }}
                            className="w-full bg-emerald-950/80 border border-emerald-700 rounded-lg p-1.5 text-white font-sans text-xs focus:outline-emerald-400"
                            placeholder="Ej. 1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!editedData.materialesBonus || editedData.materialesBonus.length === 0) && (
                    <p className="text-xs text-slate-400 font-mono text-center py-2">
                      No hay materiales configurados. Haz clic en "Agregar Material".
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {obtenerMaterialesBonus(metadata).map((mat) => (
                  <motion.div 
                    key={mat.id || mat.nombre}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="relative overflow-hidden bg-emerald-900/40 border border-emerald-800/60 hover:border-emerald-500/40 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3 group/item transition-all duration-300 shadow-inner"
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-2xl shadow-md relative group-hover/item:border-emerald-500/40 transition-colors">
                      <div className="absolute inset-0 bg-emerald-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      {mat.icono || '♻️'}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black text-slate-100 tracking-wider uppercase font-display">{mat.nombre}</span>
                      <div className="text-[9px] font-mono text-emerald-300/85 font-bold uppercase tracking-wider">1 KG Reciclado =</div>
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/20 mt-1">
                        <span className="text-xs font-mono font-black text-emerald-400 tracking-tight">{mat.valorCO2} kg CO₂</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
            <div className="flex items-center justify-between border-b border-cyan-500/15 pb-4 flex-wrap gap-2">
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

              <div className="flex items-center gap-2">
                {rolActual === 'ADMIN' && (
                  !isEditing ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditedData({
                          ...metadata,
                          metaGlobalCO2: metadata.metaGlobalCO2 || 1500,
                          imagenMisionUrl: metadata.imagenMisionUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
                          imagenVisionUrl: metadata.imagenVisionUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
                          redesSociales: obtenerRedesSociales(metadata),
                          materialesBonus: obtenerMaterialesBonus(metadata),
                          retosEcoeficiencia: obtenerRetosEcoeficiencia(metadata)
                        });
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs cursor-pointer transition"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs cursor-pointer transition"
                    >
                      <Save className="w-3 h-3" />
                      <span>Guardar</span>
                    </button>
                  )
                )}
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  +20% Multiplicador
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
              Cada aula puede ganar el <span className="text-cyan-400 font-semibold font-mono">Multiplicador Verde (+20% sobre sus kg recolectados)</span> si cumple al 100% una cartilla diaria de buenas prácticas ambientales en el salón:
            </p>

            {/* List of Cyber Challenges or Edit List */}
            {isEditing ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-300">
                    Retos de Ecoeficiencia Configurables
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentList = editedData.retosEcoeficiencia || obtenerRetosEcoeficiencia(metadata);
                      const nuevoReto: RetoEcoeficiencia = {
                        id: `reto-${Date.now()}`,
                        icono: '🌱',
                        nombre: 'Nuevo Reto',
                        descripcion: 'Descripción del nuevo reto ambiental.'
                      };
                      setEditedData((prev) => ({ ...prev, retosEcoeficiencia: [...currentList, nuevoReto] }));
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded-lg transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Reto</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(editedData.retosEcoeficiencia || obtenerRetosEcoeficiencia(metadata)).map((reto, idx) => (
                    <div key={reto.id || idx} className="bg-emerald-900/60 border border-cyan-800/60 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">
                          Reto #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = editedData.retosEcoeficiencia || obtenerRetosEcoeficiencia(metadata);
                            const updated = currentList.filter((_, i) => i !== idx);
                            setEditedData((prev) => ({ ...prev, retosEcoeficiencia: updated }));
                          }}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition cursor-pointer"
                          title="Eliminar reto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[8px] font-mono text-cyan-300/80 block uppercase mb-0.5">Ícono / Emoji</label>
                          <input
                            type="text"
                            value={reto.icono}
                            onChange={(e) => {
                              const currentList = [...(editedData.retosEcoeficiencia || obtenerRetosEcoeficiencia(metadata))];
                              currentList[idx] = { ...currentList[idx], icono: e.target.value };
                              setEditedData((prev) => ({ ...prev, retosEcoeficiencia: currentList }));
                            }}
                            className="w-full bg-emerald-950/80 border border-cyan-700 rounded-lg p-1.5 text-white font-sans text-xs focus:outline-cyan-400"
                            placeholder="Ej. 💡"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[8px] font-mono text-cyan-300/80 block uppercase mb-0.5">Nombre del Reto</label>
                          <input
                            type="text"
                            value={reto.nombre}
                            onChange={(e) => {
                              const currentList = [...(editedData.retosEcoeficiencia || obtenerRetosEcoeficiencia(metadata))];
                              currentList[idx] = { ...currentList[idx], nombre: e.target.value };
                              setEditedData((prev) => ({ ...prev, retosEcoeficiencia: currentList }));
                            }}
                            className="w-full bg-emerald-950/80 border border-cyan-700 rounded-lg p-1.5 text-white font-sans text-xs focus:outline-cyan-400"
                            placeholder="Ej. Apagar Luces"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[8px] font-mono text-cyan-300/80 block uppercase mb-0.5">Descripción</label>
                          <input
                            type="text"
                            value={reto.descripcion}
                            onChange={(e) => {
                              const currentList = [...(editedData.retosEcoeficiencia || obtenerRetosEcoeficiencia(metadata))];
                              currentList[idx] = { ...currentList[idx], descripcion: e.target.value };
                              setEditedData((prev) => ({ ...prev, retosEcoeficiencia: currentList }));
                            }}
                            className="w-full bg-emerald-950/80 border border-cyan-700 rounded-lg p-1.5 text-white font-sans text-xs focus:outline-cyan-400"
                            placeholder="Ej. Apagar las luces cuando no se usan."
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!editedData.retosEcoeficiencia || editedData.retosEcoeficiencia.length === 0) && (
                    <p className="text-xs text-slate-400 font-mono text-center py-2">
                      No hay retos configurados. Haz clic en "Agregar Reto".
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {obtenerRetosEcoeficiencia(metadata).map((reto) => (
                  <motion.div 
                    key={reto.id || reto.nombre}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="relative group/line overflow-hidden bg-emerald-950/40 rounded-2xl p-4 border border-emerald-800/60 hover:border-cyan-500/40 transition-all duration-300 flex items-center gap-4 cursor-pointer shadow-inner"
                  >
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-cyan-500/50" />
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-cyan-400 shrink-0 relative shadow-sm text-xl">
                      <div className="absolute inset-0 bg-cyan-500/5 rounded-xl" />
                      {reto.icono || '🌱'}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                        {reto.nombre}
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      </h4>
                      <p className="text-[11px] text-slate-300 font-medium mt-0.5">{reto.descripcion}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
