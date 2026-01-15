import { useState } from 'react';
import { useHangarStore } from '@/stores/hangarStore';
import { Card, Button, Input, Select, Badge, Checkbox, Textarea } from '@/components/ui';
import { 
  Plus, 
  Truck, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  MapPin,
  Trash2,
  ArrowRight,
  Play,
  User,
  Wrench
} from 'lucide-react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ESTADOS_UBICACION_PROGRAMACION, 
  COLORES_ESTADO_UBICACION,
  type EstadoUbicacionProgramacion,
  type TipoTrabajo 
} from '@/types';
import { cn, getFechaActual } from '@/lib/utils';

export function ProgramacionDiaria() {
  const {
    fechaProgramacion,
    setFechaProgramacion,
    getProgramacionPorFecha,
    getEstadisticasProgramacion,
    camiones,
    tecnicos,
    contratistas,
    agregarItemProgramacion,
    actualizarUbicacionItem,
    eliminarItemProgramacion,
    moverItemASiguienteDia,
    agregarTrabajoDesdeProgram,
    getCamionById,
    getTecnicoById,
    getContratistaById,
    bahiasOcupadas,
  } = useHangarStore();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    camion_id: '',
    tipo: 'preventivo' as TipoTrabajo,
    descripcion_trabajo: '',
    tecnicos_asignados: [] as string[],
    contratista_id: '',
    observaciones: '',
  });

  const items = getProgramacionPorFecha(fechaProgramacion);
  const stats = getEstadisticasProgramacion(fechaProgramacion);
  const hoy = getFechaActual();
  const esHoy = fechaProgramacion === hoy;
  const esFechaPasada = fechaProgramacion < hoy;
  const ocupadas = bahiasOcupadas();

  const cambiarFecha = (dias: number) => {
    const fecha = parseISO(fechaProgramacion);
    const nuevaFecha = dias > 0 ? addDays(fecha, dias) : subDays(fecha, Math.abs(dias));
    setFechaProgramacion(format(nuevaFecha, 'yyyy-MM-dd'));
  };

  const resetForm = () => {
    setFormData({
      camion_id: '',
      tipo: 'preventivo',
      descripcion_trabajo: '',
      tecnicos_asignados: [],
      contratista_id: '',
      observaciones: '',
    });
    setMostrarFormulario(false);
  };

  const handleAgregar = () => {
    if (!formData.camion_id || !formData.descripcion_trabajo) return;
    
    agregarItemProgramacion({
      camion_id: formData.camion_id,
      fecha_programada: fechaProgramacion,
      tipo: formData.tipo,
      descripcion_trabajo: formData.descripcion_trabajo,
      tecnicos_asignados: formData.tecnicos_asignados,
      contratista_id: formData.contratista_id || undefined,
      observaciones: formData.observaciones || undefined,
    });
    
    resetForm();
  };

  const handleIniciarTrabajo = (itemId: string) => {
    // Encontrar una bahía libre
    const bahiasLibres = [1, 2, 3, 4, 5, 6, 7].filter(b => !ocupadas.includes(b));
    const bahia = bahiasLibres.length > 0 ? bahiasLibres[0] : undefined;
    agregarTrabajoDesdeProgram(itemId, bahia);
  };

  // Camiones que no están ya programados para esta fecha
  const camionesParaProgramar = camiones.filter(c => {
    const yaProgamado = items.some(i => i.camion_id === c.id && i.estado_ubicacion !== 'cancelado');
    return c.estado === 'operativo' && !yaProgamado;
  });

  return (
    <div className="space-y-6">
      {/* Header con navegación de fecha */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-sprc-orange" />
            Programación Diaria
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {esHoy ? 'Ejecución de hoy' : esFechaPasada ? 'Histórico' : 'Planificación para mañana'}
          </p>
        </div>

        {/* Navegación de fecha */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
          <button
            onClick={() => cambiarFecha(-1)}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="px-4 py-2 text-center min-w-[200px]">
            <p className="text-lg font-semibold text-white">
              {format(parseISO(fechaProgramacion), "EEEE d", { locale: es })}
            </p>
            <p className="text-xs text-slate-400">
              {format(parseISO(fechaProgramacion), "MMMM yyyy", { locale: es })}
            </p>
          </div>
          
          <button
            onClick={() => cambiarFecha(1)}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400">Programados</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-amber-400">{stats.pendientes}</p>
          <p className="text-xs text-slate-400">Pendientes</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-blue-400">{stats.enProceso}</p>
          <p className="text-xs text-slate-400">En Proceso</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-display font-bold text-emerald-400">{stats.completados}</p>
          <p className="text-xs text-slate-400">Completados</p>
        </Card>
      </div>

      {/* Botón agregar (solo si no es fecha pasada) */}
      {!esFechaPasada && !mostrarFormulario && (
        <Button onClick={() => setMostrarFormulario(true)}>
          <Plus className="w-5 h-5" />
          Agregar a Programación
        </Button>
      )}

      {/* Formulario de agregar */}
      {mostrarFormulario && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Agregar Camión a Programación</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Camión"
              value={formData.camion_id}
              onChange={(e) => setFormData({ ...formData, camion_id: e.target.value })}
              placeholder="Selecciona el camión"
              options={camionesParaProgramar.map(c => ({
                value: c.id,
                label: `${c.numero} - ${c.horometro_actual.toLocaleString()} hrs`,
              }))}
            />

            <Select
              label="Tipo de Trabajo"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoTrabajo })}
              options={[
                { value: 'preventivo', label: 'Preventivo (Programado)' },
                { value: 'correctivo', label: 'Correctivo (Por falla)' },
              ]}
            />

            <div className="md:col-span-2">
              <Textarea
                label="Descripción del trabajo"
                placeholder="Ej: Servicio 6K horas, cambio de aceite... o Fuga de líquido refrigerante..."
                value={formData.descripcion_trabajo}
                onChange={(e) => setFormData({ ...formData, descripcion_trabajo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Técnicos asignados
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {tecnicos.filter(t => t.activo).map((tecnico) => (
                  <Checkbox
                    key={tecnico.id}
                    label={tecnico.nombre}
                    checked={formData.tecnicos_asignados.includes(tecnico.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, tecnicos_asignados: [...formData.tecnicos_asignados, tecnico.id] });
                      } else {
                        setFormData({ ...formData, tecnicos_asignados: formData.tecnicos_asignados.filter(t => t !== tecnico.id) });
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            <Select
              label="Contratista (opcional)"
              value={formData.contratista_id}
              onChange={(e) => setFormData({ ...formData, contratista_id: e.target.value })}
              placeholder="Sin contratista"
              options={[
                { value: '', label: 'Sin contratista' },
                ...contratistas.filter(c => c.activo).map(c => ({
                  value: c.id,
                  label: c.nombre,
                }))
              ]}
            />

            <div className="md:col-span-2">
              <Textarea
                label="Observaciones (opcional)"
                placeholder="Notas adicionales..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="min-h-[60px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleAgregar} disabled={!formData.camion_id || !formData.descripcion_trabajo}>
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de items programados */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No hay camiones programados para esta fecha</p>
          </Card>
        ) : (
          items.map((item) => {
            const camion = getCamionById(item.camion_id);
            const tecnicosAsignados = item.tecnicos_asignados.map(id => getTecnicoById(id)).filter(Boolean);
            const contratista = item.contratista_id ? getContratistaById(item.contratista_id) : null;
            
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Info principal */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-sprc-orange/20">
                      <Truck className="w-6 h-6 text-sprc-orange" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-display font-bold text-white">
                          {camion?.numero}
                        </span>
                        <Badge variant={item.tipo === 'preventivo' ? 'preventivo' : 'correctivo'}>
                          {item.tipo}
                        </Badge>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium border',
                          COLORES_ESTADO_UBICACION[item.estado_ubicacion]
                        )}>
                          {ESTADOS_UBICACION_PROGRAMACION[item.estado_ubicacion]}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-2">
                        {item.descripcion_trabajo}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {tecnicosAsignados.length > 0 && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {tecnicosAsignados.map(t => t?.nombre).join(', ')}
                          </span>
                        )}
                        {contratista && (
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {contratista.nombre}
                          </span>
                        )}
                      </div>
                      
                      {item.observaciones && (
                        <p className="text-xs text-slate-500 mt-2 italic">
                          "{item.observaciones}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    {/* Botones de estado (solo si es hoy y no está completado) */}
                    {esHoy && !['completado', 'cancelado'].includes(item.estado_ubicacion) && (
                      <div className="flex flex-wrap gap-1">
                        {(['pendiente', 'en_lavado', 'en_hangar', 'en_pintura', 'en_telecomunicaciones'] as EstadoUbicacionProgramacion[]).map((estado) => (
                          <button
                            key={estado}
                            onClick={() => actualizarUbicacionItem(item.id, estado)}
                            className={cn(
                              'px-2 py-1 rounded text-xs font-medium border transition-all',
                              item.estado_ubicacion === estado
                                ? COLORES_ESTADO_UBICACION[estado]
                                : 'bg-slate-700/30 text-slate-500 border-slate-700/50 hover:bg-slate-700/50'
                            )}
                          >
                            {ESTADOS_UBICACION_PROGRAMACION[estado]}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Botón iniciar trabajo (solo si está en hangar y no tiene trabajo creado) */}
                    {esHoy && item.estado_ubicacion === 'en_hangar' && !item.trabajo_id && (
                      <Button size="sm" onClick={() => handleIniciarTrabajo(item.id)}>
                        <Play className="w-4 h-4" />
                        Iniciar Trabajo
                      </Button>
                    )}

                    {/* Botón mover a siguiente día (solo si está pendiente y no es fecha pasada) */}
                    {item.estado_ubicacion === 'pendiente' && !esFechaPasada && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => moverItemASiguienteDia(item.id)}
                        title="Mover a siguiente día"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Botón eliminar */}
                    {!item.trabajo_id && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => eliminarItemProgramacion(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
