import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Award, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Institucion, Aula } from '../types';
import { subirImagenAFirebase } from '../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  instituciones: Institucion[];
  onGuardarAula: (aula: Aula) => Promise<void>;
  aulaExistente?: Aula | null;
}

export default function AddAulaModal({ isOpen, onClose, instituciones, onGuardarAula, aulaExistente }: Props) {
  const [institucionId, setInstitucionId] = useState(aulaExistente?.institucionId || instituciones[0]?.id || '');
  const [nombre, setNombre] = useState(aulaExistente?.nombre || '');
  const [raceCollector, setRaceCollector] = useState(aulaExistente?.raceCollector || '');
  const [slogan, setSlogan] = useState(aulaExistente?.slogan || '');
  const [logoUrl, setLogoUrl] = useState(aulaExistente?.logoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (aulaExistente) {
      setInstitucionId(aulaExistente.institucionId || instituciones[0]?.id || '');
      setNombre(aulaExistente.nombre || '');
      setRaceCollector(aulaExistente.raceCollector || '');
      setSlogan(aulaExistente.slogan || '');
      setLogoUrl(aulaExistente.logoUrl || '');
    } else {
      setInstitucionId(instituciones[0]?.id || '');
      setNombre('');
      setRaceCollector('');
      setSlogan('');
      setLogoUrl('');
    }
    setError(null);
  }, [aulaExistente, isOpen, instituciones]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const procesarArchivo = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await subirImagenAFirebase(file, 'aulas');
      setLogoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError('Error al subir la imagen. Se intentó guardar localmente de respaldo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await procesarArchivo(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institucionId || !nombre.trim() || !raceCollector.trim()) {
      setError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    try {
      const aulaAGuardar: Aula = {
        id: aulaExistente ? aulaExistente.id : `aula-${Date.now()}`,
        institucionId,
        nombre: nombre.trim(),
        raceCollector: raceCollector.trim(),
        slogan: slogan.trim() || undefined,
        logoUrl: logoUrl || undefined,
      };

      await onGuardarAula(aulaAGuardar);
      onClose();
    } catch (err) {
      setError(aulaExistente ? 'Error al actualizar el aula. Intenta de nuevo.' : 'Error al registrar el aula. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-lg overflow-hidden relative"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-display font-black text-slate-900 text-base uppercase tracking-tight">
                {aulaExistente ? 'Editar Aula Competidora' : 'Añadir Nueva Aula Competidora'}
              </h3>
              <p className="text-[10px] font-mono text-emerald-600 uppercase font-bold">Panel exclusivo de Administrador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-650 transition"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-600 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sede selector */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
              Institución Educativa *
            </label>
            <select
              value={institucionId}
              onChange={(e) => setInstitucionId(e.target.value)}
              required
              className="w-full text-xs font-mono font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="" disabled>Selecciona la sede...</option>
              {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grado y Sección */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
                Grado y Sección *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. 5° A, 6° B"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-sans font-bold"
              />
            </div>

            {/* Race Collector */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
                Race Collector (Líder) *
              </label>
              <input
                type="text"
                required
                value={raceCollector}
                onChange={(e) => setRaceCollector(e.target.value)}
                placeholder="Nombre del estudiante"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition font-sans font-bold"
              />
            </div>
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
              Eslogan o Lema Ambiental (Opcional)
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ej. 'Unidos por un futuro verde y limpio'"
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition italic"
            />
          </div>

          {/* Logo Upload with Drag & Drop and Click selection */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 font-bold">
              Logo o Insignia del Aula (Opcional)
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                isDragActive
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-slate-100/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {logoUrl ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-500 bg-white flex items-center justify-center">
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-0.5" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-left text-[10px] font-mono">
                    <span className="text-emerald-600 font-bold block">✓ ¡Imagen subida con éxito!</span>
                    <span className="text-slate-400">Haz clic o arrastra para cambiarla</span>
                  </div>
                </div>
              ) : uploading ? (
                <div className="flex flex-col items-center space-y-2 py-2">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-slate-500">Procesando y optimizando imagen...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1.5 text-slate-400">
                  <Upload className="w-6 h-6 text-slate-450" />
                  <p className="text-[11px] font-medium text-slate-600">
                    Arrastra tu imagen aquí o <span className="text-emerald-600 font-bold underline">búscala en tu equipo</span>
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">PNG, JPG de tamaño libre (se optimizará a máx 800px)</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-55"
            >
              {aulaExistente ? 'Guardar Cambios' : 'Añadir Aula'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
