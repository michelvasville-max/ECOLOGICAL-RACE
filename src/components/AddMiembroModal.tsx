import React, { useState, useRef } from 'react';
import { X, Upload, Users, Cpu, ShieldCheck, Database, Zap, FileImage } from 'lucide-react';
import { motion } from 'motion/react';
import { IntegranteEquipo } from '../types';
import { subirImagenAFirebase } from '../lib/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGuardarMiembro: (miembro: IntegranteEquipo) => Promise<void>;
}

export default function AddMiembroModal({ isOpen, onClose, onGuardarMiembro }: Props) {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cargo, setCargo] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [esAsesora, setEsAsesora] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

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
      const url = await subirImagenAFirebase(file, 'equipo');
      setFotoUrl(url);
    } catch (err: any) {
      console.error(err);
      setError('Error al subir la foto. Se guardará de respaldo local.');
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
    if (!nombreCompleto.trim() || !cargo.trim()) {
      setError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    try {
      const nuevoMiembro: IntegranteEquipo = {
        id: `miembro-${Date.now()}`,
        nombreCompleto: nombreCompleto.trim(),
        cargo: cargo.trim(),
        fotoUrl: fotoUrl || undefined,
        esAsesora: esAsesora,
      };

      await onGuardarMiembro(nuevoMiembro);
      onClose();
    } catch (err) {
      setError('Error al guardar el integrante. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-neutral-900 border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] w-full max-w-md overflow-hidden relative text-white"
        id="add-member-modal-scifi"
      >
        {/* Futuristic Grid & Visual Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-4 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-sm uppercase tracking-tight">ALTA DE NUEVO AGENTE</h3>
              <p className="text-[9px] font-mono text-emerald-400 uppercase font-black tracking-widest">AUTENTICACIÓN DE ADMINISTRADOR REQUERIDA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-emerald-950 border border-neutral-700 hover:border-emerald-500/40 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/30 rounded-xl text-xs text-red-300 font-mono font-bold flex items-center gap-2">
            <span>⚠️ ERROR DE TRANSMISIÓN:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Nombre Completo */}
          <div>
            <label className="block text-[9px] font-mono text-slate-450 uppercase mb-1 font-black tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              NOMBRE COMPLETO DEL AGENTE *
            </label>
            <input
              type="text"
              required
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej. Jordan Michel Vásquez"
              className="w-full text-xs p-3 bg-black/60 border border-neutral-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition font-sans font-bold text-white placeholder-slate-600"
            />
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-[9px] font-mono text-slate-450 uppercase mb-1 font-black tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              CARGO / FUNCIÓN OPERATIVA *
            </label>
            <input
              type="text"
              required
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ej. Delegado Ambiental, Diseñador, Tesorero"
              className="w-full text-xs p-3 bg-black/60 border border-neutral-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition font-sans font-bold text-white placeholder-slate-600"
            />
          </div>

          {/* Categoría / Clasificación */}
          <div>
            <label className="block text-[9px] font-mono text-slate-450 uppercase mb-1 font-black tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              CATEGORÍA DE INTEGRANTE *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEsAsesora(false)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold uppercase transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  !esAsesora
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-black/40 border-neutral-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Estudiante</span>
              </button>
              <button
                type="button"
                onClick={() => setEsAsesora(true)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold uppercase transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  esAsesora
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-black/40 border-neutral-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Asesora</span>
              </button>
            </div>
          </div>

          {/* Photo Upload with Drag & Drop and Click selection */}
          <div>
            <label className="block text-[9px] font-mono text-slate-450 uppercase mb-1 font-black tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              CAPTURA DE PERFIL BIOMÉTRICO (OPCIONAL)
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                isDragActive
                  ? 'border-emerald-400 bg-emerald-950/30'
                  : 'border-neutral-800 hover:border-emerald-500/40 bg-black/40 hover:bg-black/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {fotoUrl ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 bg-neutral-950 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    <img src={fotoUrl} alt="Preview foto" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="text-left text-[9px] font-mono">
                    <span className="text-emerald-400 font-bold block">✓ TRANSMISIÓN DE FOTO EXITOSA</span>
                    <span className="text-slate-500">Haz clic para recargar archivo</span>
                  </div>
                </div>
              ) : uploading ? (
                <div className="flex flex-col items-center space-y-2 py-2">
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-mono text-emerald-400">ENCRIPTANDO Y SUBIENDO ARCHIVO...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1.5 text-slate-500">
                  <Upload className="w-6 h-6 text-emerald-500/50 animate-bounce" style={{ animationDuration: '3s' }} />
                  <p className="text-[11px] font-medium text-slate-300">
                    Arrastra la foto o <span className="text-emerald-400 font-bold underline">búscala en local</span>
                  </p>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Optimización de imagen automática activa</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-500/20 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-neutral-800 rounded-xl transition cursor-pointer"
            >
              ABORTAR
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-mono font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition duration-300 cursor-pointer disabled:opacity-40"
            >
              REGISTRAR EN MATRIX
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
