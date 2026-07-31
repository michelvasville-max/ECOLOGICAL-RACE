import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}
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
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Image,
  Play
} from 'lucide-react';
import { Aliado, RedSocialAliado, RolUsuario, EvidenciaMedia } from '../types';
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

interface DraftEvidencia {
  id: string;
  tipo: 'youtube' | 'video_url' | 'imagen' | 'video_archivo';
  url: string;
  file?: File | null;
  descripcion: string;
}

function getVideoInfo(url: string) {
  if (!url) return { isEmbeddable: false, embedUrl: null, platformName: 'Video', rawUrl: '' };
  const cleanUrl = url.trim();
  const currentOrigin = typeof window !== 'undefined' && window.location?.origin ? encodeURIComponent(window.location.origin) : '';
  const originParam = currentOrigin ? `&origin=${currentOrigin}` : '';

  // YouTube watch
  if (cleanUrl.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(cleanUrl);
      const v = parsed.searchParams.get('v');
      if (v) return { isEmbeddable: true, embedUrl: `https://www.youtube.com/embed/${v}?enablejsapi=1${originParam}`, platformName: 'YouTube', rawUrl: cleanUrl };
    } catch (e) {}
  }
  // YouTube short link
  if (cleanUrl.includes('youtu.be/')) {
    const parts = cleanUrl.split('youtu.be/');
    if (parts[1]) {
      const id = parts[1].split('?')[0].split('&')[0];
      return { isEmbeddable: true, embedUrl: `https://www.youtube.com/embed/${id}?enablejsapi=1${originParam}`, platformName: 'YouTube', rawUrl: cleanUrl };
    }
  }
  // YouTube embed direct
  if (cleanUrl.includes('youtube.com/embed/')) {
    let embedUrl = cleanUrl;
    if (!embedUrl.includes('enablejsapi=1')) {
      embedUrl += (embedUrl.includes('?') ? '&enablejsapi=1' : '?enablejsapi=1');
    }
    if (!embedUrl.includes('origin=') && currentOrigin) {
      embedUrl += `&origin=${currentOrigin}`;
    }
    return { isEmbeddable: true, embedUrl, platformName: 'YouTube', rawUrl: cleanUrl };
  }

  // Vimeo
  if (cleanUrl.includes('vimeo.com/')) {
    const vimeoReg = /vimeo\.com\/(?:video\/)?([0-9]+)/;
    const match = cleanUrl.match(vimeoReg);
    if (match && match[1]) {
      return { isEmbeddable: true, embedUrl: `https://player.vimeo.com/video/${match[1]}`, platformName: 'Vimeo', rawUrl: cleanUrl };
    }
  }
  if (cleanUrl.includes('player.vimeo.com/video/')) {
    return { isEmbeddable: true, embedUrl: cleanUrl, platformName: 'Vimeo', rawUrl: cleanUrl };
  }

  // Google Drive
  if (cleanUrl.includes('drive.google.com/file/d/')) {
    const parts = cleanUrl.split('/file/d/');
    if (parts[1]) {
      const fileId = parts[1].split('/')[0];
      return { isEmbeddable: true, embedUrl: `https://drive.google.com/file/d/${fileId}/preview`, platformName: 'Google Drive', rawUrl: cleanUrl };
    }
  }

  // TikTok
  if (cleanUrl.includes('tiktok.com')) {
    return { isEmbeddable: false, embedUrl: null, platformName: 'TikTok', rawUrl: cleanUrl };
  }

  // Facebook
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    return { isEmbeddable: false, embedUrl: null, platformName: 'Facebook', rawUrl: cleanUrl };
  }

  // Instagram
  if (cleanUrl.includes('instagram.com') || cleanUrl.includes('instagr.am')) {
    return { isEmbeddable: false, embedUrl: null, platformName: 'Instagram', rawUrl: cleanUrl };
  }

  // Twitter/X
  if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) {
    return { isEmbeddable: false, embedUrl: null, platformName: 'X (Twitter)', rawUrl: cleanUrl };
  }

  return { isEmbeddable: false, embedUrl: null, platformName: 'Video Enlace', rawUrl: cleanUrl };
}

interface MediaSliderProps {
  evidencias: EvidenciaMedia[];
  nombreAliado: string;
}

function AliadoMediaSlider({ evidencias, nombreAliado }: MediaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ytPlayerRef = useRef<any>(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % evidencias.length);
  }, [evidencias.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + evidencias.length) % evidencias.length);
  }, [evidencias.length]);

  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  // 1. Timer for photos and non-embedded video link cards
  useEffect(() => {
    if (!evidencias || evidencias.length <= 1) return;

    const active = evidencias[currentIndex >= evidencias.length ? 0 : currentIndex];
    if (!active) return;

    const isVideoFile = active.tipo === 'video_archivo';
    const isVideoUrl = active.tipo === 'youtube' || active.tipo === 'video_url';
    const vInfo = isVideoUrl && active.url ? getVideoInfo(active.url) : null;
    const isYouTubeEmbed = isVideoUrl && vInfo?.isEmbeddable && vInfo.platformName === 'YouTube';

    // If active item is a video file or YouTube embed, auto-advance is handled when video finishes playing
    if (isVideoFile || isYouTubeEmbed) {
      return;
    }

    const timer = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [currentIndex, evidencias, handleNext]);

  // 2. Global postMessage listener to advance when YouTube video ends
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data);
          if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
            handleNextRef.current();
          }
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 3. Callback ref for iframe: initializes YouTube player as soon as iframe mounts in DOM
  const iframeCallbackRef = useCallback((node: HTMLIFrameElement | null) => {
    if (ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.destroy === 'function') {
          ytPlayerRef.current.destroy();
        }
      } catch (e) {}
      ytPlayerRef.current = null;
    }

    if (!node) return;

    const setupYTPlayer = () => {
      if (window.YT && window.YT.Player) {
        try {
          ytPlayerRef.current = new window.YT.Player(node, {
            events: {
              onStateChange: (event: any) => {
                if (event.data === 0) { // 0 = YT.PlayerState.ENDED
                  handleNextRef.current();
                }
              }
            }
          });
        } catch (e) {}
      }
    };

    if (window.YT && window.YT.Player) {
      setupYTPlayer();
    } else {
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevOnReady === 'function') prevOnReady();
        setupYTPlayer();
      };
    }
  }, []);

  if (!evidencias || evidencias.length === 0) {
    return (
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-6 text-center space-y-2">
        <Video className="w-8 h-8 text-stone-300 mx-auto" />
        <p className="text-xs font-mono font-semibold text-stone-400">
          Aún no hay evidencias multimedia
        </p>
      </div>
    );
  }

  const activeIndex = currentIndex >= evidencias.length ? 0 : currentIndex;
  const activeItem = evidencias[activeIndex];
  const isVideoUrl = activeItem?.tipo === 'youtube' || activeItem?.tipo === 'video_url';
  const videoInfo = isVideoUrl && activeItem.url ? getVideoInfo(activeItem.url) : null;

  return (
    <div className="space-y-2">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/30 shadow-md group/slider">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black"
          >
            {isVideoUrl && (
              videoInfo?.isEmbeddable && videoInfo.embedUrl ? (
                <iframe
                  ref={iframeCallbackRef}
                  src={videoInfo.embedUrl}
                  title={`Evidencia ${activeIndex + 1} de ${nombreAliado}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-center space-y-3 border border-emerald-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 inline-block">
                      {videoInfo?.platformName || 'Video'}
                    </span>
                    <p className="text-xs text-slate-300 font-sans line-clamp-2">
                      {activeItem.descripcion || `Ver video publicado en ${videoInfo?.platformName || 'la plataforma'}`}
                    </p>
                  </div>
                  {activeItem.url ? (
                    <a
                      href={activeItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20 hover:scale-105 cursor-pointer"
                    >
                      <span>Ver Video en {videoInfo?.platformName || 'Plataforma'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-stone-400">Enlace no disponible</span>
                  )}
                </div>
              )
            )}

            {activeItem.tipo === 'imagen' && (
              <img
                src={activeItem.url}
                alt={activeItem.descripcion || `Evidencia ${activeIndex + 1}`}
                className="w-full h-full object-cover"
              />
            )}

            {activeItem.tipo === 'video_archivo' && (
              <video
                src={activeItem.url}
                controls
                onEnded={handleNext}
                className="w-full h-full object-contain bg-black"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows if > 1 items */}
        {evidencias.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border border-emerald-400/40"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer border border-emerald-400/40"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots indicator */}
            <div className="absolute top-3 right-3 z-30 flex items-center space-x-1 bg-slate-950/70 px-2 py-1 rounded-full border border-emerald-500/30 backdrop-blur-xs">
              {evidencias.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === activeIndex
                      ? 'bg-emerald-400 w-4'
                      : 'bg-slate-500 w-2 hover:bg-slate-300'
                  }`}
                  aria-label={`Ir a evidencia ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Type Badge */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-950/80 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
            {isVideoUrl && <Video className="w-3 h-3 text-red-400" />}
            {activeItem.tipo === 'imagen' && <Image className="w-3 h-3 text-cyan-400" />}
            {activeItem.tipo === 'video_archivo' && <Play className="w-3 h-3 text-emerald-400" />}
            {isVideoUrl ? (videoInfo?.platformName || 'Video') : activeItem.tipo === 'imagen' ? 'Imagen' : 'Video'}
            {' '}({activeIndex + 1}/{evidencias.length})
          </span>
        </div>
      </div>

      {/* Description below carousel */}
      {activeItem.descripcion && (
        <div className="bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-2 text-stone-700 font-sans text-xs flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="font-medium text-[11px] leading-snug">
            {activeItem.descripcion}
          </p>
        </div>
      )}
    </div>
  );
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
  const [evidenciasDraft, setEvidenciasDraft] = useState<DraftEvidencia[]>([]);
  const [guardando, setGuardando] = useState(false);

  // Intro message edit state (Admin)
  const [modalIntroOpen, setModalIntroOpen] = useState(false);
  const [introTexto, setIntroTexto] = useState('');
  const [guardandoIntro, setGuardandoIntro] = useState(false);
  const [subiendoAliadosImagen, setSubiendoAliadosImagen] = useState(false);

  const handleAliadosImagenChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSubiendoAliadosImagen(true);
      try {
        const url = await subirImagenAFirebase(file, 'proyecto');
        await onGuardarMetadata({
          ...metadata,
          aliadosImagenUrl: url
        });
      } catch (err) {
        console.error('Error al subir la imagen de alianzas:', err);
        alert('Ocurrió un error al subir la imagen.');
      } finally {
        setSubiendoAliadosImagen(false);
      }
    }
  };

  const introDefecto =
    "Gracias a las empresas, organizaciones y personas aliadas que forman parte de este proyecto. Su compromiso constante fortalece nuestra misión de reciclaje escolar y ecoeficiencia en la comunidad.";

  const textoIntroActual = metadata.aliadosIntroTexto || introDefecto;
  const imagenAliadosActual =
    metadata.aliadosImagenUrl ||
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800';

  const abrirModalNuevo = () => {
    setAliadoEditando(null);
    setNombre('');
    setDescripcion('');
    setVideoUrl('');
    setLogoUrl('');
    setArchivoLogo(null);
    setRedes([]);
    setEvidenciasDraft([]);
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

    if (aliado.evidenciasMedia && aliado.evidenciasMedia.length > 0) {
      setEvidenciasDraft(
        aliado.evidenciasMedia.map((e) => ({
          id: e.id || `ev-${Date.now()}-${Math.random()}`,
          tipo: e.tipo || 'youtube',
          url: e.url || '',
          file: null,
          descripcion: e.descripcion || ''
        }))
      );
    } else if (aliado.videoUrl) {
      setEvidenciasDraft([
        {
          id: `ev-legacy-${Date.now()}`,
          tipo: 'youtube',
          url: aliado.videoUrl,
          file: null,
          descripcion: 'Video de presentación'
        }
      ]);
    } else {
      setEvidenciasDraft([]);
    }

    setModalAliadoOpen(true);
  };

  const handleAgregarEvidencia = (tipo: 'youtube' | 'video_url' | 'imagen' | 'video_archivo' = 'video_url') => {
    const nueva: DraftEvidencia = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tipo,
      url: '',
      file: null,
      descripcion: ''
    };
    setEvidenciasDraft((prev) => [...prev, nueva]);
  };

  const handleActualizarEvidencia = (id: string, campo: keyof DraftEvidencia, valor: any) => {
    setEvidenciasDraft((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (campo === 'tipo') {
            return { ...item, tipo: valor, url: '', file: null };
          }
          return { ...item, [campo]: valor };
        }
        return item;
      })
    );
  };

  const handleEliminarEvidencia = (id: string) => {
    setEvidenciasDraft((prev) => prev.filter((item) => item.id !== id));
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

      // Subir archivos de evidencias multimedia si existen
      const evidenciasProcesadas: EvidenciaMedia[] = [];
      for (const draft of evidenciasDraft) {
        let finalUrl = draft.url;
        if ((draft.tipo === 'imagen' || draft.tipo === 'video_archivo') && draft.file) {
          finalUrl = await subirImagenAFirebase(draft.file, 'aliados_evidencias');
        }

        if (finalUrl.trim()) {
          evidenciasProcesadas.push({
            id: draft.id || `ev-${Date.now()}`,
            tipo: draft.tipo,
            url: finalUrl.trim(),
            descripcion: draft.descripcion.trim()
          });
        }
      }

      const id = aliadoEditando ? aliadoEditando.id : `aliado-${Date.now()}`;
      const primerVideo = evidenciasProcesadas.find((e) => e.tipo === 'youtube' || e.tipo === 'video_url');

      const aliadoFinal: Aliado = {
        id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        videoUrl: primerVideo ? primerVideo.url : (videoUrl.trim() || ''),
        evidenciasMedia: evidenciasProcesadas,
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

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-6">
          {/* Left Text Block */}
          <div className="space-y-4 flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
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

            {rolActual === 'ADMIN' && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={abrirModalNuevo}
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition hover:scale-105 cursor-pointer"
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
                  className="inline-flex items-center justify-center space-x-1.5 bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs uppercase tracking-wide px-4 py-2 rounded-2xl transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Mensaje</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Illustrative Image Block */}
          <div className="w-full lg:w-80 xl:w-96 aspect-[2/1] shrink-0 relative group rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-md flex items-center justify-center">
            <img
              src={imagenAliadosActual}
              alt="Alianzas y Auspiciadores"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 text-emerald-300 text-[10px] font-mono bg-slate-950/80 border border-emerald-500/30 backdrop-blur-xs px-2.5 py-1 rounded-md uppercase tracking-wider font-bold">
              Ilustración Alianzas
            </div>

            {rolActual === 'ADMIN' && (
              <label className="absolute inset-0 bg-slate-950/85 text-white flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition cursor-pointer p-4 z-20">
                <Upload className="w-6 h-6 text-emerald-400" />
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-300 text-center">
                  {subiendoAliadosImagen ? 'CARGANDO...' : 'REEMPLAZAR IMAGEN'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAliadosImagenChange}
                  className="hidden"
                />
              </label>
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
            const yaLeDioLike = usuarioGoogle && aliado.likesUsers?.includes(usuarioGoogle.uid);

            const evidenciasList: EvidenciaMedia[] =
              aliado.evidenciasMedia && aliado.evidenciasMedia.length > 0
                ? aliado.evidenciasMedia
                : aliado.videoUrl
                ? [{ id: 'legacy-video', tipo: 'youtube', url: aliado.videoUrl, descripcion: 'Video de presentación' }]
                : [];

            return (
              <motion.div
                key={aliado.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.015 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-emerald-100/90 via-teal-50/60 to-white border border-emerald-200/90 hover:border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-[0_12px_30px_rgba(16,185,129,0.22)] transition-all duration-300 space-y-6 relative overflow-hidden"
              >
                {/* Header of Ally Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-200/60 pb-5">
                  <div className="flex items-center space-x-4">
                    {/* Logo: Notablemente más grande (w-28 h-28 sm:w-36 sm:h-36) */}
                    {aliado.logoUrl ? (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-stone-200 bg-stone-50 p-2 flex items-center justify-center shrink-0 shadow-sm">
                        <img
                          src={aliado.logoUrl}
                          alt={aliado.nombre}
                          className="max-w-full max-h-full object-contain rounded-xl"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-emerald-900 text-emerald-300 border-2 border-emerald-700 flex items-center justify-center shrink-0 font-mono font-black text-2xl sm:text-3xl shadow-sm">
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
                  <div className="lg:col-span-6 space-y-5">
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

                  {/* Right Column: Carousel of Media Evidences */}
                  <div className="lg:col-span-6 space-y-2">
                    <h4 className="text-xs font-mono font-black text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-emerald-600" />
                      Evidencias Multimedia ({evidenciasList.length}):
                    </h4>

                    <AliadoMediaSlider
                      evidencias={evidenciasList}
                      nombreAliado={aliado.nombre}
                    />
                  </div>
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
                        <div className="w-20 h-20 rounded-xl border border-stone-200 bg-stone-50 p-1.5 flex items-center justify-center shrink-0">
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

                  {/* Evidencias Multimedia Section */}
                  <div className="space-y-3 border-t border-stone-100 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="block text-xs font-mono font-bold text-stone-700 uppercase">
                        Evidencias Multimedia ({evidenciasDraft.length}):
                      </label>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAgregarEvidencia('video_url')}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition cursor-pointer"
                        >
                          <Video className="w-3 h-3" />
                          <span>+ Link de Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAgregarEvidencia('imagen')}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200 transition cursor-pointer"
                        >
                          <Image className="w-3 h-3" />
                          <span>+ Foto/Imagen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAgregarEvidencia('video_archivo')}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>+ Video Archivo</span>
                        </button>
                      </div>
                    </div>

                    {evidenciasDraft.length === 0 ? (
                      <p className="text-xs text-stone-400 font-mono italic bg-stone-50 p-3 rounded-xl border border-stone-200">
                        No has agregado evidencias multimedia aún. Puedes subir fotos, archivos de video o enlaces de video (YouTube, Vimeo, TikTok, Facebook, Instagram, etc.).
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {evidenciasDraft.map((ev, idx) => (
                          <div
                            key={ev.id}
                            className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-2 relative"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-emerald-800 text-[10px] uppercase bg-emerald-100 px-2 py-0.5 rounded-md">
                                Evidencia #{idx + 1}: {(ev.tipo === 'youtube' || ev.tipo === 'video_url') ? 'Link de Video' : ev.tipo === 'imagen' ? 'Foto / Imagen' : 'Archivo de Video'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleEliminarEvidencia(ev.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                                title="Eliminar esta evidencia"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Input according to type */}
                            {(ev.tipo === 'youtube' || ev.tipo === 'video_url') ? (
                              <input
                                type="url"
                                placeholder="Ej. YouTube, Vimeo, TikTok, Facebook, Instagram..."
                                value={ev.url}
                                onChange={(e) => handleActualizarEvidencia(ev.id, 'url', e.target.value)}
                                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                              />
                            ) : (
                              <div className="space-y-1">
                                <div className="relative border border-dashed border-stone-300 rounded-lg p-2.5 text-center bg-white hover:bg-stone-50 cursor-pointer">
                                  <input
                                    type="file"
                                    accept={ev.tipo === 'imagen' ? 'image/*' : 'video/*'}
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleActualizarEvidencia(ev.id, 'file', e.target.files[0]);
                                      }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <span className="text-[11px] text-stone-600 font-mono font-bold block truncate">
                                    {ev.file ? ev.file.name : ev.url ? 'Cambiar archivo subido...' : `Seleccionar ${ev.tipo === 'imagen' ? 'imagen (JPG/PNG)' : 'video (MP4/MOV)'} desde tu dispositivo...`}
                                  </span>
                                </div>
                                {ev.url && !ev.file && (
                                  <span className="text-[10px] text-stone-400 font-mono block truncate">
                                    URL actual: {ev.url}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Descripción corta */}
                            <input
                              type="text"
                              placeholder="Descripción corta (ej. Entrevista con el gerente de Wilo Servis)"
                              value={ev.descripcion}
                              onChange={(e) => handleActualizarEvidencia(ev.id, 'descripcion', e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-sans"
                            />
                          </div>
                        ))}
                      </div>
                    )}
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

