import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Tag,
  Sparkles,
  Upload,
  Check,
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Actividad, RolUsuario } from '../types';
import { subirImagenAFirebase } from '../lib/firebase';

interface ActividadesTabProps {
  actividades: Actividad[];
  rolActual: RolUsuario;
  onGuardarActividad: (actividad: Actividad) => Promise<void>;
  onEliminarActividad: (id: string) => Promise<void>;
}

export default function ActividadesTab({
  actividades,
  rolActual,
  onGuardarActividad,
  onEliminarActividad,
}: ActividadesTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [actividadEditando, setActividadEditando] = useState<Actividad | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estado, setEstado] = useState<'activa' | 'finalizada'>('activa');
  const [enlaceAccion, setEnlaceAccion] = useState('');
  const [textoBotonAccion, setTextoBotonAccion] = useState('');

  const abrirModalCrear = () => {
    setActividadEditando(null);
    setTitulo('');
    setDescripcion('');
    setImagenUrl('');
    const hoy = new Date().toISOString().split('T')[0];
    setFechaInicio(hoy);
    setFechaFin('');
    setEstado('activa');
    setEnlaceAccion('');
    setTextoBotonAccion('Participar / Más Información');
    setModalOpen(true);
  };

  const abrirModalEditar = (act: Actividad) => {
    setActividadEditando(act);
    setTitulo(act.titulo || '');
    setDescripcion(act.descripcion || '');
    setImagenUrl(act.imagenUrl || '');
    setFechaInicio(act.fechaInicio || '');
    setFechaFin(act.fechaFin || '');
    setEstado(act.estado || 'activa');
    setEnlaceAccion(act.enlaceAccion || '');
    setTextoBotonAccion(act.textoBotonAccion || 'Participar / Más Información');
    setModalOpen(true);
  };

  const handleSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const url = await subirImagenAFirebase(file, 'actividades');
      setImagenUrl(url);
    } catch (err) {
      console.error('Error al subir imagen de actividad:', err);
      alert('Ocurrió un error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) {
      alert('Por favor completa el título y la descripción de la actividad.');
      return;
    }

    setGuardando(true);
    try {
      const id = actividadEditando ? actividadEditando.id : `act-${Date.now()}`;
      const nuevaActividad: Actividad = {
        id,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        imagenUrl: imagenUrl.trim(),
        fechaInicio: fechaInicio.trim(),
        fechaFin: fechaFin.trim(),
        estado,
        enlaceAccion: enlaceAccion.trim(),
        textoBotonAccion: textoBotonAccion.trim() || 'Participar / Más Información',
        createdAt: actividadEditando?.createdAt || new Date().toISOString(),
      };

      await onGuardarActividad(nuevaActividad);
      setModalOpen(false);
    } catch (err) {
      console.error('Error al guardar actividad:', err);
      alert('Ocurrió un error al guardar la actividad en Firebase.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (act: Actividad) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la actividad "${act.titulo}"?`)) {
      try {
        await onEliminarActividad(act.id);
      } catch (err) {
        console.error('Error al eliminar actividad:', err);
        alert('Ocurrió un error al eliminar la actividad.');
      }
    }
  };

  // Ordenar actividades: activas primero o por fecha más reciente
  const actividadesOrdenadas = [...actividades].sort((a, b) => {
    if (a.estado === 'activa' && b.estado !== 'activa') return -1;
    if (a.estado !== 'activa' && b.estado === 'activa') return 1;
    return new Date(b.createdAt || b.fechaInicio || 0).getTime() - new Date(a.createdAt || a.fechaInicio || 0).getTime();
  });

  return (
    <div className="space-y-8" id="actividades-container">
      {/* HEADER PRINCIPAL DE ACTIVIDADES */}
      <div className="bg-emerald-950 border border-emerald-500/35 rounded-3xl p-6 md:p-8 shadow-[0_0_25px_rgba(16,185,129,0.12)] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eventos & Convocatorias Ecológicas</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-display text-white">
              Actividades del Proyecto
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
              Participa en nuestras rifas pro-fondos, campañas de acopio masivo, talleres sostenibles y eventos especiales organizados por Ecological Race en beneficio de las instituciones educativas.
            </p>
          </div>

          {/* Botón Admin para Crear */}
          {rolActual === 'ADMIN' && (
            <div className="shrink-0">
              <button
                onClick={abrirModalCrear}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-mono font-black text-xs px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center space-x-2 border border-emerald-300/50 uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nueva Actividad</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LISTA DE TARJETAS DE ACTIVIDADES */}
      {actividadesOrdenadas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <Tag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-display uppercase tracking-tight">
            No hay actividades registradas aún
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Muy pronto publicaremos eventos, rifas y convocatorias ecológicas. ¡Vuelve a consultar esta sección en los próximos días!
          </p>
          {rolActual === 'ADMIN' && (
            <button
              onClick={abrirModalCrear}
              className="mt-2 inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar la primera actividad</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="actividades-grid">
          {actividadesOrdenadas.map((act) => {
            const esActiva = act.estado === 'activa';

            return (
              <motion.div
                key={act.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 relative group shadow-sm hover:shadow-md ${
                  esActiva
                    ? 'border-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
                    : 'border-slate-200 opacity-90 grayscale-[20%] hover:grayscale-0'
                }`}
              >
                {/* Badge de Estado e Imagen */}
                <div className="relative w-full h-52 bg-slate-100 overflow-hidden shrink-0">
                  {act.imagenUrl ? (
                    <img
                      src={act.imagenUrl}
                      alt={act.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-4 text-center">
                      <Sparkles className="w-10 h-10 text-emerald-400 mb-2 opacity-80" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-200">
                        {act.titulo}
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay for Text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    {esActiva ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-emerald-950 font-mono font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-300 shadow-md animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-950" />
                        <span>ACTIVA</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-800/90 text-slate-300 font-mono font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider border border-slate-600 backdrop-blur-md shadow-md">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>FINALIZADA</span>
                      </span>
                    )}
                  </div>

                  {/* Admin Edit/Delete Floating Overlay */}
                  {rolActual === 'ADMIN' && (
                    <div className="absolute top-3 right-3 z-10 flex items-center space-x-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60 shadow-lg">
                      <button
                        onClick={() => abrirModalEditar(act)}
                        className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 p-1.5 rounded-xl transition cursor-pointer"
                        title="Editar actividad"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(act)}
                        className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-1.5 rounded-xl transition cursor-pointer"
                        title="Eliminar actividad"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Dates */}
                    {(act.fechaInicio || act.fechaFin) && (
                      <div className="flex items-center text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                        <span>
                          {act.fechaInicio ? `Del ${act.fechaInicio}` : ''}
                          {act.fechaFin ? ` al ${act.fechaFin}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-snug font-display">
                      {act.titulo}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line line-clamp-4">
                      {act.descripcion}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-100">
                    {esActiva ? (
                      act.enlaceAccion ? (
                        <a
                          href={act.enlaceAccion}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 text-center uppercase tracking-wider"
                        >
                          <span>{act.textoBotonAccion || 'Participar / Más Información'}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ) : (
                        <div className="w-full bg-emerald-50 text-emerald-800 font-mono font-bold text-xs px-4 py-2.5 rounded-xl border border-emerald-200 text-center uppercase tracking-wider">
                          <span>{act.textoBotonAccion || 'Actividad En Curso'}</span>
                        </div>
                      )
                    ) : (
                      <div className="w-full bg-slate-100 text-slate-400 font-mono font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 text-center cursor-not-allowed uppercase tracking-wider flex items-center justify-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Actividad Finalizada</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MODAL PARA CREAR / EDITAR ACTIVIDAD (ADMIN) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative my-8"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase font-display tracking-tight">
                      {actividadEditando ? 'Editar Actividad' : 'Nueva Actividad'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {actividadEditando ? 'Modifica los datos de la actividad' : 'Registra un evento, rifa o convocatoria'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Título de la Actividad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rifa Pro-Fondos 2026, Campaña de Reciclaje Masivo..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Descripción / Detalles de Participación *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explica de qué trata la actividad, los premios, requisitos y cómo pueden participar los estudiantes o el público..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Imagen (URL o Archivo) */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Afiche / Imagen Promocional
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="URL de imagen (https://...)"
                      value={imagenUrl}
                      onChange={(e) => setImagenUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{subiendoImagen ? 'Subiendo imagen...' : 'Subir Imagen / Afiche'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSubirImagen}
                          disabled={subiendoImagen}
                          className="hidden"
                        />
                      </label>
                      {imagenUrl && (
                        <span className="text-[10px] font-mono text-emerald-600 font-bold truncate max-w-[200px]">
                          ✓ Imagen cargada
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fechas: Inicio y Fin */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Fecha de Inicio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 15 de Agosto 2026 / 2026-08-15"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Fecha de Cierre / Fin
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 30 de Septiembre 2026"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Estado de la Actividad
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as 'activa' | 'finalizada')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="activa">🟢 ACTIVA (En Curso)</option>
                    <option value="finalizada">⚪ FINALIZADA (Histórico)</option>
                  </select>
                </div>

                {/* Enlace de Acción & Texto del Botón */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Enlace Externo (WhatsApp, Form, etc.)
                    </label>
                    <input
                      type="url"
                      placeholder="Ej. https://wa.me/... o https://forms.gle/..."
                      value={enlaceAccion}
                      onChange={(e) => setEnlaceAccion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Texto del Botón
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Comprar Boleto, Registrarse, Ver Formulario..."
                      value={textoBotonAccion}
                      onChange={(e) => setTextoBotonAccion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando || subiendoImagen}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center space-x-2 uppercase tracking-wider"
                  >
                    {guardando ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{actividadEditando ? 'Guardar Cambios' : 'Crear Actividad'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
