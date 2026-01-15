// ============================================
// TIPOS PRINCIPALES - HANGAR SPRC
// ============================================

// Estado de un camión
export type EstadoCamion = 'operativo' | 'en_mantenimiento' | 'fuera_servicio';

// Tipo de trabajo
export type TipoTrabajo = 'preventivo' | 'correctivo';

// Ubicación del trabajo
export type UbicacionTipo = 'bahia' | 'fuera_bahia' | 'otro_departamento';

// Estado del trabajo
export type EstadoTrabajo = 
  | 'en_proceso' 
  | 'esperando_repuesto' 
  | 'esperando_contratista' 
  | 'en_pruebas' 
  | 'completado' 
  | 'suspendido';

// Estado final del camión después del trabajo
export type EstadoFinalCamion = 'operativo' | 'operativo_con_obs' | 'no_operativo';

// Sistemas afectados (para correctivos)
export type SistemaAfectado = 
  | 'hidraulico' 
  | 'electrico' 
  | 'motor' 
  | 'neumaticos' 
  | 'transmision' 
  | 'frenos'
  | 'direccion'
  | 'aire_acondicionado'
  | 'otro';

// Ejecutado por
export type EjecutadoPor = 'tecnico_interno' | 'contratista' | 'otro_departamento';

// Especialidad del técnico
export type EspecialidadTecnico = 'mecanico' | 'electrico' | 'multirol';

// Turno
export type Turno = 'dia' | 'noche';

// Departamentos externos
export type DepartamentoExterno = 'telecomunicaciones';

// Ubicaciones fuera de bahía
export type UbicacionFueraBahia = 'zona_pintura' | 'area_externa' | 'otro';

// Prioridad
export type Prioridad = 'normal' | 'alta' | 'urgente';

// Tipo de camión
export type TipoCamion = 'R' | 'K';

// Estado de ubicación en programación diaria
export type EstadoUbicacionProgramacion = 
  | 'pendiente' 
  | 'en_lavado' 
  | 'en_hangar' 
  | 'en_pintura' 
  | 'en_telecomunicaciones' 
  | 'completado'
  | 'cancelado';

// ============================================
// INTERFACES DE ENTIDADES
// ============================================

export interface Camion {
  id: string;
  numero: string; // R06, R07... R92, K01... K14
  tipo: TipoCamion;
  modelo: string;
  horometro_actual: number;
  estado: EstadoCamion;
  created_at: string;
  updated_at: string;
}

export interface Tecnico {
  id: string;
  nombre: string;
  especialidad: EspecialidadTecnico;
  turno: Turno;
  activo: boolean;
  created_at: string;
}

export interface Contratista {
  id: string;
  nombre: string;
  especialidad: string;
  contacto?: string;
  activo: boolean;
  created_at: string;
}

export interface TipoTrabajoConfig {
  id: string;
  nombre: string;
  categoria: 'preventivo' | 'correctivo';
  descripcion?: string;
  tiempo_estimado_default?: number;
  activo: boolean;
  created_at: string;
}

export interface TrabajoMantenimiento {
  id: string;
  camion_id: string;
  
  // Ubicación
  ubicacion_tipo: UbicacionTipo;
  bahia_numero?: number; // 1-7
  ubicacion_especifica?: string;
  
  // Tipo de trabajo
  tipo: TipoTrabajo;
  
  // Si es preventivo
  paquete_trabajo?: string[]; // IDs de tipos de trabajo
  
  // Si es correctivo
  descripcion_falla?: string;
  sistema_afectado?: SistemaAfectado;
  
  // Personal
  ejecutado_por: EjecutadoPor;
  tecnicos?: string[]; // IDs de técnicos
  contratista_id?: string;
  departamento_externo?: DepartamentoExterno;
  
  // Tiempos
  fecha_entrada: string;
  hora_entrada: string;
  fecha_salida?: string;
  hora_salida?: string;
  tiempo_estimado_horas: number;
  
  // Estado
  estado: EstadoTrabajo;
  progreso_estimado: number; // 0-100
  
  // Detalles
  horometro_entrada: number;
  horometro_salida?: number;
  repuestos_utilizados?: Repuesto[];
  observaciones_iniciales?: string;
  observaciones_finales?: string;
  estado_final_camion?: EstadoFinalCamion;
  
  // Metadata
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relaciones expandidas (para vistas)
  camion?: Camion;
  tecnicos_detalle?: Tecnico[];
  contratista?: Contratista;
}

export interface Repuesto {
  nombre: string;
  cantidad: number;
  unidad?: string;
}

export interface FotoTrabajo {
  id: string;
  trabajo_id: string;
  url: string;
  tipo: 'inicial' | 'proceso' | 'final';
  descripcion?: string;
  created_at: string;
}

export interface NotaTurno {
  id: string;
  fecha: string;
  turno: Turno;
  tecnico_id?: string;
  autor: string; // Nombre de quien escribe la nota
  nota: string;
  prioridad: Prioridad;
  leida: boolean;
  created_at: string;
  tecnico?: Tecnico;
}

// Programación diaria - Item programado
export interface ItemProgramacion {
  id: string;
  camion_id: string;
  fecha_programada: string; // YYYY-MM-DD
  tipo: TipoTrabajo;
  descripcion_trabajo: string; // Texto libre para describir el trabajo
  tecnicos_asignados: string[]; // IDs de técnicos
  contratista_id?: string;
  estado_ubicacion: EstadoUbicacionProgramacion;
  trabajo_id?: string; // Se llena cuando se crea el trabajo real
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// Programación del día
export interface ProgramacionDia {
  fecha: string;
  items: ItemProgramacion[];
  created_at: string;
}

// ============================================
// INTERFACES PARA FORMULARIOS
// ============================================

export interface NuevoTrabajoForm {
  camion_id: string;
  ubicacion_tipo: UbicacionTipo;
  bahia_numero?: number;
  ubicacion_especifica?: string;
  tipo: TipoTrabajo;
  paquete_trabajo?: string[];
  descripcion_falla?: string;
  sistema_afectado?: SistemaAfectado;
  ejecutado_por: EjecutadoPor;
  tecnicos?: string[];
  contratista_id?: string;
  departamento_externo?: DepartamentoExterno;
  tiempo_estimado_horas: number;
  horometro_entrada: number;
  observaciones_iniciales?: string;
}

export interface ActualizarTrabajoForm {
  estado: EstadoTrabajo;
  progreso_estimado: number;
  observacion?: string;
}

export interface CierreTrabajoForm {
  hora_salida: string;
  horometro_salida: number;
  repuestos_utilizados?: Repuesto[];
  observaciones_finales?: string;
  estado_final_camion: EstadoFinalCamion;
  trabajo_parcial?: boolean;
  tareas_pendientes?: string;
}

export interface NuevoTecnicoForm {
  nombre: string;
  especialidad: EspecialidadTecnico;
  turno: Turno;
}

export interface NuevoContratistaForm {
  nombre: string;
  especialidad: string;
  contacto?: string;
}

export interface NuevoTipoTrabajoForm {
  nombre: string;
  categoria: 'preventivo' | 'correctivo';
  descripcion?: string;
  tiempo_estimado_default?: number;
}

// ============================================
// INTERFACES PARA ESTADÍSTICAS
// ============================================

export interface EstadisticasDia {
  preventivos_completados: number;
  correctivos_atendidos: number;
  disponibilidad_actual: number;
  camiones_operativos: number;
  camiones_en_mantenimiento: number;
  total_camiones: number;
}

export interface ResumenSemanal {
  total_preventivos: number;
  total_correctivos: number;
  tiempo_promedio_preventivo: number;
  tiempo_promedio_correctivo: number;
  disponibilidad_promedio: number;
  trabajos_por_sistema: Record<string, number>;
  trabajos_por_contratista: Record<string, number>;
}

// ============================================
// CONSTANTES
// ============================================

export const BAHIAS = [1, 2, 3, 4, 5, 6, 7] as const;

export const UBICACIONES_FUERA_BAHIA: Record<UbicacionFueraBahia, string> = {
  zona_pintura: 'Zona de Pintura',
  area_externa: 'Área Externa',
  otro: 'Otro',
};

export const DEPARTAMENTOS_EXTERNOS: Record<DepartamentoExterno, string> = {
  telecomunicaciones: 'Telecomunicaciones',
};

export const SISTEMAS_AFECTADOS: Record<SistemaAfectado, string> = {
  hidraulico: 'Hidráulico',
  electrico: 'Eléctrico',
  motor: 'Motor',
  neumaticos: 'Neumáticos',
  transmision: 'Transmisión',
  frenos: 'Frenos',
  direccion: 'Dirección',
  aire_acondicionado: 'A/C',
  otro: 'Otro',
};

export const ESTADOS_TRABAJO: Record<EstadoTrabajo, string> = {
  en_proceso: 'En Proceso',
  esperando_repuesto: 'Esperando Repuesto',
  esperando_contratista: 'Esperando Contratista',
  en_pruebas: 'En Pruebas',
  completado: 'Completado',
  suspendido: 'Suspendido',
};

export const ESPECIALIDADES_TECNICO: Record<EspecialidadTecnico, string> = {
  mecanico: 'Mecánico',
  electrico: 'Eléctrico',
  multirol: 'Multirol',
};

export const TURNOS: Record<Turno, string> = {
  dia: 'Día',
  noche: 'Noche',
};

export const ESTADOS_UBICACION_PROGRAMACION: Record<EstadoUbicacionProgramacion, string> = {
  pendiente: 'Pendiente',
  en_lavado: 'En Lavado',
  en_hangar: 'En Hangar',
  en_pintura: 'En Pintura',
  en_telecomunicaciones: 'En Telecomunicaciones',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export const COLORES_ESTADO_UBICACION: Record<EstadoUbicacionProgramacion, string> = {
  pendiente: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  en_lavado: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  en_hangar: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  en_pintura: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  en_telecomunicaciones: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  completado: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelado: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export const TIEMPOS_ESTIMADOS = [
  { value: 0.5, label: '30 minutos' },
  { value: 1, label: '1 hora' },
  { value: 2, label: '2 horas' },
  { value: 4, label: '4 horas' },
  { value: 6, label: '6 horas' },
  { value: 8, label: '8 horas (1 día)' },
  { value: 16, label: '2 días' },
  { value: 24, label: '3 días' },
];

// Generar lista de camiones R06-R92 y K01-K14
export function generarCamiones(): Camion[] {
  const camiones: Camion[] = [];
  
  // Serie R: R06 a R92
  for (let i = 6; i <= 92; i++) {
    const num = String(i).padStart(2, '0');
    camiones.push({
      id: `camion-R${num}`,
      numero: `R${num}`,
      tipo: 'R',
      modelo: 'Kalmar Ottawa T2',
      horometro_actual: Math.floor(Math.random() * 15000) + 2000,
      estado: 'operativo',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    });
  }
  
  // Serie K: K01 a K14
  for (let i = 1; i <= 14; i++) {
    const num = String(i).padStart(2, '0');
    camiones.push({
      id: `camion-K${num}`,
      numero: `K${num}`,
      tipo: 'K',
      modelo: 'Kalmar Ottawa T2',
      horometro_actual: Math.floor(Math.random() * 15000) + 2000,
      estado: 'operativo',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    });
  }
  
  return camiones;
}

// Total de camiones: R06-R92 (87) + K01-K14 (14) = 101
export const TOTAL_CAMIONES = 101;
export const TOTAL_BAHIAS = 7;
