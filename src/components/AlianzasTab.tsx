import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  X,
  ExternalLink,
  ThumbsUp,
  Video,
  Globe,
  MessageSquare,
  Sparkles,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { Aliado, RedSocialAliado, RolUsuario } from '../types';
import { ProyectoMetadata, renderSocialIcon } from './NuestroProyectoTab';
import { subirImagenAFirebase } from '../lib/firebase';

interface Props {
  aliados: Aliado[];
  metadata: ProyectoMetadata;
  rolActual: RolUsuario;
  usuarioGoogle: any;
  iniciarSesionConGoogle?: () => void;
  onGuardarAliado: (aliado: Aliado) => Promise<void>;
  onEliminarAliado: (id: string) => Promise<void>;
  onGuardarMetadata: (metadata: ProyectoMetadata) => Promise<void>;
}

function getEmbedVideoUrl(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // YouTube watch
  if (cleanUrl.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(cleanUrl);
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    } catch (e) {}
  }
  // YouTube short link
  if (cleanUrl.includes('youtu.be/')) {
    const parts = cleanUrl.split('youtu.be/');
    if (parts[1]) {
      const id = parts[1].split('?')[0].split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
  }
  // YouTube embed direct
  if (cleanUrl.includes('youtube.com/embed/')) {
    return cleanUrl;
  }

  // Google Drive
  if (cleanUrl.includes('drive.google.com/file/d/')) {
    const parts = cleanUrl.split('/file/d/');
    if (parts[1]) {
      const fileId = parts[1].split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  return cleanUrl;
}

const RED_SOCIAL_OPCIONES = [
  { id: 'facebook', nombre: 'Facebook' },
  { id: 'instagram', nombre: 'Instagram' },
  { id: 'tiktok', nombre: 'TikTok' },
  { id: 'whatsapp', nombre: 'WhatsApp' },
  { id: 'youtube', nombre: 'YouTube' },
  { id: 'web', nombre: 'Página Web / Sitio' },
  { id: 'linkedin', nombre: 'LinkedIn' }
];

export default function AlianzasTab({
  aliados,
  metadata,
  rolActual,
  usuarioGoogle,
  iniciarSesionConGoogle,
  onGuardarAliado,
  onEliminarAliado,
  onGuardarMetadata
}: Props) {
  // Modal State for Add/Edit Aliado
  const [modalAliadoOpen, setModalAliadoOpen] = useState(false);
  const [aliadoEditando, setAliadoEditando] = useState<Aliado | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [archivoLogo, setArchivoLogo] = useState<File | null>(null);
  const [redes, setRedes] = useState<RedSocialAliado[]>([]);
  const [guardando, setGuardando] = useState(false);

  // Intro message edit state (Admin)
  const [modalIntroOpen, setModalIntroOpen] = useState(false);
  const [introTexto, setIntroTexto] = useState('');
  const [guardandoIntro, setGuardandoIntro] = useState(false);

  const introDefecto =
    "Gracias a las empresas, organizaciones y personas aliadas que forman parte de este proyecto. Su compromiso constante fortalece nuestra misión de reciclaje escolar y ecoeficiencia en la comunidad.";

  const textoIntroActual = metadata.aliadosIntroTexto || introDefecto;

  const abrirModalNuevo = () => {
    setAliadoEditando(null);
    setNombre('');
    setDescripcion('');
    setVideoUrl('');
    setLogoUrl('');
    setArchivoLogo(null);
    setRedes([]);
    setModalAliadoOpen(true);
  };

  const abrirModalEditar = (aliado: Aliado) => {
    setAliadoEditando(aliado);
    setNombre(aliado.nombre || '');
    setDescripcion(aliado.descripcion || '');
    setVideoUrl(aliado.videoUrl || '');
    setLogoUrl(aliado.logoUrl || '');
    setArchivoLogo(null);
    setRedes(aliado.redesSociales ? [...aliado.redesSociales] : []);
    setModalAliadoOpen(true);
  };

  const handleAgregarRed = () => {
    const nueva: RedSocialAliado = {
      id: `red-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      nombre: 'Facebook',
      icono: 'facebook',
      usuario: '@aliado',
      url: 'https://'
    };
    setRedes([...redes, nueva]);
  };

  const handleActualizarRed = (id: string, campo: keyof RedSocialAliado, valor: string) => {
    setRedes(
      redes.map((r) => {
        if (r.id === id) {
          if (campo === 'icono') {
            const opcion = RED_SOCIAL_OPCIONES.find((o) => o.id === valor);
            return { ...r, icono: valor, nombre: opcion ? opcion.nombre : valor };
          }
          return { ...r, [campo]: valor };
        }
        return r;
      })
    );
  };

  const handleEliminarRed = (id: string) => {
    setRedes(redes.filter((r) => r.id !== id));
  };

  const handleGuardarAliadoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("Por favor ingresa el nombre del aliado.");
      return;
    }

    setGuardando(true);
    try {
      let urlFinalLogo = logoUrl;
      if (archivoLogo) {
        urlFinalLogo = await subirImagenAFirebase(archivoLogo, 'aliados');
      }

      const id = aliadoEditando ? aliadoEditando.id : `aliado-${Date.now()}`;
      const aliadoFinal: Aliado = {
        id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        videoUrl: videoUrl.trim(),
        logoUrl: urlFinalLogo,
        redesSociales: redes,
        likes: aliadoEditando ? aliadoEditando.likes || 0 : 0,
        likesUsers: aliadoEditando ? aliadoEditando.likesUsers || [] : []
      };

      await onGuardarAliado(aliadoFinal);
      setModalAliadoOpen(false);
    } catch (error) {
      console.error("Error al guardar aliado:", error);
      alert("Ocurrió un error al guardar los datos del aliado.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarAliadoClick = async (id: string, nombreAliado: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al aliado "${nombreAliado}"?`)) {
      try {
        await onEliminarAliado(id);
      } catch (error) {
        console.error("Error al eliminar aliado:", error);
        alert("Ocurrió un error al eliminar al aliado.");
      }
    }
  };

  const handleReaccionarAliado = async (aliado: Aliado) => {
    if (!usuarioGoogle) {
      alert("Inicia sesión con Google para dar me gusta a este aliado.");
      iniciarSesionConGoogle?.();
      return;
    }

    const uid = usuarioGoogle.uid;
    const yaLeDioLike = aliado.likesUsers?.includes(uid);

    let nuevosLikesUsers: string[] = aliado.likesUsers || [];
    let nuevoLikesCount = aliado.likes || 0;

    if (yaLeDioLike) {
      nuevosLikesUsers = nuevosLikesUsers.filter((u) => u !== uid);
      nuevoLikesCount = Math.max(0, nuevoLikesCount - 1);
    } else {
      nuevosLikesUsers = [...nuevosLikesUsers, uid];
      nuevoLikesCount = nuevoLikesCount + 1;
    }

    const aliadoActualizado: Aliado = {
      ...aliado,
      likes: nuevoLikesCount,
      likesUsers: nuevosLikesUsers
    };

    try {
      await onGuardarAliado(aliadoActualizado);
    } catch (error) {
      console.error("Error al reaccionar al aliado:", error);
    }
  };

  const handleGuardarIntroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoIntro(true);
    try {
      const metaActualizada: ProyectoMetadata = {
        ...metadata,
        aliadosIntroTexto: introTexto.trim()
      };
      await onGuardarMetadata(metaActualizada);
      setModalIntroOpen(false);
    } catch (error) {
      console.error("Error al guardar texto de bienvenida:", error);
      alert("Error al guardar el mensaje.");
    } finally {
      setGuardandoIntro(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Banner & Thank You Section */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-900/80 border border-emerald-500/40 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <Handshake className="w-3.5 h-3.5" />
                Alianzas Estratégicas
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                {aliados.length} {aliados.length === 1 ? 'Aliado Oficial' : 'Aliados Oficiales'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-tight">
              NUESTROS ALIADOS Y AUSPICIADORES
            </h2>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans font-normal border-l-2 border-emerald-400/80 pl-4 py-1">
              {textoIntroActual}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 relative z-10">
            {rolActual === 'ADMIN' && (
              <>
                <button
                  type="button"
                  onClick={abrirModalNuevo}
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition hover:scale-105 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Aliado</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIntroTexto(textoIntroActual);
                    setModalIntroOpen(true);
                  }}
                  className="inline-flex items-center justify-center space-x-1.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs uppercase tracking-wide px-4 py-2.5 rounded-2xl transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Mensaje</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. List of Ally Cards */}
      {aliados.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-mono font-bold text-stone-800 uppercase">
              No hay aliados registrados aún
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Próximamente estaremos publicando las empresas, instituciones y personas que respaldan Ecological Race.
            </p>
          </div>
          {rolActual === 'ADMIN' && (
            <button
              type="button"
              onClick={abrirModalNuevo}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar el primer Aliado</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {aliados.map((aliado) => {
            const embedUrl = getEmbedVideoUrl(aliado.videoUrl);
            const yaLeDioLike = usuarioGoogle && aliado.likesUsers?.includes(usuarioGoogle.uid);

            return (
              <motion.div
                key={aliado.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-all duration-300 space-y-6 relative overflow-hidden"
              >
                {/* Header of Ally Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                  <div className="flex items-center space-x-4">
                    {/* Logo */}
                    {aliado.logoUrl ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-stone-200 bg-stone-50 p-2 flex items-center justify-center shrink-0 shadow-xs">
                        <img
                          src={aliado.logoUrl}
                          alt={aliado.nombre}
                          className="max-w-full max-h-full object-contain rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center justify-center shrink-0 font-mono font-black text-xl shadow-xs">
                        {aliado.nombre.substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Aliado Oficial
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-display uppercase tracking-tight mt-1">
                        {aliado.nombre}
                      </h3>
                    </div>
                  </div>

                  {/* Admin controls */}
                  {rolActual === 'ADMIN' && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => abrirModalEditar(aliado)}
                        className="flex items-center space-x-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                        title="Editar aliado"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEliminarAliadoClick(aliado.id, aliado.nombre)}
                        className="flex items-center space-x-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                        title="Eliminar aliado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Description & Social Networks */}
                  <div className={`space-y-5 ${embedUrl ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-black text-stone-400 uppercase tracking-wider">
                        ¿Cómo apoya al proyecto?
                      </h4>
                      <p className="text-sm text-stone-700 leading-relaxed font-sans font-normal whitespace-pre-line">
                        {aliado.descripcion || 'Aliado comprometido con el cuidado ambiental en nuestra comunidad.'}
                      </p>
                    </div>

                    {/* Social networks */}
                    {aliado.redesSociales && aliado.redesSociales.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-mono font-black text-stone-400 uppercase tracking-wider">
                          Canales Oficiales:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {aliado.redesSociales.map((red) => (
                            <a
                              key={red.id}
                              href={red.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-emerald-50 text-stone-800 hover:text-emerald-800 border border-stone-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition duration-200 group cursor-pointer"
                            >
                              <span className="text-emerald-600 group-hover:scale-110 transition-transform">
                                {renderSocialIcon(red.icono, 'w-4 h-4')}
                              </span>
                              <span>{red.nombre}:</span>
                              <span className="text-stone-500 font-normal">{red.usuario}</span>
                              <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-emerald-600" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Embedded Video */}
                  {embedUrl && (
                    <div className="lg:col-span-6 space-y-2">
                      <h4 className="text-xs font-mono font-black text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-emerald-600" />
                        Video / Evidencia Presentación:
                      </h4>
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/30 shadow-md">
                        <iframe
                          src={embedUrl}
                          title={`Video de ${aliado.nombre}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Reaction 👍 Like */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => handleReaccionarAliado(aliado)}
                    className={`inline-flex items-center space-x-2 text-xs font-mono font-bold px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                      yaLeDioLike
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <span>👍 Me gusta</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md font-mono text-xs">
                      {aliado.likes || 0}
                    </span>
                  </button>

                  <span className="text-[10px] font-mono text-stone-400 uppercase">
                    Ecological Race Partner
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3. MODAL: AGREGAR / EDITAR ALIADO */}
      <AnimatePresence>
        {modalAliadoOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setModalAliadoOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-2xl w-full my-auto cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <Handshake className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-mono font-black text-stone-900 uppercase">
                      {aliadoEditando ? 'Editar Aliado' : 'Agregar Nuevo Aliado'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalAliadoOpen(false)}
                    className="p-1 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleGuardarAliadoSubmit} className="space-y-5 text-left">
                  {/* Nombre */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-stone-700 uppercase">
                      Nombre de la Empresa / Aliado: *
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. WILO SERVIS"
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Logo Image */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-stone-700 uppercase">
                      Logo del Aliado (Opcional):
                    </label>
                    <div className="flex items-center gap-3">
                      {(archivoLogo || logoUrl) && (
                        <div className="w-16 h-16 rounded-xl border border-stone-200 bg-stone-50 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={archivoLogo ? URL.createObjectURL(archivoLogo) : logoUrl}
                            alt="Logo preview"
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                        </div>
                      )}
                      <div className="relative flex-1 border border-dashed border-stone-300 rounded-xl p-3 text-center hover:bg-stone-50 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setArchivoLogo(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="text-xs text-stone-600 font-mono font-bold block truncate">
                          {archivoLogo ? archivoLogo.name : 'Subir o reemplazar imagen del logo...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-stone-700 uppercase">
                      Descripción / ¿Cómo apoya al proyecto?:
                    </label>
                    <textarea
                      rows={3}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe el aporte de la empresa o persona aliada..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Video URL */}
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-stone-700 uppercase">
                      Enlace de Video (YouTube o Google Drive) (Opcional):
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... o https://drive.google.com/file/d/..."
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Redes Sociales Section */}
                  <div className="space-y-3 border-t border-stone-100 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-mono font-bold text-stone-700 uppercase">
                        Redes Sociales / Enlaces Oficiales:
                      </label>
                      <button
                        type="button"
                        onClick={handleAgregarRed}
                        className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Red</span>
                      </button>
                    </div>

                    {redes.length === 0 ? (
                      <p className="text-xs text-stone-400 font-mono italic">
                        No has agregado redes sociales todavía.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {redes.map((r) => (
                          <div
                            key={r.id}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs"
                          >
                            <select
                              value={r.icono}
                              onChange={(e) => handleActualizarRed(r.id, 'icono', e.target.value)}
                              className="bg-white border border-stone-300 rounded-lg px-2 py-1.5 font-mono text-xs"
                            >
                              {RED_SOCIAL_OPCIONES.map((op) => (
                                <option key={op.id} value={op.id}>
                                  {op.nombre}
                                </option>
                              ))}
                            </select>

                            <input
                              type="text"
                              placeholder="Usuario / Nombre (ej. @wiloservis)"
                              value={r.usuario}
                              onChange={(e) => handleActualizarRed(r.id, 'usuario', e.target.value)}
                              className="flex-1 bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-xs font-mono"
                            />

                            <input
                              type="url"
                              placeholder="URL completa (https://...)"
                              value={r.url}
                              onChange={(e) => handleActualizarRed(r.id, 'url', e.target.value)}
                              className="flex-1 bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-xs font-mono"
                            />

                            <button
                              type="button"
                              onClick={() => handleEliminarRed(r.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer shrink-0"
                              title="Quitar esta red"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                    <button
                      type="button"
                      disabled={guardando}
                      onClick={() => setModalAliadoOpen(false)}
                      className="px-4 py-2 text-xs font-mono font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      className="px-5 py-2 text-xs font-mono font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                    >
                      {guardando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Guardar Aliado</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MODAL: EDITAR MENSAJE INTRODUCCIÓN (ADMIN) */}
      <AnimatePresence>
        {modalIntroOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setModalIntroOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-lg w-full cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-stone-200 text-left">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="text-sm font-mono font-black text-stone-900 uppercase flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-emerald-600" />
                    Editar Texto de Agradecimiento
                  </h3>
                  <button
                    type="button"
                    onClick={() => setModalIntroOpen(false)}
                    className="p-1 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleGuardarIntroSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono font-bold text-stone-700 uppercase">
                      Mensaje de Bienvenida / Agradecimiento:
                    </label>
                    <textarea
                      rows={4}
                      value={introTexto}
                      onChange={(e) => setIntroTexto(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs text-stone-900 font-sans focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      disabled={guardandoIntro}
                      onClick={() => setModalIntroOpen(false)}
                      className="px-3.5 py-2 text-xs font-mono font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardandoIntro}
                      className="px-4 py-2 text-xs font-mono font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                    >
                      {guardandoIntro ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Guardar Mensaje</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
