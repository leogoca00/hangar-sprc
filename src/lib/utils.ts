import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import type { EstadoTrabajo, TipoTrabajo } from '@/types';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateo de fechas
export function formatFecha(fecha: string): string {
  return format(parseISO(fecha), "EEEE d 'de' MMMM, yyyy", { locale: es });
}

export function formatFechaCorta(fecha: string): string {
  return format(parseISO(fecha), 'dd/MM/yyyy', { locale: es });
}

export function formatHora(hora: string): string {
  return hora.slice(0, 5); // "08:30:00" -> "08:30"
}

export function formatTiempoTranscurrido(fechaHora: string): string {
  return formatDistanceToNow(parseISO(fechaHora), { locale: es, addSuffix: true });
}

export function calcularHorasTranscurridas(fechaEntrada: string, horaEntrada: string): number {
  const inicio = parseISO(`${fechaEntrada}T${horaEntrada}`);
  return differenceInHours(new Date(), inicio);
}

// Formateo de horómetro
export function formatHorometro(horas: number): string {
  return `${horas.toLocaleString('es-CO')} hrs`;
}

// Porcentaje de progreso
export function getProgressColor(progreso: number): string {
  if (progreso >= 80) return 'bg-emerald-500';
  if (progreso >= 50) return 'bg-amber-500';
  return 'bg-blue-500';
}

// Color por estado de trabajo
export function getEstadoColor(estado: EstadoTrabajo): string {
  const colores: Record<EstadoTrabajo, string> = {
    en_proceso: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    esperando_repuesto: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    esperando_contratista: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    en_pruebas: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    completado: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    suspendido: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return colores[estado];
}

// Color por tipo de trabajo
export function getTipoColor(tipo: TipoTrabajo): string {
  return tipo === 'preventivo'
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    : 'bg-orange-500/20 text-orange-300 border-orange-500/30';
}

// Generar lista de camiones (TT-001 hasta TT-082)
export function generarListaCamiones(): { numero: string; id: string }[] {
  return Array.from({ length: 82 }, (_, i) => {
    const num = String(i + 1).padStart(3, '0');
    return {
      numero: `TT-${num}`,
      id: `camion-${num}`,
    };
  });
}

// Calcular disponibilidad
export function calcularDisponibilidad(
  total: number,
  enMantenimiento: number
): { operativos: number; porcentaje: number } {
  const operativos = total - enMantenimiento;
  const porcentaje = Math.round((operativos / total) * 100 * 10) / 10;
  return { operativos, porcentaje };
}

// Verificar si el trabajo está retrasado
export function estaRetrasado(
  fechaEntrada: string,
  horaEntrada: string,
  tiempoEstimado: number
): boolean {
  const horasTranscurridas = calcularHorasTranscurridas(fechaEntrada, horaEntrada);
  return horasTranscurridas > tiempoEstimado * 1.5;
}

// Formatear duración en horas y minutos
export function formatDuracion(horas: number): string {
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// Obtener hora actual en formato HH:MM
export function getHoraActual(): string {
  return format(new Date(), 'HH:mm');
}

// Obtener fecha actual en formato YYYY-MM-DD
export function getFechaActual(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// Obtener fecha de mañana en formato YYYY-MM-DD
export function getFechaManana(): string {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  return format(manana, 'yyyy-MM-dd');
}

// Obtener fecha de ayer en formato YYYY-MM-DD
export function getFechaAyer(): string {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  return format(ayer, 'yyyy-MM-dd');
}

// Capitalizar primera letra
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncar texto
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
