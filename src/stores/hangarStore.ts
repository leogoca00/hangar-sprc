import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Camion,
  Tecnico,
  Contratista,
  TipoTrabajoConfig,
  TrabajoMantenimiento,
  NotaTurno,
  ItemProgramacion,
  EstadoTrabajo,
  EstadoUbicacionProgramacion,
  NuevoTrabajoForm,
  CierreTrabajoForm,
  NuevoTecnicoForm,
  NuevoContratistaForm,
  NuevoTipoTrabajoForm,
  TipoTrabajo,
  Turno,
} from '@/types';
import { generarCamiones } from '@/types';
import { getFechaActual, getHoraActual, getFechaManana } from '@/lib/utils';

// ============================================
// DATOS DE DEMOSTRACIÓN
// ============================================

const camionesDemo: Camion[] = generarCamiones();

const tecnicosDemo: Tecnico[] = [
  { id: 'tec-1', nombre: 'Juan Pérez', especialidad: 'mecanico', turno: 'dia', activo: true, created_at: '2024-01-01' },
  { id: 'tec-2', nombre: 'Carlos Montoya', especialidad: 'mecanico', turno: 'dia', activo: true, created_at: '2024-01-01' },
  { id: 'tec-3', nombre: 'Miguel Ramírez', especialidad: 'mecanico', turno: 'dia', activo: true, created_at: '2024-01-01' },
  { id: 'tec-4', nombre: 'Andrés López', especialidad: 'mecanico', turno: 'dia', activo: true, created_at: '2024-01-01' },
  { id: 'tec-5', nombre: 'Roberto Díaz', especialidad: 'electrico', turno: 'dia', activo: true, created_at: '2024-01-01' },
  { id: 'tec-6', nombre: 'Fernando Castro', especialidad: 'electrico', turno: 'dia', activo: true, created_at: '2024-01-01' },
  { id: 'tec-7', nombre: 'Pedro Martínez', especialidad: 'multirol', turno: 'noche', activo: true, created_at: '2024-01-01' },
];

const contratistasDemo: Contratista[] = [
  { id: 'cont-1', nombre: 'Pinturas Industriales S.A.', especialidad: 'Pintura y acabados', contacto: '300-555-0101', activo: true, created_at: '2024-01-01' },
  { id: 'cont-2', nombre: 'Taller Diesel López', especialidad: 'Motor y transmisión', contacto: '300-555-0102', activo: true, created_at: '2024-01-01' },
  { id: 'cont-3', nombre: 'Hidráulicos del Caribe', especialidad: 'Sistemas hidráulicos', contacto: '300-555-0103', activo: true, created_at: '2024-01-01' },
  { id: 'cont-4', nombre: 'Servicios Eléctricos JM', especialidad: 'Sistemas eléctricos', contacto: '300-555-0104', activo: true, created_at: '2024-01-01' },
];

const tiposTrabajoDemo: TipoTrabajoConfig[] = [
  { id: 'tipo-1', nombre: 'Cambio aceite motor (500h)', categoria: 'preventivo', tiempo_estimado_default: 2, activo: true, created_at: '2024-01-01' },
  { id: 'tipo-2', nombre: 'Cambio filtros (aceite, aire, comb.)', categoria: 'preventivo', tiempo_estimado_default: 1.5, activo: true, created_at: '2024-01-01' },
  { id: 'tipo-3', nombre: 'Servicio 6K horas', categoria: 'preventivo', tiempo_estimado_default: 8, activo: true, created_at: '2024-01-01' },
  { id: 'tipo-4', nombre: 'Servicio 12K horas', categoria: 'preventivo', tiempo_estimado_default: 16, activo: true, created_at: '2024-01-01' },
  { id: 'tipo-5', nombre: 'Inspección neumáticos', categoria: 'preventivo', tiempo_estimado_default: 1, activo: true, created_at: '2024-01-01' },
  { id: 'tipo-6', nombre: 'Revisión sistema hidráulico', categoria: 'preventivo', tiempo_estimado_default: 4, activo: true, created_at: '2024-01-01' },
  { id: 'tipo-7', nombre: 'Revisión sistema de frenos', categoria: 'preventivo', tiempo_estimado_default: 3, activo: true, created_at: '2024-01-01' },
  { id: 'tipo-8', nombre: 'Revisión sistema eléctrico', categoria: 'preventivo', tiempo_estimado_default: 2, activo: true, created_at: '2024-01-01' },
];

const trabajosDemo: TrabajoMantenimiento[] = [];

const notasDemo: NotaTurno[] = [];

const programacionDemo: ItemProgramacion[] = [];

// ============================================
// INTERFACE DEL STORE
// ============================================

interface HangarState {
  // Datos
  camiones: Camion[];
  tecnicos: Tecnico[];
  contratistas: Contratista[];
  tiposTrabajo: TipoTrabajoConfig[];
  trabajos: TrabajoMantenimiento[];
  notas: NotaTurno[];
  programacion: ItemProgramacion[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  filtroTipo: 'todos' | 'preventivo' | 'correctivo';
  filtroUbicacion: 'todos' | 'bahia' | 'fuera_bahia' | 'otro_departamento';
  busqueda: string;
  modalNuevoTrabajo: boolean;
  modalDetalleTrabajo: string | null;
  modalConfiguracion: boolean;
  vistaActual: 'hangar' | 'programacion' | 'timeline' | 'notas';
  fechaProgramacion: string; // Fecha seleccionada para ver/editar programación
  
  // Computed
  trabajosActivos: () => TrabajoMantenimiento[];
  bahiasOcupadas: () => number[];
  disponibilidad: () => { operativos: number; enMantenimiento: number; porcentaje: number };
  camionesDisponibles: () => Camion[];
  getProgramacionPorFecha: (fecha: string) => ItemProgramacion[];
  getNotasPorFecha: (fecha: string) => NotaTurno[];
  getEstadisticasProgramacion: (fecha: string) => { total: number; completados: number; pendientes: number; enProceso: number };
  
  // Actions - UI
  setFiltroTipo: (filtro: 'todos' | 'preventivo' | 'correctivo') => void;
  setFiltroUbicacion: (filtro: 'todos' | 'bahia' | 'fuera_bahia' | 'otro_departamento') => void;
  setBusqueda: (busqueda: string) => void;
  setModalNuevoTrabajo: (open: boolean) => void;
  setModalDetalleTrabajo: (id: string | null) => void;
  setModalConfiguracion: (open: boolean) => void;
  setVistaActual: (vista: 'hangar' | 'programacion' | 'timeline' | 'notas') => void;
  setFechaProgramacion: (fecha: string) => void;
  
  // CRUD - Trabajos
  agregarTrabajo: (trabajo: NuevoTrabajoForm) => TrabajoMantenimiento;
  agregarTrabajoDesdeProgram: (itemId: string, bahia?: number) => TrabajoMantenimiento | null;
  actualizarEstadoTrabajo: (id: string, estado: EstadoTrabajo, progreso: number, observacion?: string) => void;
  cerrarTrabajo: (id: string, datos: CierreTrabajoForm) => void;
  
  // CRUD - Programación
  agregarItemProgramacion: (item: Omit<ItemProgramacion, 'id' | 'created_at' | 'updated_at' | 'estado_ubicacion'>) => void;
  actualizarItemProgramacion: (id: string, datos: Partial<ItemProgramacion>) => void;
  actualizarUbicacionItem: (id: string, ubicacion: EstadoUbicacionProgramacion) => void;
  eliminarItemProgramacion: (id: string) => void;
  moverItemASiguienteDia: (id: string) => void;
  
  // CRUD - Técnicos
  agregarTecnico: (tecnico: NuevoTecnicoForm) => void;
  actualizarTecnico: (id: string, datos: Partial<Tecnico>) => void;
  toggleTecnicoActivo: (id: string) => void;
  eliminarTecnico: (id: string) => void;
  
  // CRUD - Contratistas
  agregarContratista: (contratista: NuevoContratistaForm) => void;
  actualizarContratista: (id: string, datos: Partial<Contratista>) => void;
  toggleContratistaActivo: (id: string) => void;
  eliminarContratista: (id: string) => void;
  
  // CRUD - Tipos de Trabajo
  agregarTipoTrabajo: (tipo: NuevoTipoTrabajoForm) => void;
  actualizarTipoTrabajo: (id: string, datos: Partial<TipoTrabajoConfig>) => void;
  toggleTipoTrabajoActivo: (id: string) => void;
  eliminarTipoTrabajo: (id: string) => void;
  
  // CRUD - Notas de Turno
  agregarNota: (nota: Omit<NotaTurno, 'id' | 'created_at' | 'leida'>) => void;
  marcarNotaLeida: (id: string) => void;
  eliminarNota: (id: string) => void;
  
  // Helpers
  getCamionById: (id: string) => Camion | undefined;
  getTecnicoById: (id: string) => Tecnico | undefined;
  getContratistaById: (id: string) => Contratista | undefined;
  getTipoTrabajoById: (id: string) => TipoTrabajoConfig | undefined;
  getTrabajoById: (id: string) => TrabajoMantenimiento | undefined;
  getItemProgramacionById: (id: string) => ItemProgramacion | undefined;
}

// ============================================
// STORE
// ============================================

export const useHangarStore = create<HangarState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial Data
        camiones: camionesDemo,
        tecnicos: tecnicosDemo,
        contratistas: contratistasDemo,
        tiposTrabajo: tiposTrabajoDemo,
        trabajos: trabajosDemo,
        notas: notasDemo,
        programacion: programacionDemo,
        
        // UI State
        isLoading: false,
        error: null,
        filtroTipo: 'todos',
        filtroUbicacion: 'todos',
        busqueda: '',
        modalNuevoTrabajo: false,
        modalDetalleTrabajo: null,
        modalConfiguracion: false,
        vistaActual: 'hangar',
        fechaProgramacion: getFechaManana(),
        
        // Computed
        trabajosActivos: () => {
          const { trabajos, filtroTipo, filtroUbicacion, busqueda, camiones } = get();
          const hoy = getFechaActual();
          
          return trabajos
            .filter(t => t.estado !== 'completado' && t.fecha_entrada === hoy)
            .filter(t => filtroTipo === 'todos' || t.tipo === filtroTipo)
            .filter(t => filtroUbicacion === 'todos' || t.ubicacion_tipo === filtroUbicacion)
            .filter(t => {
              if (!busqueda) return true;
              const camion = camiones.find(c => c.id === t.camion_id);
              return camion?.numero.toLowerCase().includes(busqueda.toLowerCase());
            });
        },
        
        bahiasOcupadas: () => {
          const { trabajos } = get();
          const hoy = getFechaActual();
          return trabajos
            .filter(t => t.estado !== 'completado' && t.fecha_entrada === hoy && t.ubicacion_tipo === 'bahia')
            .map(t => t.bahia_numero!)
            .filter(Boolean);
        },
        
        disponibilidad: () => {
          const { trabajos, camiones } = get();
          const hoy = getFechaActual();
          const enMantenimiento = new Set(
            trabajos
              .filter(t => t.estado !== 'completado' && t.fecha_entrada === hoy)
              .map(t => t.camion_id)
          ).size;
          
          const total = camiones.length;
          const operativos = total - enMantenimiento;
          const porcentaje = Math.round((operativos / total) * 1000) / 10;
          
          return { operativos, enMantenimiento, porcentaje };
        },
        
        camionesDisponibles: () => {
          const { camiones, trabajos } = get();
          const hoy = getFechaActual();
          const enMantenimientoIds = new Set(
            trabajos
              .filter(t => t.estado !== 'completado' && t.fecha_entrada === hoy)
              .map(t => t.camion_id)
          );
          return camiones.filter(c => c.estado === 'operativo' && !enMantenimientoIds.has(c.id));
        },
        
        getProgramacionPorFecha: (fecha: string) => {
          return get().programacion.filter(p => p.fecha_programada === fecha);
        },
        
        getNotasPorFecha: (fecha: string) => {
          return get().notas.filter(n => n.fecha === fecha).sort((a, b) => {
            const prioridadOrden = { urgente: 0, alta: 1, normal: 2 };
            return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
          });
        },
        
        getEstadisticasProgramacion: (fecha: string) => {
          const items = get().programacion.filter(p => p.fecha_programada === fecha);
          return {
            total: items.length,
            completados: items.filter(i => i.estado_ubicacion === 'completado').length,
            pendientes: items.filter(i => i.estado_ubicacion === 'pendiente').length,
            enProceso: items.filter(i => !['pendiente', 'completado', 'cancelado'].includes(i.estado_ubicacion)).length,
          };
        },
        
        // Setters UI
        setFiltroTipo: (filtro) => set({ filtroTipo: filtro }),
        setFiltroUbicacion: (filtro) => set({ filtroUbicacion: filtro }),
        setBusqueda: (busqueda) => set({ busqueda }),
        setModalNuevoTrabajo: (open) => set({ modalNuevoTrabajo: open }),
        setModalDetalleTrabajo: (id) => set({ modalDetalleTrabajo: id }),
        setModalConfiguracion: (open) => set({ modalConfiguracion: open }),
        setVistaActual: (vista) => set({ vistaActual: vista }),
        setFechaProgramacion: (fecha) => set({ fechaProgramacion: fecha }),
        
        // CRUD - Trabajos
        agregarTrabajo: (form) => {
          const nuevoTrabajo: TrabajoMantenimiento = {
            ...form,
            id: `trab-${Date.now()}`,
            fecha_entrada: getFechaActual(),
            hora_entrada: getHoraActual(),
            estado: 'en_proceso',
            progreso_estimado: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set(state => ({
            trabajos: [...state.trabajos, nuevoTrabajo],
            camiones: state.camiones.map(c =>
              c.id === form.camion_id ? { ...c, estado: 'en_mantenimiento' as const } : c
            ),
            modalNuevoTrabajo: false,
          }));
          
          return nuevoTrabajo;
        },
        
        agregarTrabajoDesdeProgram: (itemId: string, bahia?: number) => {
          const item = get().programacion.find(p => p.id === itemId);
          if (!item) return null;
          
          const camion = get().camiones.find(c => c.id === item.camion_id);
          if (!camion) return null;
          
          const nuevoTrabajo: TrabajoMantenimiento = {
            id: `trab-${Date.now()}`,
            camion_id: item.camion_id,
            ubicacion_tipo: bahia ? 'bahia' : 'fuera_bahia',
            bahia_numero: bahia,
            tipo: item.tipo,
            descripcion_falla: item.tipo === 'correctivo' ? item.descripcion_trabajo : undefined,
            paquete_trabajo: item.tipo === 'preventivo' ? [item.descripcion_trabajo] : undefined,
            ejecutado_por: item.tecnicos_asignados.length > 0 ? 'tecnico_interno' : (item.contratista_id ? 'contratista' : 'tecnico_interno'),
            tecnicos: item.tecnicos_asignados,
            contratista_id: item.contratista_id,
            fecha_entrada: getFechaActual(),
            hora_entrada: getHoraActual(),
            tiempo_estimado_horas: 4,
            estado: 'en_proceso',
            progreso_estimado: 0,
            horometro_entrada: camion.horometro_actual,
            observaciones_iniciales: item.observaciones,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set(state => ({
            trabajos: [...state.trabajos, nuevoTrabajo],
            camiones: state.camiones.map(c =>
              c.id === item.camion_id ? { ...c, estado: 'en_mantenimiento' as const } : c
            ),
            programacion: state.programacion.map(p =>
              p.id === itemId ? { ...p, trabajo_id: nuevoTrabajo.id, estado_ubicacion: 'en_hangar' as const } : p
            ),
          }));
          
          return nuevoTrabajo;
        },
        
        actualizarEstadoTrabajo: (id, estado, progreso, observacion) => {
          set(state => ({
            trabajos: state.trabajos.map(t =>
              t.id === id
                ? {
                    ...t,
                    estado,
                    progreso_estimado: progreso,
                    observaciones_finales: observacion
                      ? `${t.observaciones_finales || ''}\n[${getHoraActual()}] ${observacion}`.trim()
                      : t.observaciones_finales,
                    updated_at: new Date().toISOString(),
                  }
                : t
            ),
          }));
        },
        
        cerrarTrabajo: (id, datos) => {
          const trabajo = get().trabajos.find(t => t.id === id);
          if (!trabajo) return;
          
          set(state => ({
            trabajos: state.trabajos.map(t =>
              t.id === id
                ? {
                    ...t,
                    estado: 'completado' as const,
                    progreso_estimado: 100,
                    fecha_salida: getFechaActual(),
                    hora_salida: datos.hora_salida,
                    horometro_salida: datos.horometro_salida,
                    repuestos_utilizados: datos.repuestos_utilizados,
                    observaciones_finales: datos.observaciones_finales,
                    estado_final_camion: datos.estado_final_camion,
                    updated_at: new Date().toISOString(),
                  }
                : t
            ),
            camiones: state.camiones.map(c =>
              c.id === trabajo.camion_id
                ? {
                    ...c,
                    estado: datos.estado_final_camion === 'no_operativo' ? 'fuera_servicio' as const : 'operativo' as const,
                    horometro_actual: datos.horometro_salida,
                  }
                : c
            ),
            programacion: state.programacion.map(p =>
              p.trabajo_id === id ? { ...p, estado_ubicacion: 'completado' as const } : p
            ),
          }));
        },
        
        // CRUD - Programación
        agregarItemProgramacion: (item) => {
          const nuevo: ItemProgramacion = {
            ...item,
            id: `prog-${Date.now()}`,
            estado_ubicacion: 'pendiente',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          set(state => ({ programacion: [...state.programacion, nuevo] }));
        },
        
        actualizarItemProgramacion: (id, datos) => {
          set(state => ({
            programacion: state.programacion.map(p =>
              p.id === id ? { ...p, ...datos, updated_at: new Date().toISOString() } : p
            ),
          }));
        },
        
        actualizarUbicacionItem: (id, ubicacion) => {
          set(state => ({
            programacion: state.programacion.map(p =>
              p.id === id ? { ...p, estado_ubicacion: ubicacion, updated_at: new Date().toISOString() } : p
            ),
          }));
        },
        
        eliminarItemProgramacion: (id) => {
          set(state => ({
            programacion: state.programacion.filter(p => p.id !== id),
          }));
        },
        
        moverItemASiguienteDia: (id) => {
          const item = get().programacion.find(p => p.id === id);
          if (!item) return;
          
          const fechaActual = new Date(item.fecha_programada);
          fechaActual.setDate(fechaActual.getDate() + 1);
          const nuevaFecha = fechaActual.toISOString().split('T')[0];
          
          set(state => ({
            programacion: state.programacion.map(p =>
              p.id === id 
                ? { ...p, fecha_programada: nuevaFecha, estado_ubicacion: 'pendiente' as const, updated_at: new Date().toISOString() } 
                : p
            ),
          }));
        },
        
        // CRUD - Técnicos
        agregarTecnico: (tecnico) => {
          const nuevo: Tecnico = {
            ...tecnico,
            id: `tec-${Date.now()}`,
            activo: true,
            created_at: new Date().toISOString(),
          };
          set(state => ({ tecnicos: [...state.tecnicos, nuevo] }));
        },
        
        actualizarTecnico: (id, datos) => {
          set(state => ({
            tecnicos: state.tecnicos.map(t =>
              t.id === id ? { ...t, ...datos } : t
            ),
          }));
        },
        
        toggleTecnicoActivo: (id) => {
          set(state => ({
            tecnicos: state.tecnicos.map(t =>
              t.id === id ? { ...t, activo: !t.activo } : t
            ),
          }));
        },
        
        eliminarTecnico: (id) => {
          set(state => ({
            tecnicos: state.tecnicos.filter(t => t.id !== id),
          }));
        },
        
        // CRUD - Contratistas
        agregarContratista: (contratista) => {
          const nuevo: Contratista = {
            ...contratista,
            id: `cont-${Date.now()}`,
            activo: true,
            created_at: new Date().toISOString(),
          };
          set(state => ({ contratistas: [...state.contratistas, nuevo] }));
        },
        
        actualizarContratista: (id, datos) => {
          set(state => ({
            contratistas: state.contratistas.map(c =>
              c.id === id ? { ...c, ...datos } : c
            ),
          }));
        },
        
        toggleContratistaActivo: (id) => {
          set(state => ({
            contratistas: state.contratistas.map(c =>
              c.id === id ? { ...c, activo: !c.activo } : c
            ),
          }));
        },
        
        eliminarContratista: (id) => {
          set(state => ({
            contratistas: state.contratistas.filter(c => c.id !== id),
          }));
        },
        
        // CRUD - Tipos de Trabajo
        agregarTipoTrabajo: (tipo) => {
          const nuevo: TipoTrabajoConfig = {
            ...tipo,
            id: `tipo-${Date.now()}`,
            activo: true,
            created_at: new Date().toISOString(),
          };
          set(state => ({ tiposTrabajo: [...state.tiposTrabajo, nuevo] }));
        },
        
        actualizarTipoTrabajo: (id, datos) => {
          set(state => ({
            tiposTrabajo: state.tiposTrabajo.map(t =>
              t.id === id ? { ...t, ...datos } : t
            ),
          }));
        },
        
        toggleTipoTrabajoActivo: (id) => {
          set(state => ({
            tiposTrabajo: state.tiposTrabajo.map(t =>
              t.id === id ? { ...t, activo: !t.activo } : t
            ),
          }));
        },
        
        eliminarTipoTrabajo: (id) => {
          set(state => ({
            tiposTrabajo: state.tiposTrabajo.filter(t => t.id !== id),
          }));
        },
        
        // CRUD - Notas de Turno
        agregarNota: (nota) => {
          const nueva: NotaTurno = {
            ...nota,
            id: `nota-${Date.now()}`,
            leida: false,
            created_at: new Date().toISOString(),
          };
          set(state => ({ notas: [...state.notas, nueva] }));
        },
        
        marcarNotaLeida: (id) => {
          set(state => ({
            notas: state.notas.map(n =>
              n.id === id ? { ...n, leida: true } : n
            ),
          }));
        },
        
        eliminarNota: (id) => {
          set(state => ({
            notas: state.notas.filter(n => n.id !== id),
          }));
        },
        
        // Helpers
        getCamionById: (id) => get().camiones.find(c => c.id === id),
        getTecnicoById: (id) => get().tecnicos.find(t => t.id === id),
        getContratistaById: (id) => get().contratistas.find(c => c.id === id),
        getTipoTrabajoById: (id) => get().tiposTrabajo.find(t => t.id === id),
        getTrabajoById: (id) => get().trabajos.find(t => t.id === id),
        getItemProgramacionById: (id) => get().programacion.find(p => p.id === id),
      }),
      {
        name: 'hangar-sprc-storage',
        partialize: (state) => ({
          tecnicos: state.tecnicos,
          contratistas: state.contratistas,
          tiposTrabajo: state.tiposTrabajo,
          trabajos: state.trabajos,
          notas: state.notas,
          programacion: state.programacion,
        }),
      }
    ),
    { name: 'hangar-sprc' }
  )
);
