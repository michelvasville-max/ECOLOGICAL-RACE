export interface Institucion {
  id: string;
  nombre: string;
  distrito: string;
  provincia: string;
  nivel: string;
  aulasCount?: number;
  logoUrl?: string;
  slogan?: string;
  metaCO2?: number;
}

export interface Aula {
  id: string;
  institucionId: string;
  nombre: string; // e.g. "3° A", "4° B"
  raceCollector: string; // Student representative
  logoUrl?: string;
  slogan?: string;
}

export interface RegistroSemanal {
  id: string;
  aulaId: string;
  semana: number; // 1 to 17
  fecha: string; // YYYY-MM-DD
  kgPlastico: number;
  kgAluminio: number;
  kgPapel: number;
  multiplicadorVerde: boolean; // +20%
  montoVentaSoles: number;
  ticketVentaUrl?: string; // photo of receipt
  fotoEvidenciaUrl?: string; // eco-activity photo (no kids' faces)
  descripcionEvidencia?: string;
}

export interface Comentario {
  id: string;
  referenciaId: string; // semana number or 'general'
  referenciaTipo: 'acta' | 'resumen';
  autor: string;
  texto: string;
  fecha: string;
  estado: 'pendiente' | 'aprobado';
}

export interface IntegranteEquipo {
  id: string;
  nombreCompleto: string;
  cargo: string;
  fotoUrl?: string;
  esAsesora?: boolean;
}

export interface HitoCronograma {
  semana: number;
  titulo: string;
  descripcion: string;
  tipo: 'hito' | 'sorteo' | 'cierre' | 'lanzamiento';
}

export type RolUsuario = 'ADMIN' | 'VISITANTE';
