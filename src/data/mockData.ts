import { Institucion, Aula, RegistroSemanal, Comentario, IntegranteEquipo, HitoCronograma } from '../types';

export const INITIAL_INSTITUCIONES: Institucion[] = [
  {
    id: 'ie-82063',
    nombre: 'Institución Educativa Primaria N.° 82063',
    distrito: 'Jesús',
    provincia: 'Cajamarca',
    nivel: 'Primaria',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=120&h=120',
    slogan: 'Conciencia verde en el corazón de Jesús: COMPITE POR EL PLANETA.'
  },
  {
    id: 'ie-82064',
    nombre: 'Institución Educativa Primaria N.° 82064',
    distrito: 'Jesús',
    provincia: 'Cajamarca',
    nivel: 'Primaria',
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=120&h=120',
    slogan: 'Unidos por el cambio ecológico, sembrando educación para cosechar vida.'
  }
];

export const INITIAL_AULAS: Aula[] = [];

export const INITIAL_REGISTROS: RegistroSemanal[] = [];

export const INITIAL_COMENTARIOS: Comentario[] = [];

export const INITIAL_EQUIPO: IntegranteEquipo[] = [];

export const INITIAL_CRONOGRAMA: HitoCronograma[] = [
  {
    semana: 1,
    titulo: 'Permisos y Alianzas',
    descripcion: 'Establecimiento de convenios formales con las autoridades de la I.E.P. N.° 82063 y la I.E.P. N.° 82064 e inicio de la coordinación con agentes recicladores locales en Jesús, Cajamarca.',
    tipo: 'lanzamiento'
  },
  {
    semana: 2,
    titulo: 'Lanzamiento e Investidura',
    descripcion: 'Presentación oficial del concurso frente a la comunidad escolar de ambas instituciones. Investidura solemne de los delegados ambientales oficiales como "Race Collectors" de cada sección participante.',
    tipo: 'lanzamiento'
  },
  {
    semana: 4,
    titulo: 'Primera Actualización Oficial',
    descripcion: 'Corte de caja financiero preliminar y primer reporte en vivo del Bonus de Carbón. Sensibilización sobre el Fondo Común transparente generado.',
    tipo: 'hito'
  },
  {
    semana: 6,
    titulo: 'Primer Sorteo de Canasta Ecológica',
    descripcion: 'Sorteo de incentivo de canasta de alimentos saludables/útiles escolares entre las aulas que alcancen un puntaje mínimo de participación consecutiva.',
    tipo: 'sorteo'
  },
  {
    semana: 7,
    titulo: 'Sorteo Intermedio Especial',
    descripcion: 'Evaluación de las cartillas diarias de ecoeficiencia. Estímulo extra para las aulas que mantengan el multiplicador verde activo por más días.',
    tipo: 'sorteo'
  },
  {
    semana: 10,
    titulo: 'Segundo Sorteo de Canasta',
    descripcion: 'Sorteo de canasta escolar a mitad del periodo de recolección para incentivar el esfuerzo continuo durante el invierno.',
    tipo: 'sorteo'
  },
  {
    semana: 13,
    titulo: 'Tercer Sorteo de Canasta',
    descripcion: 'Último sorteo de estímulo grupal antes de ingresar a la recta final del concurso de reciclaje.',
    tipo: 'sorteo'
  },
  {
    semana: 17,
    titulo: 'Ceremonia de Clausura',
    descripcion: 'Gran ceremonia pública en las instituciones. Rendición de cuentas final sobre el Fondo Común recaudado, revelación del Aula Líder Ambiental ganadora, y entrega de los reconocimientos oficiales.',
    tipo: 'cierre'
  }
];
