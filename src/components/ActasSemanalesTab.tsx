import React, { useState } from 'react';
import { Aula, RegistroSemanal, Comentario, RolUsuario, Institucion, ReaccionFoto } from '../types';
import CommentsSection from './CommentsSection';
import { Calendar, FileText, Camera, Edit2, Plus, ArrowLeft, ArrowRight, ShieldAlert, BadgeHelp, CheckCircle2, Heart, Upload, Loader2, X, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { subirImagenAFirebase, eliminarRegistro } from '../lib/firebase';

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
  onGuardarRegistro?: (reg: RegistroSemanal) => Promise<void>;
  onEliminarRegistro?: (id: string) => Promise<void>;
  usuarioGoogle: FirebaseUser | null;
  reaccionesFotos: ReaccionFoto[];
  onGuardarReaccionFoto: (reac: ReaccionFoto) => Promise<void>;
  onEliminarReaccionFoto?: (id: string) => Promise<void>;
  onReaccionarComentario?: (comentarioId: string, tipo: 'like' | 'dislike') => Promise<void>;
  iniciarSesionConGoogle?: () => Promise<void>;
}

interface ItemGaleria {
  id: string;
  url: string;
  titulo?: string;
  etiqueta?: string;
  caption: string;
  fecha: string; // ISO date string
  semana: number;
  tipo: 'imagen' | 'video';
}

const formatFechaSencilla = (fechaStr: string) => {
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch {
    return fechaStr;
  }
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
  onGuardarRegistro,
  onEliminarRegistro,
  usuarioGoogle,
  reaccionesFotos,
  onGuardarReaccionFoto,
  onEliminarReaccionFoto,
  onReaccionarComentario,
  iniciarSesionConGoogle,
}: Props) {
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(5);
  const [ieFiltrada, setIeFiltrada] = useState<string>('all');

  const [mostrarFormFoto, setMostrarFormFoto] = useState(false);
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
  const [tituloFoto, setTituloFoto] = useState('');
  const [etiquetaFoto, setEtiquetaFoto] = useState('');
  const [descripcionFoto, setDescripcionFoto] = useState('');
  const [fechaFoto, setFechaFoto] = useState(new Date().toISOString().split('T')[0]);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Estados para edición de fotos del mosaico
  const [fotoEditandoId, setFotoEditandoId] = useState<string | null>(null);
  const [tituloEditando, setTituloEditando] = useState<string>('');
  const [etiquetaEditando, setEtiquetaEditando] = useState<string>('');
  const [descripcionEditando, setDescripcionEditando] = useState<string>('');
  const [fechaEditando, setFechaEditando] = useState<string>('');
  const [fotoArchivoEditando, setFotoArchivoEditando] = useState<File | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState<boolean>(false);

  const handleDescargarImagen = async (url: string, tituloOCaption?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const extension = blob.type.split('/')[1] || 'jpg';
      const nombreLimpio = (tituloOCaption || 'evidencia')
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '_')
        .slice(0, 30);
      a.download = `${nombreLimpio}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = 'evidencia.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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

  // Compile full photo/video album chronologically
  const itemsGaleria: ItemGaleria[] = [];

  // Add real photos and videos uploaded by Admin
  registros.forEach((reg) => {
    if (reg.fotoEvidenciaUrl) {
      let tipo: 'imagen' | 'video' = reg.fotoEvidenciaTipo || 'imagen';
      if (!reg.fotoEvidenciaTipo) {
        const lower = reg.fotoEvidenciaUrl.toLowerCase();
        if (
          lower.match(/\.(mp4|webm|ogg|mov|m4v|mkv|avi)(\?.*)?$/i) ||
          reg.fotoEvidenciaUrl.startsWith('data:video/')
        ) {
          tipo = 'video';
        }
      }
      itemsGaleria.push({
        id: reg.id,
        url: reg.fotoEvidenciaUrl,
        titulo: reg.tituloEvidencia || '',
        etiqueta: reg.etiquetaEvidencia || '',
        caption: reg.descripcionEvidencia || `Evidencia de pesaje - Reporte N.° ${reg.semana}`,
        fecha: reg.fecha || reg.updatedAt || '2026-07-02',
        semana: reg.semana,
        tipo,
      });
    }
  });

  // Create a map of item.id -> chronological order number (1-based, 1 = oldest created)
  const ordenMap = new Map<string, number>();
  const itemsOrdenadosAsc = [...itemsGaleria].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  itemsOrdenadosAsc.forEach((it, index) => {
    ordenMap.set(it.id, index + 1);
  });

  // Sort chronological: Newest to oldest (recent first)
  itemsGaleria.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // Deterministic heights to enforce varied mosaic/collage layout
  const getCollageClasses = (index: number) => {
    const classes = [
      'col-span-1 h-[280px]',
      'col-span-1 h-[320px]',
      'col-span-1 h-[260px]',
      'col-span-1 h-[340px]',
    ];
    return classes[index % classes.length];
  };

  const handleReaccionarFoto = async (fotoId: string, tipo: 'like' | 'dislike') => {
    if (!usuarioGoogle) {
      alert("Debes iniciar sesión con Google para reaccionar a las fotos.");
      iniciarSesionConGoogle?.();
      return;
    }

    const userUid = usuarioGoogle.uid;
    const existing = reaccionesFotos.find((r) => r.id === fotoId) || {
      id: fotoId,
      url: '',
      likes: 0,
      dislikes: 0,
      likesUsers: [],
      dislikesUsers: [],
    };

    let likesUsers = [...(existing.likesUsers || [])];
    let dislikesUsers = [...(existing.dislikesUsers || [])];

    if (tipo === 'like') {
      if (likesUsers.includes(userUid)) {
        // Toggle off
        likesUsers = likesUsers.filter((uid) => uid !== userUid);
      } else {
        // Toggle on and remove from dislikes if present
        likesUsers.push(userUid);
        dislikesUsers = dislikesUsers.filter((uid) => uid !== userUid);
      }
    } else {
      if (dislikesUsers.includes(userUid)) {
        // Toggle off
        dislikesUsers = dislikesUsers.filter((uid) => uid !== userUid);
      } else {
        // Toggle on and remove from likes if present
        dislikesUsers.push(userUid);
        likesUsers = likesUsers.filter((uid) => uid !== userUid);
      }
    }

    const updated: ReaccionFoto = {
      id: fotoId,
      url: existing.url || '',
      likes: likesUsers.length,
      dislikes: dislikesUsers.length,
      likesUsers,
      dislikesUsers,
    };

    await onGuardarReaccionFoto(updated);
  };

  const handleGuardarFotoNueva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fotoArchivo) {
      alert("Por favor selecciona una foto o video.");
      return;
    }
    if (!descripcionFoto.trim()) {
      alert("Por favor escribe una descripción para la evidencia.");
      return;
    }

    setSubiendoFoto(true);
    try {
      const url = await subirImagenAFirebase(fotoArchivo, 'evidencias');
      const esVideo = fotoArchivo.type.startsWith('video/');
      const fotoEvidenciaTipo: 'imagen' | 'video' = esVideo ? 'video' : 'imagen';
      
      const nuevoRegistroFoto: RegistroSemanal = {
        id: `foto-${Date.now()}`,
        aulaId: '',
        semana: semanaSeleccionada,
        fecha: fechaFoto || new Date().toISOString().split('T')[0],
        kgPlastico: 0,
        kgAluminio: 0,
        kgPapel: 0,
        multiplicadorVerde: false,
        montoVentaSoles: 0,
        fotoEvidenciaUrl: url,
        fotoEvidenciaTipo,
        tituloEvidencia: tituloFoto.trim(),
        etiquetaEvidencia: etiquetaFoto.trim(),
        descripcionEvidencia: descripcionFoto.trim(),
        updatedAt: new Date().toISOString()
      };

      if (onGuardarRegistro) {
        await onGuardarRegistro(nuevoRegistroFoto);
      }
      
      setTituloFoto('');
      setEtiquetaFoto('');
      setDescripcionFoto('');
      setFechaFoto(new Date().toISOString().split('T')[0]);
      setFotoArchivo(null);
      setMostrarFormFoto(false);
      alert("¡Evidencia añadida con éxito a la galería!");
    } catch (error) {
      console.error("Error al guardar la evidencia:", error);
      alert("Hubo un error al subir o guardar la evidencia.");
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleGuardarEdicionFoto = async (itemId: string, itemUrl: string, itemSemana: number) => {
    if (!descripcionEditando.trim()) {
      alert("Por favor escribe una descripción para la evidencia.");
      return;
    }

    setGuardandoEdicion(true);
    try {
      const regOriginal = registros.find((r) => r.id === itemId);
      let url = itemUrl;
      let fotoEvidenciaTipo: 'imagen' | 'video' = regOriginal?.fotoEvidenciaTipo || 'imagen';

      if (fotoArchivoEditando) {
        url = await subirImagenAFirebase(fotoArchivoEditando, 'evidencias');
        fotoEvidenciaTipo = fotoArchivoEditando.type.startsWith('video/') ? 'video' : 'imagen';
      }

      const regActualizado: RegistroSemanal = {
        ...(regOriginal || {
          id: itemId,
          aulaId: '',
          semana: itemSemana,
          kgPlastico: 0,
          kgAluminio: 0,
          kgPapel: 0,
          multiplicadorVerde: false,
          montoVentaSoles: 0,
        }),
        id: itemId,
        fecha: fechaEditando || regOriginal?.fecha || new Date().toISOString().split('T')[0],
        fotoEvidenciaUrl: url,
        fotoEvidenciaTipo,
        tituloEvidencia: tituloEditando.trim(),
        etiquetaEvidencia: etiquetaEditando.trim(),
        descripcionEvidencia: descripcionEditando.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (onGuardarRegistro) {
        await onGuardarRegistro(regActualizado);
      }

      setFotoEditandoId(null);
      setFotoArchivoEditando(null);
      setTituloEditando('');
      setEtiquetaEditando('');
      setDescripcionEditando('');
      setFechaEditando('');
    } catch (error) {
      console.error("Error al guardar la edición de evidencia:", error);
      alert("Hubo un error al guardar los cambios de la evidencia.");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleEliminarEvidencia = async (itemId: string) => {
    if (window.confirm("¿Seguro que quieres eliminar esta evidencia?")) {
      try {
        if (onEliminarRegistro) {
          await onEliminarRegistro(itemId);
        } else {
          await eliminarRegistro(itemId);
        }
        if (onEliminarReaccionFoto) {
          await onEliminarReaccionFoto(itemId);
        }
      } catch (error) {
        console.error("Error al eliminar la evidencia:", error);
        alert("Hubo un error al eliminar la evidencia.");
      }
    }
  };

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
                Reporte N.° {semanaSeleccionada}
              </h4>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                REGISTRO SEMANAL DE RECOLECCIÓN Y VENTA
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
            <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Fecha del Reporte</span>
            <span className="font-mono text-sm font-bold text-slate-800 block mt-1">
              {registrosSemana.length > 0 ? new Date(registrosSemana[0].fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pendiente'}
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

      {/* Grid of records and Complete Evidences album */}
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
                  ⌛ No hay pesajes registrados para el Reporte N.° {semanaSeleccionada} todavía. 
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
            usuarioGoogle={usuarioGoogle}
            onReaccionarComentario={onReaccionarComentario}
            iniciarSesionConGoogle={iniciarSesionConGoogle}
          />
        </div>

        {/* Right Column: Complete, Unfiltered, Chronological visual gallery album */}
        <div className="space-y-6">
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-sm relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Header with "+ Añadir Foto" option */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-stone-200">
              <div className="flex items-center space-x-2 text-stone-800 font-display font-bold text-xs uppercase tracking-widest">
                <Camera className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Mosaico de Evidencias</span>
              </div>

              {rolActual === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => setMostrarFormFoto(!mostrarFormFoto)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-all duration-200"
                >
                  {mostrarFormFoto ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{mostrarFormFoto ? 'Cerrar' : '+ Añadir Evidencia'}</span>
                </button>
              )}
            </div>

            {/* Sub-label explaining visual album properties */}
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wide mb-3">
              ÁLBUM DE RECUERDOS (ORDENADO CRONOLÓGICAMENTE)
            </p>

            {/* Photo/Video upload form inline */}
            <AnimatePresence>
              {mostrarFormFoto && (
                <motion.form
                  onSubmit={handleGuardarFotoNueva}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white border border-stone-200 rounded-xl p-4 mb-4 space-y-3 overflow-hidden shadow-xs"
                >
                  <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                    <span className="text-[10px] font-mono text-emerald-700 font-extrabold uppercase tracking-wider">
                      Subir Nueva Evidencia (Foto o Video)
                    </span>
                    <button
                      type="button"
                      onClick={() => setMostrarFormFoto(false)}
                      className="text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-stone-500 uppercase font-black">
                      Seleccionar Foto o Video:
                    </label>
                    <div className="relative border border-dashed border-stone-300 rounded-lg p-4 text-center hover:bg-stone-50 transition cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFotoArchivo(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Upload className="w-5 h-5 text-stone-400" />
                        <span className="text-xs text-stone-600 font-semibold leading-tight">
                          {fotoArchivo ? fotoArchivo.name : 'Selecciona una foto o video, o arrástralo aquí'}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400">
                          Formatos: Fotos (JPG, PNG, WEBP) o Videos (MP4, WEBM, MOV)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-500 uppercase font-black">
                        Fecha de la Evidencia:
                      </label>
                      <input
                        type="date"
                        value={fechaFoto}
                        onChange={(e) => setFechaFoto(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-500 uppercase font-black">
                        Etiqueta / Badge (Opcional):
                      </label>
                      <input
                        type="text"
                        value={etiquetaFoto}
                        onChange={(e) => setEtiquetaFoto(e.target.value)}
                        placeholder="Ej. REP. 3 o Conferencia"
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-stone-500 uppercase font-black">
                        Título (Opcional):
                      </label>
                      <input
                        type="text"
                        value={tituloFoto}
                        onChange={(e) => setTituloFoto(e.target.value)}
                        placeholder="Ej. JORNADA DE RECICLAJE"
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-stone-500 uppercase font-black">
                      Comentario o Descripción:
                    </label>
                    <textarea
                      rows={2}
                      value={descripcionFoto}
                      onChange={(e) => setDescripcionFoto(e.target.value)}
                      placeholder="Escribe un comentario o descripción de la actividad ambiental..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={subiendoFoto}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-mono font-black text-xs uppercase py-2 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                  >
                    {subiendoFoto ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo Evidencia...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Guardar Evidencia</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Scrapbook Polaroid Collage Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 p-1 overflow-y-auto max-h-[850px]" id="scrapbook-gallery">
              {itemsGaleria.length === 0 ? (
                <div className="col-span-full py-16 px-4 text-center bg-stone-100/60 border border-dashed border-stone-300 rounded-xl">
                  <Camera className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-sans font-bold leading-relaxed">
                    Aún no hay evidencias cargadas. El Administrador puede agregar la primera foto o video.
                  </p>
                </div>
              ) : (
                itemsGaleria.map((item, idx) => {
                  const reaccionesDeEstaFoto = reaccionesFotos.find(r => r.id === item.id);
                  const likesCount = reaccionesDeEstaFoto?.likes || 0;
                  const dislikesCount = reaccionesDeEstaFoto?.dislikes || 0;

                  const yaLeDioLike = usuarioGoogle && reaccionesDeEstaFoto?.likesUsers?.includes(usuarioGoogle.uid);
                  const yaLeDioDislike = usuarioGoogle && reaccionesDeEstaFoto?.dislikesUsers?.includes(usuarioGoogle.uid);

                  const rotationAngles = [
                    '-rotate-2 translate-y-1 hover:rotate-0 hover:-translate-y-1',
                    'rotate-3 -translate-y-1 hover:rotate-0 hover:translate-y-1',
                    '-rotate-1 hover:rotate-0 hover:-translate-y-1',
                    'rotate-2 translate-y-2 hover:rotate-0 hover:-translate-y-2',
                    '-rotate-3 hover:rotate-0 hover:translate-y-1',
                    'rotate-1 -translate-y-2 hover:rotate-0 hover:translate-y-2'
                  ];
                  const angleClass = rotationAngles[idx % rotationAngles.length];

                  if (fotoEditandoId === item.id) {
                    const previewEsVideo = fotoArchivoEditando
                      ? fotoArchivoEditando.type.startsWith('video/')
                      : item.tipo === 'video';
                    const previewUrl = fotoArchivoEditando
                      ? URL.createObjectURL(fotoArchivoEditando)
                      : item.url;

                    return (
                      <div
                        key={item.id}
                        className={`relative bg-white p-3.5 shadow-md flex flex-col border-2 border-emerald-500 rounded-xl space-y-3 z-30 ${angleClass}`}
                      >
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="text-[10px] font-mono text-emerald-800 font-extrabold uppercase">
                            Editar Evidencia
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFotoEditandoId(null);
                              setFotoArchivoEditando(null);
                            }}
                            className="text-stone-400 hover:text-stone-600 p-0.5 rounded cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Image / Video Preview / Replacement */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono text-stone-500 uppercase font-black">
                            Archivo / Reemplazar (Opcional):
                          </label>
                          <div className="flex items-center gap-2">
                            {previewEsVideo ? (
                              <video
                                src={previewUrl}
                                controls
                                className="w-16 h-12 object-cover rounded border border-stone-200 shrink-0"
                              />
                            ) : (
                              <img
                                src={previewUrl}
                                alt="Vista previa"
                                className="w-16 h-12 object-cover rounded border border-stone-200 shrink-0"
                              />
                            )}
                            <div className="relative flex-1 border border-dashed border-stone-300 rounded-lg p-2 text-center hover:bg-stone-50 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setFotoArchivoEditando(e.target.files[0]);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <span className="text-[10px] text-stone-600 font-semibold block truncate">
                                {fotoArchivoEditando ? fotoArchivoEditando.name : 'Cambiar archivo...'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Fecha, Etiqueta, and Titulo inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-stone-500 uppercase font-black">
                              Fecha de Evidencia:
                            </label>
                            <input
                              type="date"
                              value={fechaEditando}
                              onChange={(e) => setFechaEditando(e.target.value)}
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-stone-500 uppercase font-black">
                              Etiqueta (Opcional):
                            </label>
                            <input
                              type="text"
                              value={etiquetaEditando}
                              onChange={(e) => setEtiquetaEditando(e.target.value)}
                              placeholder="Ej. REP. 3 o Conferencia"
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono text-stone-500 uppercase font-black">
                              Título (Opcional):
                            </label>
                            <input
                              type="text"
                              value={tituloEditando}
                              onChange={(e) => setTituloEditando(e.target.value)}
                              placeholder="Ej. JORNADA DE RECICLAJE"
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        {/* Description input */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono text-stone-500 uppercase font-black">
                            Descripción / Comentario:
                          </label>
                          <textarea
                            rows={2}
                            value={descripcionEditando}
                            onChange={(e) => setDescripcionEditando(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                            required
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <button
                            type="button"
                            disabled={guardandoEdicion}
                            onClick={() => {
                              setFotoEditandoId(null);
                              setFotoArchivoEditando(null);
                            }}
                            className="px-2.5 py-1 text-[10px] font-mono font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={guardandoEdicion}
                            onClick={() => handleGuardarEdicionFoto(item.id, item.url, item.semana)}
                            className="px-3 py-1 text-[10px] font-mono font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 rounded-lg transition cursor-pointer flex items-center space-x-1"
                          >
                            {guardandoEdicion ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Guardando...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Guardar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const numeroOrden = ordenMap.get(item.id) || (idx + 1);
                  const textoEtiqueta = item.etiqueta && item.etiqueta.trim() !== ''
                    ? item.etiqueta.trim()
                    : `EVID. ${numeroOrden}`;

                  return (
                    <div
                      key={item.id}
                      className={`relative bg-white p-3 pb-5 shadow-[0_5px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.16)] transition-all duration-300 flex flex-col border border-stone-200/80 rounded-[2px_3px_2px_4px] select-none hover:z-10 ${angleClass}`}
                    >
                      {/* Paper Tape decoration */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-amber-100/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-amber-200/20 backdrop-blur-xs -rotate-2 z-20" />

                      {/* Photo / Video Area */}
                      <div className="w-full aspect-[4/3] overflow-hidden bg-stone-100 border border-stone-200/60 relative rounded-[1px_2px_1px_2px] group">
                        {item.tipo === 'video' ? (
                          <video
                            src={item.url}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <img
                              src={item.url}
                              alt={item.caption}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover filter brightness-95 hover:brightness-100 transition duration-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleDescargarImagen(item.url, item.titulo || item.caption)}
                              title="Descargar imagen"
                              className="absolute bottom-2 left-2 z-10 p-1.5 rounded-md bg-stone-900/70 hover:bg-stone-900/90 text-white backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-xs border border-white/20 opacity-80 hover:opacity-100 hover:scale-105 flex items-center justify-center"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <span className="absolute top-2 right-2 text-[8px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded font-black tracking-wider shadow-2xs z-10 pointer-events-none">
                          {textoEtiqueta}
                        </span>
                      </div>

                      {/* Polaroid bottom portion with caption and likes */}
                      <div className="pt-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono font-bold text-stone-400 block mb-1">
                            {formatFechaSencilla(item.fecha)}
                          </span>
                          {item.titulo && (
                            <h4 className="text-xs font-black uppercase tracking-wide text-emerald-700 font-mono mb-1.5 drop-shadow-[0_0_6px_rgba(16,185,129,0.35)] leading-snug">
                              {item.titulo}
                            </h4>
                          )}
                          <div className="max-h-[64px] overflow-y-auto pr-1 custom-thin-scrollbar text-xs text-stone-700 font-sans font-semibold italic leading-snug tracking-tight">
                            "{item.caption}"
                          </div>
                        </div>

                        {/* Interactive reaction buttons and Admin controls */}
                        <div className="flex items-center justify-between pt-2 mt-3 border-t border-stone-100 flex-wrap gap-1.5">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleReaccionarFoto(item.id, 'like')}
                              className={`flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded border transition duration-150 cursor-pointer select-none ${
                                yaLeDioLike
                                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                              }`}
                            >
                              <span>👍</span>
                              <span>{likesCount}</span>
                            </button>
                          </div>

                          {rolActual === 'ADMIN' && (
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setFotoEditandoId(item.id);
                                  setTituloEditando(item.titulo || '');
                                  setEtiquetaEditando(item.etiqueta || '');
                                  setDescripcionEditando(item.caption);
                                  setFechaEditando(item.fecha ? item.fecha.split('T')[0] : new Date().toISOString().split('T')[0]);
                                  setFotoArchivoEditando(null);
                                }}
                                className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded border bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 font-bold transition duration-150 cursor-pointer select-none"
                                title="Editar evidencia"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Editar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEliminarEvidencia(item.id)}
                                className="flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded border bg-red-50 hover:bg-red-100 text-red-700 border-red-200 font-bold transition duration-150 cursor-pointer select-none"
                                title="Eliminar evidencia"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Disclaimer on Privacy */}
            <div className="mt-4 bg-stone-100 border border-stone-200 p-3 rounded-xl flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[10px] font-mono text-stone-500 leading-tight">
                <strong>Protección de Privacidad:</strong> Por políticas de protección de datos y privacidad, las fotos priorizan planos de manos, espaldas o perfiles, sin mostrar rostros de estudiantes menores de edad de forma identificable.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
