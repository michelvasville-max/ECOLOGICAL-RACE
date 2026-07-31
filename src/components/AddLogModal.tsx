import React, { useState, useEffect, useRef } from 'react';
import { Aula, Institucion, RegistroSemanal } from '../types';
import { X, Calendar, Plus, Scale, Save, Leaf, Coins, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { subirImagenAFirebase } from '../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  aulas: Aula[];
  instituciones: Institucion[];
  onGuardarRegistro: (reg: RegistroSemanal) => void;
  registroParaEditar?: RegistroSemanal | null;
}

export default function AddLogModal({
  isOpen,
  onClose,
  aulas,
  instituciones,
  onGuardarRegistro,
  registroParaEditar,
}: Props) {
  const [institucionId, setInstitucionId] = useState('');
  const [aulaId, setAulaId] = useState('');
  const [semana, setSemana] = useState(5);
  const [fecha, setFecha] = useState('2026-07-02');
  const [kgPlastico, setKgPlastico] = useState('');
  const [kgAluminio, setKgAluminio] = useState('');
  const [kgPapel, setKgPapel] = useState('');
  const [multiplicadorVerde, setMultiplicadorVerde] = useState(false);
  const [montoVentaSoles, setMontoVentaSoles] = useState('');
  const [descripcionEvidencia, setDescripcionEvidencia] = useState('');
  const [fotoEvidenciaUrl, setFotoEvidenciaUrl] = useState('');
  const [fotoEvidenciaTipo, setFotoEvidenciaTipo] = useState<'imagen' | 'video'>('imagen');
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // When editing, fill fields
  useEffect(() => {
    if (registroParaEditar) {
      const aula = aulas.find((a) => a.id === registroParaEditar.aulaId);
      setInstitucionId(aula ? aula.institucionId : '');
      setAulaId(registroParaEditar.aulaId);
      setSemana(registroParaEditar.semana);
      setFecha(registroParaEditar.fecha);
      setKgPlastico(String(registroParaEditar.kgPlastico));
      setKgAluminio(String(registroParaEditar.kgAluminio));
      setKgPapel(String(registroParaEditar.kgPapel));
      setMultiplicadorVerde(registroParaEditar.multiplicadorVerde);
      setMontoVentaSoles(String(registroParaEditar.montoVentaSoles));
      setDescripcionEvidencia(registroParaEditar.descripcionEvidencia || '');
      setFotoEvidenciaUrl(registroParaEditar.fotoEvidenciaUrl || '');
      setFotoEvidenciaTipo(registroParaEditar.fotoEvidenciaTipo || 'imagen');
    } else {
      // Default blank values
      if (instituciones.length > 0) setInstitucionId(instituciones[0].id);
      setAulaId('');
      setSemana(5);
      setFecha('2026-07-02');
      setKgPlastico('');
      setKgAluminio('');
      setKgPapel('');
      setMultiplicadorVerde(false);
      setMontoVentaSoles('');
      setDescripcionEvidencia('');
      setFotoEvidenciaUrl('');
      setFotoEvidenciaTipo('imagen');
    }
  }, [registroParaEditar, isOpen, instituciones, aulas]);

  // Dynamically filter classrooms belonging to selected institution
  const aulasFiltradas = aulas.filter((a) => a.institucionId === institucionId);

  // Auto select first classroom when school changes
  useEffect(() => {
    if (aulasFiltradas.length > 0 && !registroParaEditar) {
      setAulaId(aulasFiltradas[0].id);
    }
  }, [institucionId, registroParaEditar]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    const esVideo = file.type.startsWith('video/');
    const tipo: 'imagen' | 'video' = esVideo ? 'video' : 'imagen';
    setFotoEvidenciaTipo(tipo);

    try {
      const url = await subirImagenAFirebase(file, 'evidencias');
      setFotoEvidenciaUrl(url);
    } catch (err) {
      console.error("Error uploading evidence file:", err);
      alert("No se pudo subir el archivo de evidencia. Intente nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aulaId) return;

    const reg: RegistroSemanal = {
      id: registroParaEditar ? registroParaEditar.id : `reg-${Date.now()}`,
      aulaId,
      semana: Number(semana),
      fecha,
      kgPlastico: Number(kgPlastico) || 0,
      kgAluminio: Number(kgAluminio) || 0,
      kgPapel: Number(kgPapel) || 0,
      multiplicadorVerde,
      montoVentaSoles: Number(montoVentaSoles) || 0,
      descripcionEvidencia: descripcionEvidencia.trim(),
      fotoEvidenciaUrl: fotoEvidenciaUrl || '',
      fotoEvidenciaTipo,
      updatedAt: new Date().toISOString(),
    };

    onGuardarRegistro(reg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-300" />
            <h3 className="font-display font-bold text-lg tracking-tight">
              {registroParaEditar ? 'Modificar Pesaje Semanal' : 'Registrar Nuevo Pesaje Semanal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white hover:bg-emerald-700/50 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Institutional Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Institución I.E.</label>
              <select
                value={institucionId}
                onChange={(e) => setInstitucionId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {instituciones.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Aula / Sección</label>
              <select
                value={aulaId}
                onChange={(e) => setAulaId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="" disabled>Seleccione Aula...</option>
                {aulasFiltradas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} - (Rep: {a.raceCollector})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing context */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Número de Reporte</label>
              <input
                type="number"
                min="1"
                required
                value={semana}
                onChange={(e) => setSemana(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Fecha de Registro</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Materials weight in kg */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
            <h4 className="font-mono text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Carga de Residuos Pesados (kg)</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-mono text-slate-500 mb-1">Plástico (PET)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={kgPlastico}
                  onChange={(e) => setKgPlastico(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 mb-1">Aluminio (Latas)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={kgAluminio}
                  onChange={(e) => setKgAluminio(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 mb-1">Papel</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={kgPapel}
                  onChange={(e) => setKgPapel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Multiplier and Money */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Monto Generado (S/.)</label>
              <div className="relative">
                <Coins className="absolute left-2.5 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  value={montoVentaSoles}
                  onChange={(e) => setMontoVentaSoles(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100/80 p-2.5 rounded-lg border border-emerald-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={multiplicadorVerde}
                  onChange={(e) => setMultiplicadorVerde(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded-sm focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer"
                />
                <div className="leading-tight text-emerald-950 font-medium flex items-center space-x-1">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  <span>Multiplicador (+20%)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Description / Evidence summary */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Descripción / Evidencia del Acto</label>
            <textarea
              rows={2}
              placeholder="Ej. Delegados limpiaron las botellas y certificaron que la cartilla ambiental diaria se cumplió en un 100%..."
              value={descripcionEvidencia}
              onChange={(e) => setDescripcionEvidencia(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Foto/Video de Evidencia Upload */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Evidencia Visual (Foto / Video)</label>
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition select-none ${
                isDragActive
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-emerald-500/50 bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
              {uploading ? (
                <div className="text-xs text-slate-500 font-mono animate-pulse">Subiendo archivo...</div>
              ) : fotoEvidenciaUrl ? (
                <div className="flex flex-col items-center">
                  {fotoEvidenciaTipo === 'video' ? (
                    <video
                      src={fotoEvidenciaUrl}
                      controls
                      className="w-full max-h-36 rounded-lg border border-emerald-500 mb-2 bg-black object-contain"
                    />
                  ) : (
                    <img
                      src={fotoEvidenciaUrl}
                      alt="Vista previa de evidencia"
                      className="w-full max-h-32 object-cover rounded-lg border border-emerald-500 mb-2"
                    />
                  )}
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">¡Cargado con éxito! Click para cambiar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-600">Arrastra una imagen o video, o haz clic para subir</span>
                  <span className="text-[9px] text-slate-400 font-mono">JPG, PNG, MP4, WEBM (máx. 10MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Save & Cancel buttons */}
          <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-md flex items-center space-x-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Pesaje</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
