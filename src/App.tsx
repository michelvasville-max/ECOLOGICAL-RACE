import React, { useState, useEffect } from 'react';
import {
  INITIAL_INSTITUCIONES,
  INITIAL_AULAS,
  INITIAL_REGISTROS,
  INITIAL_COMENTARIOS,
  INITIAL_EQUIPO,
} from './data/mockData';
import {
  Institucion,
  Aula,
  RegistroSemanal,
  Comentario,
  IntegranteEquipo,
  RolUsuario,
  ReaccionFoto,
  Aliado
} from './types';
import LeaderboardCompare, { AulaStats } from './components/LeaderboardCompare';
import ClassroomRow from './components/ClassroomRow';
import InstitucionesTab from './components/InstitucionesTab';
import NuestroEquipoTab from './components/NuestroEquipoTab';
import AlianzasTab from './components/AlianzasTab';
import ActasSemanalesTab from './components/ActasSemanalesTab';
import AddLogModal from './components/AddLogModal';
import AddAulaModal from './components/AddAulaModal';
import AddMiembroModal from './components/AddMiembroModal';
import AyudaSoporteModal from './components/AyudaSoporteModal';
import DonacionesModal from './components/DonacionesModal';
import NuestroProyectoTab, { ProyectoMetadata, obtenerRedesSociales, renderSocialIcon } from './components/NuestroProyectoTab';
import FuturisticImageSlider from './components/FuturisticImageSlider';
import NeonLogo from './components/NeonLogo';

import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

import {
  escucharInstituciones,
  escucharAulas,
  escucharRegistros,
  escucharComentarios,
  escucharEquipo,
  escucharAliados,
  escucharProyectoMetadata,
  escucharReaccionesFotos,
  guardarInstitucion,
  guardarAula,
  guardarRegistro,
  eliminarRegistro,
  guardarComentario,
  guardarMiembroEquipo,
  eliminarMiembroEquipo,
  guardarAliado,
  eliminarAliado,
  guardarProyectoMetadata,
  guardarReaccionFoto,
  eliminarReaccionFoto,
  actualizarComentario,
  eliminarComentario,
  eliminarAula,
  eliminarInstitucion,
  subirImagenAFirebase,
  vaciarColeccionesDePrueba,
  iniciarSesionConGoogle,
  cerrarSesion,
  auth,
  isFirebaseConfigured
} from './lib/firebase';

import {
  Award,
  Building2,
  Calendar,
  Coins,
  Flame,
  Leaf,
  Users,
  Clock,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Heart,
  Plus,
  Handshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function getUltimaActualizacionText(registros: RegistroSemanal[]): string {
  if (!registros || registros.length === 0) {
    return 'ÚLTIMA ACTUALIZACIÓN: JUE 02 JUL 2026 — 17:30';
  }

  let latestDate: Date | null = null;
  let hasUpdatedAt = false;

  for (const reg of registros) {
    let d: Date;
    if (reg.updatedAt) {
      d = new Date(reg.updatedAt);
      if (!isNaN(d.getTime())) {
        if (!latestDate || !hasUpdatedAt || d > latestDate) {
          latestDate = d;
          hasUpdatedAt = true;
        }
      }
    } else if (reg.fecha && !hasUpdatedAt) {
      const parts = reg.fecha.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        d = new Date(year, month, day, 17, 30);
        if (!isNaN(d.getTime())) {
          if (!latestDate || d > latestDate) {
            latestDate = d;
          }
        }
      }
    }
  }

  if (!latestDate) {
    return 'ÚLTIMA ACTUALIZACIÓN: JUE 02 JUL 2026 — 17:30';
  }

  const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];

  const diaSemana = dias[latestDate.getDay()];
  const diaNum = String(latestDate.getDate()).padStart(2, '0');
  const mesName = meses[latestDate.getMonth()];
  const anio = latestDate.getFullYear();
  const horas = String(latestDate.getHours()).padStart(2, '0');
  const minutos = String(latestDate.getMinutes()).padStart(2, '0');

  return `ÚLTIMA ACTUALIZACIÓN: ${diaSemana} ${diaNum} ${mesName} ${anio} — ${horas}:${minutos}`;
}

export default function App() {
  // --- STATE PERSISTENCE & FIREBASE ---
  const [rolActual, setRolActual] = useState<RolUsuario>(() => {
    const saved = localStorage.getItem('eco_race_rol');
    return (saved as RolUsuario) || 'VISITANTE';
  });

  const [usuarioGoogle, setUsuarioGoogle] = useState<FirebaseUser | null>(null);
  const [reaccionesFotos, setReaccionesFotos] = useState<ReaccionFoto[]>([]);

  const [instituciones, setInstituciones] = useState<Institucion[]>(INITIAL_INSTITUCIONES);
  const [aulas, setAulas] = useState<Aula[]>(INITIAL_AULAS);
  const [registros, setRegistros] = useState<RegistroSemanal[]>(INITIAL_REGISTROS);
  const [comentarios, setComentarios] = useState<Comentario[]>(INITIAL_COMENTARIOS);
  const [equipo, setEquipo] = useState<IntegranteEquipo[]>(INITIAL_EQUIPO);
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [proyectoMetadata, setProyectoMetadata] = useState<ProyectoMetadata>({
    logoUrl: '',
    mision: 'Inculcar en la juventud escolar de Cajamarca una cultura activa de segregación de residuos sólidos y corresponsabilidad ecológica, canalizando el esfuerzo colectivo en un fondo común transparente que equipe a sus instituciones educativas con recursos que respondan a sus necesidades reales.',
    vision: 'Ser reconocidos en el norte del Perú como el modelo cooperativo-ecológico escolar más transparente, escalable y participativo, logrando que el reciclaje deje de ser una tarea aislada y se convierta en el pilar financiero de la infraestructura educativa y el desarrollo sostenible local.',
    nombreProyecto: 'Ecological Race',
    categoria: 'Medio Ambiente y Responsabilidad Social',
    institucionBase: 'COAR Cajamarca',
    metaGlobalCO2: 1500,
    imagenMisionUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    imagenVisionUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    tiktokUser: '@ecologicalrace',
    tiktokUrl: 'https://www.tiktok.com/@ecologicalrace',
    instagramUser: '@ecologicalrace',
    instagramUrl: 'https://www.instagram.com/ecologicalrace',
    redesSociales: [
      { id: 'tiktok-default', nombre: 'TikTok', icono: 'tiktok', usuario: '@ecologicalrace', url: 'https://www.tiktok.com/@ecologicalrace' },
      { id: 'instagram-default', nombre: 'Instagram', icono: 'instagram', usuario: '@ecologicalrace', url: 'https://www.instagram.com/ecologicalrace' }
    ]
  });

  const [activeTab, setActiveTab] = useState<'resumen' | 'ranking' | 'instituciones' | 'actas' | 'proyecto' | 'equipo' | 'alianzas'>('resumen');

  // --- ADMIN MODAL STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddAulaModalOpen, setIsAddAulaModalOpen] = useState(false);
  const [isAddMiembroModalOpen, setIsAddMiembroModalOpen] = useState(false);
  const [isAyudaModalOpen, setIsAyudaModalOpen] = useState(false);
  const [isDonacionesModalOpen, setIsDonacionesModalOpen] = useState(false);
  const [registroParaEditar, setRegistroParaEditar] = useState<RegistroSemanal | null>(null);

  // --- FILTER STATE ---
  const [institucionFiltrada, setInstitucionFiltrada] = useState<string>('ie-82063');

  // Sync role to localStorage
  useEffect(() => {
    localStorage.setItem('eco_race_rol', rolActual);
  }, [rolActual]);

  // Firebase Real-time listeners & Auto-seeding
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubInst = escucharInstituciones((data) => {
      if (data.length === 0) {
        INITIAL_INSTITUCIONES.forEach((inst) => guardarInstitucion(inst));
      } else {
        setInstituciones(data);
      }
    });

    const unsubAulas = escucharAulas((data) => {
      setAulas(data);
    });

    const unsubRegs = escucharRegistros((data) => {
      setRegistros(data);
    });

    const unsubComs = escucharComentarios((data) => {
      setComentarios(data);
    });

    const unsubEquipo = escucharEquipo((data) => {
      setEquipo(data);
    });

    const unsubAliados = escucharAliados((data) => {
      setAliados(data);
    });

    const fallbackMetadata: ProyectoMetadata = {
      logoUrl: '',
      mision: 'Inculcar en la juventud escolar de Cajamarca una cultura activa de segregación de residuos sólidos y corresponsabilidad ecológica, canalizando el esfuerzo colectivo en un fondo común transparente que equipe a sus instituciones educativas con recursos que respondan a sus necesidades reales.',
      vision: 'Ser reconocidos en el norte del Perú como el modelo cooperativo-ecológico escolar más transparente, escalable y participativo, logrando que el reciclaje deje de ser una tarea aislada y se convierta en el pilar financiero de la infraestructura educativa y el desarrollo sostenible local.',
      nombreProyecto: 'Ecological Race',
      categoria: 'Medio Ambiente y Responsabilidad Social',
      institucionBase: 'COAR Cajamarca',
      metaGlobalCO2: 1500,
      imagenMisionUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      imagenVisionUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      tiktokUser: '@ecologicalrace',
      tiktokUrl: 'https://www.tiktok.com/@ecologicalrace',
      instagramUser: '@ecologicalrace',
      instagramUrl: 'https://www.instagram.com/ecologicalrace',
      redesSociales: [
        { id: 'tiktok-default', nombre: 'TikTok', icono: 'tiktok', usuario: '@ecologicalrace', url: 'https://www.tiktok.com/@ecologicalrace' },
        { id: 'instagram-default', nombre: 'Instagram', icono: 'instagram', usuario: '@ecologicalrace', url: 'https://www.instagram.com/ecologicalrace' }
      ]
    };

    const unsubMeta = escucharProyectoMetadata((data) => {
      setProyectoMetadata(data);
    }, fallbackMetadata);

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUsuarioGoogle(user);
    });

    const unsubReacciones = escucharReaccionesFotos((data) => {
      setReaccionesFotos(data);
    });

    return () => {
      unsubInst();
      unsubAulas();
      unsubRegs();
      unsubComs();
      unsubEquipo();
      unsubAliados();
      unsubMeta();
      unsubAuth();
      unsubReacciones();
    };
  }, []);

  // --- MATH CALCULATION HELPER ---
  const getCalculatedLeaderboard = (schoolId: string | 'all'): AulaStats[] => {
    const targetAulas = schoolId === 'all' ? aulas : aulas.filter((a) => a.institucionId === schoolId);
    const targetAulasIds = targetAulas.map((a) => a.id);

    const statsMap: Record<string, AulaStats> = {};
    targetAulas.forEach((aula) => {
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
        const multFactor = reg.multiplicadorVerde ? 1.2 : 1.0;

        const pKg = (reg.kgPlastico || 0) * multFactor;
        const aKg = (reg.kgAluminio || 0) * multFactor;
        const paKg = (reg.kgPapel || 0) * multFactor;

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

    return Object.values(statsMap).sort((a, b) => b.totalCO2 - a.totalCO2);
  };

  // School-specific leaderboard for active display
  const currentLeaderboard = getCalculatedLeaderboard(institucionFiltrada);
  const totalSchoolCO2 = currentLeaderboard.reduce((sum, cl) => sum + cl.totalCO2, 0);

  // General leader across all schools
  const allLeaderboard = getCalculatedLeaderboard('all');
  const globalLeader = allLeaderboard.length > 0 ? allLeaderboard[0] : null;

  // --- EVENT HANDLERS ---
  const handleAgregarComentario = async (nuevo: Comentario) => {
    await guardarComentario(nuevo);
  };

  const handleAprobarComentario = async (id: string) => {
    await actualizarComentario(id, { estado: 'aprobado' });
  };

  const handleActualizarEstadoComentario = async (id: string, estado: 'pendiente' | 'aprobado') => {
    await actualizarComentario(id, { estado });
  };

  const handleEliminarComentario = async (id: string) => {
    await eliminarComentario(id);
  };

  const handleReaccionarComentario = async (comentarioId: string, tipo: 'like' | 'dislike') => {
    if (!usuarioGoogle) {
      alert("Debes iniciar sesión con Google para reaccionar a los comentarios.");
      return;
    }

    const com = comentarios.find(c => c.id === comentarioId);
    if (!com) return;

    const userUid = usuarioGoogle.uid;
    const likesUsers = com.likesUsers || [];
    const dislikesUsers = com.dislikesUsers || [];

    let updatedLikesUsers = [...likesUsers];
    let updatedDislikesUsers = [...dislikesUsers];

    const alreadyLiked = likesUsers.includes(userUid);
    const alreadyDisliked = dislikesUsers.includes(userUid);

    if (tipo === 'like') {
      if (alreadyLiked) {
        // Toggle off
        updatedLikesUsers = updatedLikesUsers.filter(uid => uid !== userUid);
      } else {
        // Toggle on, and remove from dislike if exists
        updatedLikesUsers.push(userUid);
        updatedDislikesUsers = updatedDislikesUsers.filter(uid => uid !== userUid);
      }
    } else {
      if (alreadyDisliked) {
        // Toggle off
        updatedDislikesUsers = updatedDislikesUsers.filter(uid => uid !== userUid);
      } else {
        // Toggle on, and remove from like if exists
        updatedDislikesUsers.push(userUid);
        updatedLikesUsers = updatedLikesUsers.filter(uid => uid !== userUid);
      }
    }

    const updates: Partial<Comentario> = {
      likes: updatedLikesUsers.length,
      dislikes: updatedDislikesUsers.length,
      likesUsers: updatedLikesUsers,
      dislikesUsers: updatedDislikesUsers,
    };

    try {
      await actualizarComentario(comentarioId, updates);
    } catch (err) {
      console.error("Error al actualizar reacciones de comentario:", err);
    }
  };

  const handleEliminarAula = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este salón/aula? Se borrarán todos sus pesajes y registros asociados de forma permanente.')) {
      try {
        await eliminarAula(id);
      } catch (error) {
        console.error("Error al eliminar aula:", error);
      }
    }
  };

  const handleEliminarInstitucion = async (id: string) => {
    if (window.confirm('🚨 ALERTA CRÍTICA: ¿Estás seguro de que deseas eliminar esta Sede Educativa? Se borrarán de forma irreversible todas las aulas y registros asociados permanentemente.')) {
      try {
        await eliminarInstitucion(id);
      } catch (error) {
        console.error("Error al eliminar institución:", error);
      }
    }
  };

  const handleGuardarRegistro = async (reg: RegistroSemanal) => {
    await guardarRegistro(reg);
    setIsAddModalOpen(false);
    setRegistroParaEditar(null);
  };

  const handleGuardarAula = async (nuevaAula: Aula) => {
    await guardarAula(nuevaAula);
    setIsAddAulaModalOpen(false);
  };

  const handleGuardarMiembro = async (nuevoMiembro: IntegranteEquipo) => {
    await guardarMiembroEquipo(nuevoMiembro);
    setIsAddMiembroModalOpen(false);
  };

  const handleEditarRegistroTrigger = (reg: RegistroSemanal) => {
    setRegistroParaEditar(reg);
    setIsAddModalOpen(true);
  };

  const handleNuevoRegistroTrigger = () => {
    setRegistroParaEditar(null);
    setIsAddModalOpen(true);
  };

  const handleResetData = async () => {
    if (window.confirm('¿Estás seguro de que deseas LIMPIAR todos los datos de la base de datos y dejarlos en blanco para producción?')) {
      await vaciarColeccionesDePrueba();
      alert('Base de datos restablecida a cero para producción con éxito.');
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-emerald-950 text-slate-100 flex items-center justify-center p-6 font-sans select-none" id="firebase-error-fallback">
        <div className="max-w-md w-full bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_4px_25px_rgba(16,185,129,0.15)] text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 mb-2">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold font-display tracking-tight text-white uppercase">
            Error de Configuración
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            Error: Firebase no está configurado correctamente. Verifica las variables de entorno.
          </p>
          <p className="text-[11px] text-slate-450 font-mono">
            La aplicación no ha detectado las credenciales válidas en las variables VITE_FIREBASE_*. Para evitar conectarse a proyectos incorrectos, se ha bloqueado la carga de la aplicación.
          </p>
          <div className="bg-emerald-950/80 border border-emerald-800 p-3 rounded-lg text-left space-y-1 text-[10px] font-mono text-slate-300">
            <span className="text-slate-300 font-bold block mb-1">Variables requeridas:</span>
            <div>• VITE_FIREBASE_API_KEY</div>
            <div>• VITE_FIREBASE_AUTH_DOMAIN</div>
            <div>• VITE_FIREBASE_PROJECT_ID</div>
            <div>• VITE_FIREBASE_STORAGE_BUCKET</div>
            <div>• VITE_FIREBASE_MESSAGING_SENDER_ID</div>
            <div>• VITE_FIREBASE_APP_ID</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-600 selection:text-white" id="ecological-race-root">
      
      {/* 1. TOP MARQUEE BANNER: ONPE-INSPIRED CONTEXTUAL TRACKER */}
      <div className="bg-emerald-900 text-white px-6 py-2 flex items-center justify-between shrink-0 border-b border-emerald-950 shadow-sm" id="onpe-marquee-header">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="bg-emerald-500 text-[10px] font-black px-2.5 py-0.5 rounded tracking-widest animate-neon-pulse">VIVO</span>
            <span className="text-xs font-medium opacity-90">
              Seguimiento Continuo de Metas Ambientales y Reciclaje Escolar
            </span>
          </div>
          <div className="flex items-center gap-3 md:w-1/3 justify-end">
            <span className="text-[10px] font-mono opacity-75">{getUltimaActualizacionText(registros)}</span>
          </div>
        </div>
      </div>

      {/* 2. BRAND HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-5 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4" id="main-header">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {proyectoMetadata.logoUrl && proyectoMetadata.logoUrl !== '/ecological_race_logo.svg' ? (
              <NeonLogo src={proyectoMetadata.logoUrl} fallbackType="project" sizeClass="w-20 h-20" alt="Logo Ecological Race" />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-300 shadow-inner shrink-0">
                <Leaf className="w-8 h-8 md:w-10 md:h-10 text-emerald-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black leading-none text-emerald-900 uppercase tracking-tighter font-display">
                ECOLOGICAL RACE
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 md:gap-3 mt-1.5">
                <span className="text-xs font-extrabold text-emerald-500 tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  "COMPITE POR EL PLANETA"
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  Panel de Seguimiento en Vivo — Perú 2026
                </p>
              </div>
            </div>
          </div>

          {/* Admin Switcher Panel (Direct toggle per instructions to avoid credentials hurdles) */}
          <div className="flex items-center space-x-3.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 shadow-2xs" id="quick-role-panel">
            {/* Google Session indicator */}
            <div className="flex items-center space-x-2 border-r border-slate-200 pr-3.5 mr-0.5">
              {usuarioGoogle ? (
                <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  {usuarioGoogle.photoURL ? (
                    <img
                      src={usuarioGoogle.photoURL}
                      alt={usuarioGoogle.displayName || 'Google User'}
                      className="w-5 h-5 rounded-full border border-emerald-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                      {usuarioGoogle.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div className="text-left leading-none">
                    <span className="text-[8px] font-mono font-bold text-slate-400 block uppercase">CONEXIÓN GOOGLE</span>
                    <span className="text-xs font-bold text-slate-800 font-sans block truncate max-w-[85px]" title={usuarioGoogle.displayName || ''}>
                      {usuarioGoogle.displayName?.split(' ')[0]}
                    </span>
                  </div>
                  <button
                    onClick={cerrarSesion}
                    className="text-slate-400 hover:text-red-600 font-mono text-[9px] font-bold p-0.5 ml-1 cursor-pointer"
                    title="Cerrar sesión de Google"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await iniciarSesionConGoogle();
                    } catch (err: any) {
                      console.warn("Google login failed or cancelled:", err);
                    }
                  }}
                  className="bg-white border border-slate-300 hover:border-emerald-500/50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1.5 shadow-3xs"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] text-blue-600 bg-slate-100 rounded-full border border-slate-200">G</span>
                  <span>Google Login</span>
                </button>
              )}
            </div>

            <div className="text-right">
              <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">TIPO DE ACCESO</div>
              <div className="text-xs font-semibold text-slate-800 flex items-center space-x-1 justify-end">
                {rolActual === 'ADMIN' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    <span className="text-emerald-800">Administrador</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Visitante</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {rolActual === 'ADMIN' ? (
                <>
                  <button
                    onClick={() => setRolActual('VISITANTE')}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Salir</span>
                  </button>
                  <button
                    onClick={handleResetData}
                    className="text-[10px] font-mono text-red-600 hover:underline px-2 py-1 bg-red-50 rounded transition"
                    title="Restablecer base de datos inicial"
                  >
                    Reset
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const code = prompt('Ingrese el código de acceso único de Administrador:');
                    if (code === 'ecologicalrace_2026_concursosplash8') {
                      setRolActual('ADMIN');
                      alert('¡Acceso de Administrador verificado con éxito!');
                    } else if (code !== null) {
                      alert('Código incorrecto. Acceso denegado.');
                    }
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Ser Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. MENÚ HORIZONTAL DE NAVEGACIÓN (Futuristic Dark Neon style) */}
      <nav className="bg-emerald-950/95 backdrop-blur-md border-b border-emerald-500/40 sticky top-0 z-40 shadow-[0_4px_20px_rgba(16,185,129,0.2)]" id="navbar-onpe">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <div className="flex space-x-6 py-3.5 whitespace-nowrap">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`py-1 flex items-center space-x-2 cursor-pointer transition-all duration-300 font-mono text-[10px] tracking-widest uppercase font-bold relative ${
                activeTab === 'resumen'
                  ? 'text-emerald-400 font-extrabold pb-1 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-b-2 border-emerald-400 scale-105'
                  : 'text-slate-400 hover:text-emerald-300 pb-1 border-b-2 border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => setActiveTab('ranking')}
              className={`py-1 flex items-center space-x-2 cursor-pointer transition-all duration-300 font-mono text-[10px] tracking-widest uppercase font-bold relative ${
                activeTab === 'ranking'
                  ? 'text-emerald-400 font-extrabold pb-1 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-b-2 border-emerald-400 scale-105'
                  : 'text-slate-400 hover:text-emerald-300 pb-1 border-b-2 border-transparent'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Ranking</span>
            </button>

            <button
              onClick={() => setActiveTab('actas')}
              className={`py-1 flex items-center space-x-2 cursor-pointer transition-all duration-300 font-mono text-[10px] tracking-widest uppercase font-bold relative ${
                activeTab === 'actas'
                  ? 'text-emerald-400 font-extrabold pb-1 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-b-2 border-emerald-400 scale-105'
                  : 'text-slate-400 hover:text-emerald-300 pb-1 border-b-2 border-transparent'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Reportes Semanales y Evidencias</span>
            </button>

            <button
              onClick={() => setActiveTab('instituciones')}
              className={`py-1 flex items-center space-x-2 cursor-pointer transition-all duration-300 font-mono text-[10px] tracking-widest uppercase font-bold relative ${
                activeTab === 'instituciones'
                  ? 'text-emerald-400 font-extrabold pb-1 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-b-2 border-emerald-400 scale-105'
                  : 'text-slate-400 hover:text-emerald-300 pb-1 border-b-2 border-transparent'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Instituciones</span>
            </button>

            <button
              onClick={() => setActiveTab('proyecto')}
              className={`py-1 flex items-center space-x-2 cursor-pointer transition-all duration-300 font-mono text-[10px] tracking-widest uppercase font-bold relative ${
                activeTab === 'proyecto'
                  ? 'text-emerald-400 font-extrabold pb-1 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-b-2 border-emerald-400 scale-105'
                  : 'text-slate-400 hover:text-emerald-300 pb-1 border-b-2 border-transparent'
              }`}
            >
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Nuestro Proyecto</span>
            </button>

            <button
              onClick={() => setActiveTab('equipo')}
              className={`py-1 flex items-center space-x-2 cursor-pointer transition-all duration-300 font-mono text-[10px] tracking-widest uppercase font-bold relative ${
                activeTab === 'equipo'
                  ? 'text-emerald-400 font-extrabold pb-1 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-b-2 border-emerald-400 scale-105'
                  : 'text-slate-400 hover:text-emerald-300 pb-1 border-b-2 border-transparent'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Equipo</span>
            </button>

            <button
              onClick={() => setActiveTab('alianzas')}
              className={`py-1 flex items-center space-x-2 cursor-pointer transition-all duration-300 font-mono text-[10px] tracking-widest uppercase font-bold relative ${
                activeTab === 'alianzas'
                  ? 'text-emerald-400 font-extrabold pb-1 shadow-[0_0_15px_rgba(16,185,129,0.1)] border-b-2 border-emerald-400 scale-105'
                  : 'text-slate-400 hover:text-emerald-300 pb-1 border-b-2 border-transparent'
              }`}
            >
              <Handshake className="w-4 h-4 text-emerald-400" />
              <span>Alianzas</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MAIN CONTENT AREA WITH MOTION TRANSITION */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-16">
        {/* GLOBAL ADMIN MODERATION ALERTS FOR COMMENTS */}
        {rolActual === 'ADMIN' && comentarios.some((c) => c.estado === 'pendiente') && (
          <div className="bg-amber-50 border-2 border-amber-500/50 rounded-2xl p-5 mb-6 shadow-md" id="global-moderation-alert">
            <div className="flex items-center space-x-2 text-amber-950 font-display font-bold text-sm uppercase tracking-wide mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 animate-pulse" />
              <span>⚠️ Panel Global de Moderación: Tienes {comentarios.filter((c) => c.estado === 'pendiente').length} comentario(s) pendiente(s) de aprobación</span>
            </div>
            <p className="text-xs text-amber-850 mb-4 leading-normal">
              Como administrador, debes aprobar estos comentarios para que sean visibles públicamente en el sitio:
            </p>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comentarios.filter((c) => c.estado === 'pendiente').map((com) => {
                const refText = com.referenciaTipo === 'acta' ? `Semana ${com.referenciaId}` : `Sección ${com.referenciaId}`;
                return (
                  <div key={com.id} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs">{com.autor}</span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono font-bold">
                          Ubicación: {refText}
                        </span>
                      </div>
                      <p className="text-slate-600 italic mt-1 font-sans">"{com.texto}"</p>
                      <span className="text-[9px] text-slate-400 block font-mono">
                        Fecha: {new Date(com.fecha).toLocaleString('es-PE')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await actualizarComentario(com.id, { estado: 'aprobado' });
                          } catch (err) {
                            console.error("Error al aprobar comentario:", err);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                      >
                        Aprobar y Mostrar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await eliminarComentario(com.id);
                          } catch (err) {
                            console.error("Error al eliminar comentario:", err);
                          }
                        }}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'resumen' && (
            <motion.div
              key="resumen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Carrusel de imágenes con estilo oscuro futurista */}
              <FuturisticImageSlider />

              {/* Tarjetas de progreso horizontal de instituciones y Aula Líder de cada sede */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="schools-horizontal-progress-summary">
                {instituciones.map((inst) => {
                  const ieAulas = aulas.filter((a) => a.institucionId === inst.id);
                  const ieAulasIds = ieAulas.map((a) => a.id);
                  const ieRegs = registros.filter((r) => ieAulasIds.includes(r.aulaId));

                  // Calculate total CO2 and materials
                  let totalCO2 = 0;
                  let totalSoles = 0;
                  ieRegs.forEach((r) => {
                    const mult = r.multiplicadorVerde ? 1.2 : 1.0;
                    const pKg = (r.kgPlastico || 0) * mult;
                    const aKg = (r.kgAluminio || 0) * mult;
                    const paKg = (r.kgPapel || 0) * mult;
                    totalCO2 += (pKg * 1.5) + (aKg * 9.0) + (paKg * 1.0);
                    totalSoles += r.montoVentaSoles || 0;
                  });

                  const metaSchoolCO2 = inst.metaCO2 || proyectoMetadata.metaGlobalCO2 || 1500.0;
                  const percentSchoolGoal = Math.min((totalCO2 / metaSchoolCO2) * 100, 100);

                  // Calculate top classroom of this school
                  const schoolLeaderboard = getCalculatedLeaderboard(inst.id);
                  const schoolLeaderClass = schoolLeaderboard.length > 0 ? schoolLeaderboard[0] : null;

                  return (
                    <div
                      key={inst.id}
                      className="bg-emerald-950 border border-emerald-500/35 rounded-3xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.08)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:border-emerald-400/70 transition-all duration-300 relative flex flex-col justify-between min-h-[340px] text-white overflow-hidden"
                    >
                      {/* Background wrap to prevent overflow-hidden blocking the popover */}
                      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.015)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
                      </div>

                      <div className="space-y-4 relative z-10">
                        {/* Header: School details and Circular Logo */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                              {inst.distrito} • Sede {inst.nivel}
                            </span>
                            <h4 className="text-base font-black text-white uppercase tracking-tight truncate font-display">
                              {inst.nombre}
                            </h4>
                            <p className="text-[10px] text-slate-200 italic font-medium leading-tight line-clamp-2 border-l-2 border-emerald-400 pl-2 bg-emerald-950/20 py-0.5">
                              "{inst.slogan || '¡Compromiso ecológico y lema ambiental!'}"
                            </p>
                          </div>

                          {/* Circular Logo with Tooltip */}
                          <div className="relative group/logo cursor-help shrink-0">
                            <NeonLogo
                              src={inst.logoUrl}
                              fallbackType="institution"
                              sizeClass="w-16 h-16"
                              alt={inst.nombre}
                            />

                            {/* Tooltip */}
                            <div className="absolute bottom-full right-0 mb-4 hidden group-hover/logo:flex flex-col bg-emerald-900 text-white text-xs rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-emerald-500/50 z-50 w-64 pointer-events-none animate-fade-in font-mono">
                              <span className="font-extrabold text-[10px] text-emerald-400 uppercase tracking-widest mb-3 pb-2 border-b border-emerald-950 block">
                                Resumen de Sede
                              </span>
                              <div className="space-y-3.5 text-[10px] text-slate-200 leading-normal">
                                <div className="flex justify-between items-center">
                                  <span>💰 Fondo Común:</span>
                                  <span className="font-bold text-amber-300">S/. {totalSoles.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>🔥 CO₂ Evitado:</span>
                                  <span className="font-bold text-emerald-400">{totalCO2.toFixed(1)} kg</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>🎯 % Meta:</span>
                                  <span className="font-bold text-blue-400">{percentSchoolGoal.toFixed(1)}%</span>
                                </div>
                              </div>
                              <div className="w-2.5 h-2.5 bg-emerald-900 border-r border-b border-emerald-500/40 rotate-45 absolute top-full right-6 -translate-y-1.5" />
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-[10px] font-mono text-slate-300">
                            <span>Progreso Sede</span>
                            <span className="font-bold text-emerald-400">{percentSchoolGoal.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-emerald-950 border border-emerald-900 rounded-full overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentSchoolGoal}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-350 rounded-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Featured Aula Líder box */}
                      <div className="mt-4 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-950 border border-emerald-500/20 rounded-xl p-3.5 flex items-center justify-between gap-3 relative z-10">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                            🏆 Aula Líder de la Sede
                          </span>
                          {schoolLeaderClass ? (
                            <>
                              <h5 className="text-sm font-black text-white">
                                Aula {schoolLeaderClass.aula.nombre}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-medium">
                                Collector: <span className="text-emerald-300 font-bold">{schoolLeaderClass.aula.raceCollector}</span>
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-slate-450 italic">No hay pesajes reportados aún.</p>
                          )}
                        </div>

                        {schoolLeaderClass && (
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">CO₂ Evitado</span>
                            <span className="text-sm font-black font-mono text-emerald-400">
                              -{schoolLeaderClass.totalCO2.toFixed(1)} kg
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Go to Details click behavior */}
                      <button
                        onClick={() => {
                          setActiveTab('instituciones');
                          setTimeout(() => {
                            const el = document.getElementById(`school-card-${inst.id}`);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 150);
                        }}
                        className="mt-4 w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-2 text-center text-xs font-semibold text-slate-600 font-mono transition cursor-pointer"
                      >
                        Ver desglose y ranking de {ieAulas.length} aulas →
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Tarjeta / Botón de Donaciones */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-1.5 relative z-10">
                  <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-900/60 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm">
                    <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />
                    Apoyo y Sostenibilidad
                  </span>
                  <h4 className="text-lg font-black text-white font-display uppercase tracking-tight pt-1">
                    💚 Apoya el Proyecto Ecological Race
                  </h4>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Tus aportes nos ayudan a adquirir materiales de reciclaje, financiar incentivos para las aulas ganadoras y mantener activa esta plataforma.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDonacionesModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-105 cursor-pointer shrink-0 relative z-10 flex items-center justify-center space-x-2"
                >
                  <Heart className="w-4 h-4 fill-slate-950" />
                  <span>💚 Apoya el Proyecto / Donaciones</span>
                </button>
              </div>

              {/* Informational project brief footer in home tab */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h5 className="font-display font-bold text-slate-800 text-sm">Proyecto de Responsabilidad Social COAR Cajamarca</h5>
                  <p className="text-xs text-slate-500 max-w-4xl leading-relaxed">
                    "Ecological Race" es un certamen y cooperativa escolar diseñado e implementado por estudiantes del Colegio de Alto Rendimiento (COAR) Cajamarca. Promueve la segregación efectiva de aluminio, plásticos y cartón en alianzas con recicladores formales locales.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Institution Filter Dropdown */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-slate-900 text-sm">Tabla de Clasificación General</h4>
                  <p className="text-xs text-slate-500 font-mono uppercase">
                    Resultados ordenados por volumen de CO₂ evitado acumulado
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Hide selector if there was only 1 school loaded, but keep visible since we have Jesus and COAR */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-400">Institución:</span>
                    <select
                      value={institucionFiltrada}
                      onChange={(e) => setInstitucionFiltrada(e.target.value)}
                      className="bg-slate-100 text-slate-800 font-bold font-mono text-xs p-2 rounded-xl border border-slate-200 focus:outline-hidden"
                    >
                      <option value="ie-82063">I.E. Primaria N.° 82063 (Jesús)</option>
                      <option value="ie-82064">I.E. Primaria N.° 82064 (Jesús)</option>
                      <option value="all">Todas las Instituciones</option>
                    </select>
                  </div>

                  {rolActual === 'ADMIN' && (
                    <button
                      onClick={() => setIsAddAulaModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Aula</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Classroom lists */}
              <div className="space-y-3">
                {currentLeaderboard.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 font-mono text-xs italic">
                    ⌛ No hay datos de pesaje cargados para la institución seleccionada.
                  </div>
                ) : (
                  currentLeaderboard.map((stats, idx) => (
                    <ClassroomRow
                      key={stats.aula.id}
                      stats={stats}
                      index={idx}
                      totalSchoolCO2={totalSchoolCO2}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'actas' && (
            <motion.div
              key="actas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ActasSemanalesTab
                registros={registros}
                aulas={aulas}
                instituciones={instituciones}
                comentarios={comentarios}
                rolActual={rolActual}
                onAgregarComentario={handleAgregarComentario}
                onAprobarComentario={handleAprobarComentario}
                onEliminarComentario={handleEliminarComentario}
                onActualizarEstadoComentario={handleActualizarEstadoComentario}
                onEditarRegistro={handleEditarRegistroTrigger}
                onNuevoRegistro={handleNuevoRegistroTrigger}
                onGuardarRegistro={guardarRegistro}
                onEliminarRegistro={eliminarRegistro}
                usuarioGoogle={usuarioGoogle}
                reaccionesFotos={reaccionesFotos}
                onGuardarReaccionFoto={guardarReaccionFoto}
                onEliminarReaccionFoto={eliminarReaccionFoto}
                onReaccionarComentario={handleReaccionarComentario}
                iniciarSesionConGoogle={async () => {
                  try {
                    await iniciarSesionConGoogle();
                  } catch (err: any) {
                    console.warn("Google login failed or cancelled:", err);
                  }
                }}
              />
            </motion.div>
          )}

          {activeTab === 'instituciones' && (
            <motion.div
              key="instituciones"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <InstitucionesTab
                instituciones={instituciones}
                aulas={aulas}
                registros={registros}
                rolActual={rolActual}
                metaGlobalCO2={proyectoMetadata.metaGlobalCO2}
                onGuardarInstitucion={async (inst) => {
                  await guardarInstitucion(inst);
                }}
                onSubirLogo={async (file) => {
                  return await subirImagenAFirebase(file, 'instituciones');
                }}
                onEliminarInstitucion={handleEliminarInstitucion}
                onEliminarAula={handleEliminarAula}
              />
            </motion.div>
          )}

          {activeTab === 'proyecto' && (
            <motion.div
              key="proyecto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <NuestroProyectoTab
                metadata={proyectoMetadata}
                rolActual={rolActual}
                equipo={equipo}
                onGuardarMetadata={async (newData) => {
                  await guardarProyectoMetadata(newData);
                }}
                onSubirLogo={async (file) => {
                  return await subirImagenAFirebase(file, 'proyecto');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'equipo' && (
            <motion.div
              key="equipo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {rolActual === 'ADMIN' && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setIsAddMiembroModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Integrante</span>
                  </button>
                </div>
              )}
              <NuestroEquipoTab
                equipo={equipo}
                rolActual={rolActual}
                onEditarEquipo={async (miembro) => {
                  const nuevoCargo = prompt(`Modificar cargo de ${miembro.nombreCompleto}:`, miembro.cargo);
                  if (nuevoCargo !== null && nuevoCargo.trim() !== '') {
                    await guardarMiembroEquipo({ ...miembro, cargo: nuevoCargo.trim() });
                  }
                }}
                onEliminarEquipo={async (id) => {
                  await eliminarMiembroEquipo(id);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'alianzas' && (
            <motion.div
              key="alianzas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlianzasTab
                aliados={aliados}
                metadata={proyectoMetadata}
                rolActual={rolActual}
                usuarioGoogle={usuarioGoogle}
                iniciarSesionConGoogle={iniciarSesionConGoogle}
                onGuardarAliado={async (aliado) => {
                  await guardarAliado(aliado);
                }}
                onEliminarAliado={async (id) => {
                  await eliminarAliado(id);
                }}
                onGuardarMetadata={async (newMeta) => {
                  setProyectoMetadata(newMeta);
                  await guardarProyectoMetadata(newMeta);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 5. FOOTER AND BRAND METADATA */}
      <footer className="bg-emerald-950 text-slate-300 py-10 px-4 mt-auto border-t-4 border-emerald-600" id="main-footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-white">
              <NeonLogo src={proyectoMetadata.logoUrl} fallbackType="project" sizeClass="w-10 h-10" alt="Logo" />
              <span className="font-display font-black text-base tracking-tight">ECOLOGICAL RACE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Cooperativa Ecológica Escolar de responsabilidad social escolar. Organizado con orgullo por delegados de responsabilidad ambiental del COAR Cajamarca.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsAyudaModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-950/90 to-cyan-950/90 hover:from-blue-900 hover:to-cyan-900 text-cyan-300 hover:text-white border border-cyan-400/60 hover:border-cyan-300 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition duration-300 shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] cursor-pointer group"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500/30 flex items-center justify-center text-cyan-300 border border-cyan-400/40 transition">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <span>Ayuda / Soporte</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h5 className="text-white font-mono uppercase font-bold text-[10px] tracking-wider text-emerald-400">Contacto Ejecutor</h5>
            <div className="pt-1">
              <a
                href="mailto:ecologicalrace.coar@gmail.com"
                className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold px-3.5 py-2 rounded-lg transition border border-emerald-700 shadow-sm"
              >
                ✉️ Enviar correo de contacto
              </a>
            </div>
            <p className="font-mono text-slate-500">📍 Jesús, Cajamarca, Perú</p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded border border-emerald-900 uppercase block w-fit">
              Canales Oficiales
            </span>
            <div className="flex flex-col gap-2 pt-1">
              {obtenerRedesSociales(proyectoMetadata).map((red) => (
                <a
                  key={red.id || red.nombre}
                  href={red.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-emerald-400 transition"
                >
                  <span className="shrink-0 text-emerald-400">
                    {renderSocialIcon(red.icono || red.nombre, 'w-4 h-4')}
                  </span>
                  <span>{red.nombre}: <span className="font-bold text-white">{red.usuario}</span></span>
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-6 text-center text-[10px] font-mono text-slate-500">
          © 2026 Ecological Race. Todos los derechos reservados. Categoría Medio Ambiente - COAR Cajamarca.
        </div>
      </footer>

      {/* 6. ADMIN MODAL DIALOG */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddLogModal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setRegistroParaEditar(null);
            }}
            aulas={aulas}
            instituciones={instituciones}
            onGuardarRegistro={handleGuardarRegistro}
            registroParaEditar={registroParaEditar}
          />
        )}
      </AnimatePresence>

      {/* 7. ADMIN ADD AULA DIALOG */}
      <AnimatePresence>
        {isAddAulaModalOpen && (
          <AddAulaModal
            isOpen={isAddAulaModalOpen}
            onClose={() => setIsAddAulaModalOpen(false)}
            instituciones={instituciones}
            onGuardarAula={handleGuardarAula}
          />
        )}
      </AnimatePresence>

      {/* 8. ADMIN ADD MIEMBRO DIALOG */}
      <AnimatePresence>
        {isAddMiembroModalOpen && (
          <AddMiembroModal
            isOpen={isAddMiembroModalOpen}
            onClose={() => setIsAddMiembroModalOpen(false)}
            onGuardarMiembro={handleGuardarMiembro}
          />
        )}
      </AnimatePresence>

      {/* 9. AYUDA / SOPORTE DIALOG */}
      <AnimatePresence>
        {isAyudaModalOpen && (
          <AyudaSoporteModal
            isOpen={isAyudaModalOpen}
            onClose={() => setIsAyudaModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 10. DONACIONES DIALOG */}
      <AnimatePresence>
        {isDonacionesModalOpen && (
          <DonacionesModal
            isOpen={isDonacionesModalOpen}
            onClose={() => setIsDonacionesModalOpen(false)}
            metadata={proyectoMetadata}
            rolActual={rolActual}
            onGuardarMetadata={async (meta) => {
              setProyectoMetadata(meta);
              await guardarProyectoMetadata(meta);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
