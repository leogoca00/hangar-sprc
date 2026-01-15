import { useState } from 'react';
import { useHangarStore } from '@/stores/hangarStore';
import { Modal, Button, Badge, ProgressBar, Input, Select, Textarea } from '@/components/ui';
import { 
  Truck, 
  Clock, 
  User,
  Building2,
  Wrench,
  MapPin,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  X,
  Save
} from 'lucide-react';
import { formatHora, formatDuracion, calcularHorasTranscurridas, getHoraActual } from '@/lib/utils';
import { ESTADOS_TRABAJO, type EstadoTrabajo, type EstadoFinalCamion } from '@/types';

export function DetalleTrabajoModal() {
  const { 
    modalDetalleTrabajo, 
    setModalDetalleTrabajo, 
    getTrabajoById,
    getCamionById,
    getTecnicoById,
    getContratistaById,
    actualizarEstadoTrabajo,
    cerrarTrabajo
  } = useHangarStore();
  
  const [modo, setModo] = useState<'ver' | 'actualizar' | 'cerrar'>('ver');
  const [nuevoEstado, setNuevoEstado] = useState<EstadoTrabajo>('en_proceso');
  const [nuevoProgreso, setNuevoProgreso] = useState(0);
  const [observacion, setObservacion] = useState('');
  
  // Datos de cierre
  const [horometroSalida, setHorometroSalida] = useState(0);
  const [estadoFinal, setEstadoFinal] = useState<EstadoFinalCamion>('operativo');
  const [observacionesCierre, setObservacionesCierre] = useState('');

  if (!modalDetalleTrabajo) return null;
  
  const trabajo = getTrabajoById(modalDetalleTrabajo);
  if (!trabajo) return null;

  const camion = getCamionById(trabajo.camion_id);
  const tecnicosAsignados = trabajo.tecnicos?.map(id => getTecnicoById(id)).filter(Boolean) || [];
  const contratista = trabajo.contratista_id ? getContratistaById(trabajo.contratista_id) : null;
  
  const horasTranscurridas = calcularHorasTranscurridas(trabajo.fecha_entrada, trabajo.hora_entrada);
  const estaRetrasado = horasTranscurridas > trabajo.tiempo_estimado_horas;

  const handleClose = () => {
    setModo('ver');
    setModalDetalleTrabajo(null);
  };

  const handleActualizar = () => {
    actualizarEstadoTrabajo(trabajo.id, nuevoEstado, nuevoProgreso, observacion);
    setModo('ver');
    setObservacion('');
  };

  const handleCerrar = () => {
    cerrarTrabajo(trabajo.id, {
      hora_salida: getHoraActual(),
      horometro_salida: horometroSalida,
      estado_final_camion: estadoFinal,
      observaciones_finales: observacionesCierre,
    });
    handleClose();
  };

  // Función para renderizar observaciones
  const renderObservaciones = () => {
    const partes: string[] = [];
    if (trabajo.observaciones_iniciales) {
      partes.push(trabajo.observaciones_iniciales);
    }
    if (trabajo.observaciones_finales) {
      partes.push(trabajo.observaciones_finales);
    }
    return partes.join('\n\n');
  };

  return (
    <Modal
      isOpen={!!modalDetalleTrabajo}
      onClose={handleClose}
      title={`Trabajo - ${camion?.numero}`}
      size="lg"
    >
      {modo === 'ver' && (
        <div className="space-y-6">
          {/* Header con estado */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sprc-orange/20">
                <Truck className="w-8 h-8 text-sprc-orange" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-white">
                  {camion?.numero}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={trabajo.tipo === 'preventivo' ? 'preventivo' : 'correctivo'}>
                    {trabajo.tipo}
                  </Badge>
                  <Badge 
                    variant={
                      trabajo.estado === 'en_proceso' ? 'en_proceso' :
                      trabajo.estado.startsWith('esperando') ? 'esperando' :
                      trabajo.estado === 'completado' ? 'completado' :
                      'default'
                    }
                  >
                    {ESTADOS_TRABAJO[trabajo.estado]}
                  </Badge>
                </div>
              </div>
            </div>
            
            {estaRetrasado && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-300">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Retrasado</span>
              </div>
            )}
          </div>

          {/* Progreso */}
          <div className="p-4 rounded-xl bg-slate-800/50">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-400">Progreso del trabajo</span>
              <span className="text-sm font-medium text-white">{trabajo.progreso_estimado}%</span>
            </div>
            <ProgressBar value={trabajo.progreso_estimado} size="lg" />
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/30">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Ubicación</span>
              </div>
              <p className="font-medium text-white">
                {trabajo.ubicacion_tipo === 'bahia' 
                  ? `Bahía ${trabajo.bahia_numero}`
                  : trabajo.ubicacion_especifica || 'Externo'
                }
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/30">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Tiempo</span>
              </div>
              <p className="font-medium text-white">
                {formatDuracion(horasTranscurridas)} / {formatDuracion(trabajo.tiempo_estimado_horas)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Entrada: {formatHora(trabajo.hora_entrada)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/30">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Gauge className="w-4 h-4" />
                <span className="text-sm">Horómetro</span>
              </div>
              <p className="font-medium text-white">
                {trabajo.horometro_entrada.toLocaleString()} hrs
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/30">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                {trabajo.ejecutado_por === 'contratista' ? (
                  <Building2 className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="text-sm">Ejecutado por</span>
              </div>
              <p className="font-medium text-white">
                {trabajo.ejecutado_por === 'tecnico_interno'
                  ? tecnicosAsignados.map(t => t?.nombre).join(', ')
                  : trabajo.ejecutado_por === 'contratista'
                  ? contratista?.nombre
                  : trabajo.ubicacion_especifica
                }
              </p>
            </div>
          </div>

          {/* Descripción del trabajo */}
          <div className="p-4 rounded-xl bg-slate-800/30">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Wrench className="w-4 h-4" />
              <span className="text-sm">Descripción del trabajo</span>
            </div>
            <p className="text-white">
              {trabajo.tipo === 'preventivo'
                ? trabajo.paquete_trabajo?.map(p => p.replace(/_/g, ' ')).join(', ')
                : trabajo.descripcion_falla
              }
            </p>
          </div>

          {/* Observaciones */}
          {(trabajo.observaciones_iniciales || trabajo.observaciones_finales) && (
            <div className="p-4 rounded-xl bg-slate-800/30">
              <p className="text-sm text-slate-400 mb-2">Observaciones</p>
              <p className="text-white whitespace-pre-line">
                {renderObservaciones()}
              </p>
            </div>
          )}

          {/* Acciones */}
          {trabajo.estado !== 'completado' && (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/30">
              <Button variant="secondary" onClick={() => {
                setNuevoEstado(trabajo.estado);
                setNuevoProgreso(trabajo.progreso_estimado);
                setModo('actualizar');
              }}>
                <Edit3 className="w-4 h-4" />
                Actualizar Estado
              </Button>
              <Button onClick={() => {
                setHorometroSalida(trabajo.horometro_entrada);
                setModo('cerrar');
              }}>
                <CheckCircle2 className="w-4 h-4" />
                Cerrar Trabajo
              </Button>
            </div>
          )}
        </div>
      )}

      {modo === 'actualizar' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Actualizar Estado</h3>
          
          <Select
            label="Estado del trabajo"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value as EstadoTrabajo)}
            options={Object.entries(ESTADOS_TRABAJO)
              .filter(([key]) => key !== 'completado')
              .map(([value, label]) => ({ value, label }))
            }
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Progreso: {nuevoProgreso}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={nuevoProgreso}
              onChange={(e) => setNuevoProgreso(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sprc-orange"
            />
          </div>

          <Textarea
            label="Observación (opcional)"
            placeholder="Agregar nota sobre el avance..."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/30">
            <Button variant="ghost" onClick={() => setModo('ver')}>
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleActualizar}>
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}

      {modo === 'cerrar' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Cerrar Trabajo</h3>
          
          <Input
            type="number"
            label="Horómetro de Salida"
            value={horometroSalida}
            onChange={(e) => setHorometroSalida(Number(e.target.value))}
          />

          <Select
            label="Estado final del camión"
            value={estadoFinal}
            onChange={(e) => setEstadoFinal(e.target.value as EstadoFinalCamion)}
            options={[
              { value: 'operativo', label: 'Operativo' },
              { value: 'operativo_con_obs', label: 'Operativo con observaciones' },
              { value: 'no_operativo', label: 'No operativo' },
            ]}
          />

          <Textarea
            label="Observaciones finales"
            placeholder="Resumen del trabajo realizado..."
            value={observacionesCierre}
            onChange={(e) => setObservacionesCierre(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/30">
            <Button variant="ghost" onClick={() => setModo('ver')}>
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleCerrar}>
              <CheckCircle2 className="w-4 h-4" />
              Confirmar Cierre
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
