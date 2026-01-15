import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
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
} from '@/types';
import { getFechaActual, getHoraActual, getFechaManana } from '@/lib/utils';

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
  
  // Estado de conexión
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  
  // UI State
  filtroTipo: 'todos' | 'preventivo' | 'correctivo';
  filtroUbicacion: 'todos' | 'bahia' | 'fuera_bahia' | 'otro_departamento';
  busqueda: string;
  modalNuevoTrabajo: boolean;
  modalDetalleTrabajo: string | null;
  modalConfiguracion: boolean;
  vistaActual: 'hangar' | 'programacion' | 'timeline' | 'notas';
  fechaProgramacion: string;
  
  // Inicialización
  inicializar: () => Promise<void>;
  suscribirseATiempoReal: () => void;
  
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
  agregarTrabajo: (trabajo: NuevoTrabajoForm) => Promise<TrabajoMantenimiento | null>;
  agregarTrabajoDesdeProgram: (itemId: string, bahia?: number) => Promise<TrabajoMantenimiento | null>;
  actualizarEstadoTrabajo: (id: string, estado: EstadoTrabajo, progreso: number, observacion?: string) => Promise<void>;
  cerrarTrabajo: (id: string, datos: CierreTrabajoForm) => Promise<void>;
  
  // CRUD - Programación
  agregarItemProgramacion: (item: Omit<ItemProgramacion, 'id' | 'created_at' | 'updated_at' | 'estado_ubicacion'>) => Promise<void>;
  actualizarUbicacionItem: (id: string, ubicacion: EstadoUbicacionProgramacion) => Promise<void>;
  eliminarItemProgramacion: (id: string) => Promise<void>;
  moverItemASiguienteDia: (id: string) => Promise<void>;
  
  // CRUD - Técnicos
  agregarTecnico: (tecnico: NuevoTecnicoForm) => Promise<void>;
  toggleTecnicoActivo: (id: string) => Promise<void>;
  eliminarTecnico: (id: string) => Promise<void>;
  
  // CRUD - Contratistas
  agregarContratista: (contratista: NuevoContratistaForm) => Promise<void>;
  toggleContratistaActivo: (id: string) => Promise<void>;
  eliminarContratista: (id: string) => Promise<void>;
  
  // CRUD - Tipos de Trabajo
  agregarTipoTrabajo: (tipo: NuevoTipoTrabajoForm) => Promise<void>;
  toggleTipoTrabajoActivo: (id: string) => Promise<void>;
  eliminarTipoTrabajo: (id: string) => Promise<void>;
  
  // CRUD - Notas de Turno
  agregarNota: (nota: Omit<NotaTurno, 'id' | 'created_at' | 'leida'>) => Promise<void>;
  marcarNotaLeida: (id: string) => Promise<void>;
  eliminarNota: (id: string) => Promise<void>;
  
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
    (set, get) => ({
      // Initial Data
      camiones: [],
      tecnicos: [],
      contratistas: [],
      tiposTrabajo: [],
      trabajos: [],
      notas: [],
      programacion: [],
      
      // Estado
      isLoading: true,
      isConnected: false,
      error: null,
      
      // UI State
      filtroTipo: 'todos',
      filtroUbicacion: 'todos',
      busqueda: '',
      modalNuevoTrabajo: false,
      modalDetalleTrabajo: null,
      modalConfiguracion: false,
      vistaActual: 'hangar',
      fechaProgramacion: getFechaManana(),
      
      // ==========================================
      // INICIALIZACIÓN Y TIEMPO REAL
      // ==========================================
      
      inicializar: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const [
            camionesRes,
            tecnicosRes,
            contratistasRes,
            tiposTrabajoRes,
            trabajosRes,
            notasRes,
            programacionRes,
          ] = await Promise.all([
            supabase.from('camiones').select('*').order('numero'),
            supabase.from('tecnicos').select('*').order('nombre'),
            supabase.from('contratistas').select('*').order('nombre'),
            supabase.from('tipos_trabajo').select('*').order('nombre'),
            supabase.from('trabajos').select('*').order('created_at', { ascending: false }),
            supabase.from('notas_turno').select('*').order('created_at', { ascending: false }),
            supabase.from('programacion').select('*').order('created_at', { ascending: false }),
          ]);
          
          if (camionesRes.error) throw camionesRes.error;
          if (tecnicosRes.error) throw tecnicosRes.error;
          if (contratistasRes.error) throw contratistasRes.error;
          if (tiposTrabajoRes.error) throw tiposTrabajoRes.error;
          if (trabajosRes.error) throw trabajosRes.error;
          if (notasRes.error) throw notasRes.error;
          if (programacionRes.error) throw programacionRes.error;
          
          // Cargar técnicos asignados a trabajos
          const trabajosConTecnicos = await Promise.all(
            (trabajosRes.data || []).map(async (trabajo) => {
              const { data: tecnicosData } = await supabase
                .from('trabajo_tecnicos')
                .select('tecnico_id')
                .eq('trabajo_id', trabajo.id);
              return {
                ...trabajo,
                tecnicos: tecnicosData?.map(t => t.tecnico_id) || [],
              };
            })
          );
          
          // Cargar técnicos asignados a programación
          const programacionConTecnicos = await Promise.all(
            (programacionRes.data || []).map(async (item) => {
              const { data: tecnicosData } = await supabase
                .from('programacion_tecnicos')
                .select('tecnico_id')
                .eq('programacion_id', item.id);
              return {
                ...item,
                tecnicos_asignados: tecnicosData?.map(t => t.tecnico_id) || [],
              };
            })
          );
          
          set({
            camiones: camionesRes.data || [],
            tecnicos: tecnicosRes.data || [],
            contratistas: contratistasRes.data || [],
            tiposTrabajo: tiposTrabajoRes.data || [],
            trabajos: trabajosConTecnicos,
            notas: notasRes.data || [],
            programacion: programacionConTecnicos,
            isLoading: false,
            isConnected: true,
          });
          
          get().suscribirseATiempoReal();
          
        } catch (error: any) {
          console.error('Error inicializando:', error);
          set({ 
            isLoading: false, 
            isConnected: false,
            error: error.message || 'Error conectando con la base de datos'
          });
        }
      },
      
      suscribirseATiempoReal: () => {
        // Trabajos
        supabase
          .channel('trabajos-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trabajos' }, async () => {
            const { data } = await supabase.from('trabajos').select('*').order('created_at', { ascending: false });
            if (data) {
              const trabajosConTecnicos = await Promise.all(
                data.map(async (trabajo) => {
                  const { data: tecnicosData } = await supabase
                    .from('trabajo_tecnicos')
                    .select('tecnico_id')
                    .eq('trabajo_id', trabajo.id);
                  return { ...trabajo, tecnicos: tecnicosData?.map(t => t.tecnico_id) || [] };
                })
              );
              set({ trabajos: trabajosConTecnicos });
            }
          })
          .subscribe();
        
        // Programación
        supabase
          .channel('programacion-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'programacion' }, async () => {
            const { data } = await supabase.from('programacion').select('*').order('created_at', { ascending: false });
            if (data) {
              const programacionConTecnicos = await Promise.all(
                data.map(async (item) => {
                  const { data: tecnicosData } = await supabase
                    .from('programacion_tecnicos')
                    .select('tecnico_id')
                    .eq('programacion_id', item.id);
                  return { ...item, tecnicos_asignados: tecnicosData?.map(t => t.tecnico_id) || [] };
                })
              );
              set({ programacion: programacionConTecnicos });
            }
          })
          .subscribe();
        
        // Notas
        supabase
          .channel('notas-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notas_turno' }, async () => {
            const { data } = await supabase.from('notas_turno').select('*').order('created_at', { ascending: false });
            if (data) set({ notas: data });
          })
          .subscribe();
        
        // Camiones
        supabase
          .channel('camiones-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'camiones' }, async () => {
            const { data } = await supabase.from('camiones').select('*').order('numero');
            if (data) set({ camiones: data });
          })
          .subscribe();
        
        // Técnicos
        supabase
          .channel('tecnicos-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tecnicos' }, async () => {
            const { data } = await supabase.from('tecnicos').select('*').order('nombre');
            if (data) set({ tecnicos: data });
          })
          .subscribe();
        
        // Contratistas
        supabase
          .channel('contratistas-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'contratistas' }, async () => {
            const { data } = await supabase.from('contratistas').select('*').order('nombre');
            if (data) set({ contratistas: data });
          })
          .subscribe();
      },
      
      // ==========================================
      // COMPUTED
      // ==========================================
      
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
        const porcentaje = total > 0 ? Math.round((operativos / total) * 1000) / 10 : 100;
        
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
          const prioridadOrden: Record<string, number> = { urgente: 0, alta: 1, normal: 2 };
          return (prioridadOrden[a.prioridad] || 2) - (prioridadOrden[b.prioridad] || 2);
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
      
      // ==========================================
      // SETTERS UI
      // ==========================================
      
      setFiltroTipo: (filtro) => set({ filtroTipo: filtro }),
      setFiltroUbicacion: (filtro) => set({ filtroUbicacion: filtro }),
      setBusqueda: (busqueda) => set({ busqueda }),
      setModalNuevoTrabajo: (open) => set({ modalNuevoTrabajo: open }),
      setModalDetalleTrabajo: (id) => set({ modalDetalleTrabajo: id }),
      setModalConfiguracion: (open) => set({ modalConfiguracion: open }),
      setVistaActual: (vista) => set({ vistaActual: vista }),
      setFechaProgramacion: (fecha) => set({ fechaProgramacion: fecha }),
      
      // ==========================================
      // CRUD - TRABAJOS
      // ==========================================
      
      agregarTrabajo: async (form) => {
        try {
          const { data, error } = await supabase
            .from('trabajos')
            .insert({
              camion_id: form.camion_id,
              ubicacion_tipo: form.ubicacion_tipo,
              bahia_numero: form.bahia_numero,
              ubicacion_especifica: form.ubicacion_especifica,
              tipo: form.tipo,
              descripcion_falla: form.descripcion_falla,
              sistema_afectado: form.sistema_afectado,
              ejecutado_por: form.ejecutado_por,
              contratista_id: form.contratista_id,
              fecha_entrada: getFechaActual(),
              hora_entrada: getHoraActual(),
              tiempo_estimado_horas: form.tiempo_estimado_horas,
              estado: 'en_proceso',
              progreso_estimado: 0,
              horometro_entrada: form.horometro_entrada,
              observaciones_iniciales: form.observaciones_iniciales,
            })
            .select()
            .single();
          
          if (error) throw error;
          
          if (form.tecnicos && form.tecnicos.length > 0) {
            await supabase.from('trabajo_tecnicos').insert(
              form.tecnicos.map(tecnicoId => ({
                trabajo_id: data.id,
                tecnico_id: tecnicoId,
              }))
            );
          }
          
          await supabase
            .from('camiones')
            .update({ estado: 'en_mantenimiento' })
            .eq('id', form.camion_id);
          
          set({ modalNuevoTrabajo: false });
          return data;
          
        } catch (error: any) {
          console.error('Error agregando trabajo:', error);
          set({ error: error.message });
          return null;
        }
      },
      
      agregarTrabajoDesdeProgram: async (itemId: string, bahia?: number) => {
        const item = get().programacion.find(p => p.id === itemId);
        if (!item) return null;
        
        const camion = get().camiones.find(c => c.id === item.camion_id);
        if (!camion) return null;
        
        try {
          const { data, error } = await supabase
            .from('trabajos')
            .insert({
              camion_id: item.camion_id,
              ubicacion_tipo: bahia ? 'bahia' : 'fuera_bahia',
              bahia_numero: bahia,
              tipo: item.tipo,
              descripcion_falla: item.tipo === 'correctivo' ? item.descripcion_trabajo : null,
              ejecutado_por: item.tecnicos_asignados?.length > 0 ? 'tecnico_interno' : (item.contratista_id ? 'contratista' : 'tecnico_interno'),
              contratista_id: item.contratista_id,
              fecha_entrada: getFechaActual(),
              hora_entrada: getHoraActual(),
              tiempo_estimado_horas: 4,
              estado: 'en_proceso',
              progreso_estimado: 0,
              horometro_entrada: camion.horometro_actual,
              observaciones_iniciales: item.observaciones,
            })
            .select()
            .single();
          
          if (error) throw error;
          
          if (item.tecnicos_asignados && item.tecnicos_asignados.length > 0) {
            await supabase.from('trabajo_tecnicos').insert(
              item.tecnicos_asignados.map(tecnicoId => ({
                trabajo_id: data.id,
                tecnico_id: tecnicoId,
              }))
            );
          }
          
          await supabase
            .from('camiones')
            .update({ estado: 'en_mantenimiento' })
            .eq('id', item.camion_id);
          
          await supabase
            .from('programacion')
            .update({ trabajo_id: data.id, estado_ubicacion: 'en_hangar' })
            .eq('id', itemId);
          
          return data;
          
        } catch (error: any) {
          console.error('Error creando trabajo desde programación:', error);
          set({ error: error.message });
          return null;
        }
      },
      
      actualizarEstadoTrabajo: async (id, estado, progreso, observacion) => {
        try {
          const trabajo = get().trabajos.find(t => t.id === id);
          const nuevaObservacion = observacion
            ? `${trabajo?.observaciones_finales || ''}\n[${getHoraActual()}] ${observacion}`.trim()
            : trabajo?.observaciones_finales;
          
          const { error } = await supabase
            .from('trabajos')
            .update({
              estado,
              progreso_estimado: progreso,
              observaciones_finales: nuevaObservacion,
            })
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error actualizando trabajo:', error);
          set({ error: error.message });
        }
      },
      
      cerrarTrabajo: async (id, datos) => {
        const trabajo = get().trabajos.find(t => t.id === id);
        if (!trabajo) return;
        
        try {
          const { error } = await supabase
            .from('trabajos')
            .update({
              estado: 'completado',
              progreso_estimado: 100,
              fecha_salida: getFechaActual(),
              hora_salida: datos.hora_salida,
              horometro_salida: datos.horometro_salida,
              observaciones_finales: datos.observaciones_finales,
              estado_final_camion: datos.estado_final_camion,
            })
            .eq('id', id);
          
          if (error) throw error;
          
          await supabase
            .from('camiones')
            .update({
              estado: datos.estado_final_camion === 'no_operativo' ? 'fuera_servicio' : 'operativo',
              horometro_actual: datos.horometro_salida,
            })
            .eq('id', trabajo.camion_id);
          
          await supabase
            .from('programacion')
            .update({ estado_ubicacion: 'completado' })
            .eq('trabajo_id', id);
          
          if (datos.repuestos_utilizados && datos.repuestos_utilizados.length > 0) {
            await supabase.from('trabajo_repuestos').insert(
              datos.repuestos_utilizados.map(r => ({
                trabajo_id: id,
                nombre: r.nombre,
                cantidad: r.cantidad,
                unidad: r.unidad,
              }))
            );
          }
          
          set({ modalDetalleTrabajo: null });
          
        } catch (error: any) {
          console.error('Error cerrando trabajo:', error);
          set({ error: error.message });
        }
      },
      
      // ==========================================
      // CRUD - PROGRAMACIÓN
      // ==========================================
      
      agregarItemProgramacion: async (item) => {
        try {
          const { data, error } = await supabase
            .from('programacion')
            .insert({
              camion_id: item.camion_id,
              fecha_programada: item.fecha_programada,
              tipo: item.tipo,
              descripcion_trabajo: item.descripcion_trabajo,
              contratista_id: item.contratista_id,
              observaciones: item.observaciones,
              estado_ubicacion: 'pendiente',
            })
            .select()
            .single();
          
          if (error) throw error;
          
          if (item.tecnicos_asignados && item.tecnicos_asignados.length > 0) {
            await supabase.from('programacion_tecnicos').insert(
              item.tecnicos_asignados.map(tecnicoId => ({
                programacion_id: data.id,
                tecnico_id: tecnicoId,
              }))
            );
          }
          
        } catch (error: any) {
          console.error('Error agregando programación:', error);
          set({ error: error.message });
        }
      },
      
      actualizarUbicacionItem: async (id, ubicacion) => {
        try {
          const { error } = await supabase
            .from('programacion')
            .update({ estado_ubicacion: ubicacion })
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error actualizando ubicación:', error);
          set({ error: error.message });
        }
      },
      
      eliminarItemProgramacion: async (id) => {
        try {
          await supabase.from('programacion_tecnicos').delete().eq('programacion_id', id);
          
          const { error } = await supabase
            .from('programacion')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error eliminando programación:', error);
          set({ error: error.message });
        }
      },
      
      moverItemASiguienteDia: async (id) => {
        const item = get().programacion.find(p => p.id === id);
        if (!item) return;
        
        const fechaActual = new Date(item.fecha_programada);
        fechaActual.setDate(fechaActual.getDate() + 1);
        const nuevaFecha = fechaActual.toISOString().split('T')[0];
        
        try {
          const { error } = await supabase
            .from('programacion')
            .update({ fecha_programada: nuevaFecha, estado_ubicacion: 'pendiente' })
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error moviendo programación:', error);
          set({ error: error.message });
        }
      },
      
      // ==========================================
      // CRUD - TÉCNICOS
      // ==========================================
      
      agregarTecnico: async (tecnico) => {
        try {
          const { error } = await supabase
            .from('tecnicos')
            .insert({
              nombre: tecnico.nombre,
              especialidad: tecnico.especialidad,
              turno: tecnico.turno,
              activo: true,
            });
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error agregando técnico:', error);
          set({ error: error.message });
        }
      },
      
      toggleTecnicoActivo: async (id) => {
        const tecnico = get().tecnicos.find(t => t.id === id);
        if (!tecnico) return;
        
        try {
          const { error } = await supabase
            .from('tecnicos')
            .update({ activo: !tecnico.activo })
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error toggling técnico:', error);
          set({ error: error.message });
        }
      },
      
      eliminarTecnico: async (id) => {
        try {
          const { error } = await supabase
            .from('tecnicos')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error eliminando técnico:', error);
          set({ error: error.message });
        }
      },
      
      // ==========================================
      // CRUD - CONTRATISTAS
      // ==========================================
      
      agregarContratista: async (contratista) => {
        try {
          const { error } = await supabase
            .from('contratistas')
            .insert({
              nombre: contratista.nombre,
              especialidad: contratista.especialidad,
              contacto: contratista.contacto,
              activo: true,
            });
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error agregando contratista:', error);
          set({ error: error.message });
        }
      },
      
      toggleContratistaActivo: async (id) => {
        const contratista = get().contratistas.find(c => c.id === id);
        if (!contratista) return;
        
        try {
          const { error } = await supabase
            .from('contratistas')
            .update({ activo: !contratista.activo })
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error toggling contratista:', error);
          set({ error: error.message });
        }
      },
      
      eliminarContratista: async (id) => {
        try {
          const { error } = await supabase
            .from('contratistas')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error eliminando contratista:', error);
          set({ error: error.message });
        }
      },
      
      // ==========================================
      // CRUD - TIPOS DE TRABAJO
      // ==========================================
      
      agregarTipoTrabajo: async (tipo) => {
        try {
          const { error } = await supabase
            .from('tipos_trabajo')
            .insert({
              nombre: tipo.nombre,
              categoria: tipo.categoria,
              descripcion: tipo.descripcion,
              tiempo_estimado_default: tipo.tiempo_estimado_default,
              activo: true,
            });
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error agregando tipo de trabajo:', error);
          set({ error: error.message });
        }
      },
      
      toggleTipoTrabajoActivo: async (id) => {
        const tipo = get().tiposTrabajo.find(t => t.id === id);
        if (!tipo) return;
        
        try {
          const { error } = await supabase
            .from('tipos_trabajo')
            .update({ activo: !tipo.activo })
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error toggling tipo de trabajo:', error);
          set({ error: error.message });
        }
      },
      
      eliminarTipoTrabajo: async (id) => {
        try {
          const { error } = await supabase
            .from('tipos_trabajo')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error eliminando tipo de trabajo:', error);
          set({ error: error.message });
        }
      },
      
      // ==========================================
      // CRUD - NOTAS DE TURNO
      // ==========================================
      
      agregarNota: async (nota) => {
        try {
          const { error } = await supabase
            .from('notas_turno')
            .insert({
              fecha: nota.fecha,
              turno: nota.turno,
              autor: nota.autor,
              nota: nota.nota,
              prioridad: nota.prioridad,
              leida: false,
            });
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error agregando nota:', error);
          set({ error: error.message });
        }
      },
      
      marcarNotaLeida: async (id) => {
        try {
          const { error } = await supabase
            .from('notas_turno')
            .update({ leida: true })
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error marcando nota como leída:', error);
          set({ error: error.message });
        }
      },
      
      eliminarNota: async (id) => {
        try {
          const { error } = await supabase
            .from('notas_turno')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
        } catch (error: any) {
          console.error('Error eliminando nota:', error);
          set({ error: error.message });
        }
      },
      
      // ==========================================
      // HELPERS
      // ==========================================
      
      getCamionById: (id) => get().camiones.find(c => c.id === id),
      getTecnicoById: (id) => get().tecnicos.find(t => t.id === id),
      getContratistaById: (id) => get().contratistas.find(c => c.id === id),
      getTipoTrabajoById: (id) => get().tiposTrabajo.find(t => t.id === id),
      getTrabajoById: (id) => get().trabajos.find(t => t.id === id),
      getItemProgramacionById: (id) => get().programacion.find(p => p.id === id),
    }),
    { name: 'hangar-sprc' }
  )
);
