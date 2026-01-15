import { useHangarStore } from '@/stores/hangarStore';
import { Card, Badge, ProgressBar } from '@/components/ui';
import { 
  Truck, 
  Clock,
  User,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, getFechaActual, calcularHorasTranscurridas } from '@/lib/utils';
import { ESTADOS_TRABAJO } from '@/types';

export function TimelineView() {
  const { trabajos, camiones, tecnicos, contratistas, setModalDetalleTrabajo } = useHangarStore();
  const hoy = getFechaActual();
  
  // Trabajos de hoy ordenados por hora de entrada
  const trabajosHoy = trabajos
    .filter(t => t.fecha_entrada === hoy)
    .sort((a, b) => a.hora_entrada.localeCompare(b.hora_entrada));

  // Calcular rango de horas del día
  const horaInicio = 6; // 6 AM
  const horaFin = 22; // 10 PM
  const horasDelDia = Array.from({ length: horaFin - horaInicio + 1 }, (_, i) => horaInicio + i);

  // Hora actual para la línea de "ahora"
  const ahora = new Date();
  const horaActual = ahora.getHours();
  const minutoActual = ahora.getMinutes();
  const posicionAhora = ((horaActual - horaInicio) + (minutoActual / 60)) / (horaFin - horaInicio + 1) * 100;

  const getColorTipo = (tipo: string) => {
    return tipo === 'preventivo' ? 'bg-blue-500' : 'bg-orange-500';
  };

  const getColorEstado = (estado: string) => {
    if (estado === 'completado') return 'bg-emerald-500/30 border-emerald-500/50';
    if (estado.startsWith('esperando')) return 'bg-amber-500/30 border-amber-500/50';
    if (estado === 'en_pruebas') return 'bg-blue-500/30 border-blue-500/50';
    return 'bg-slate-500/30 border-slate-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-sprc-orange" />
          Timeline del Día
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-2xl font-display font-bold text-white">{trabajosHoy.length}</p>
          <p className="text-xs text-slate-400">Total hoy</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-display font-bold text-emerald-400">
            {trabajosHoy.filter(t => t.estado === 'completado').length}
          </p>
          <p className="text-xs text-slate-400">Completados</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-display font-bold text-blue-400">
            {trabajosHoy.filter(t => t.estado === 'en_proceso').length}
          </p>
          <p className="text-xs text-slate-400">En proceso</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-display font-bold text-amber-400">
            {trabajosHoy.filter(t => t.estado.startsWith('esperando')).length}
          </p>
          <p className="text-xs text-slate-400">En espera</p>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-6 overflow-hidden">
        {/* Escala de horas */}
        <div className="relative mb-4">
          <div className="flex justify-between text-xs text-slate-500">
            {horasDelDia.map((hora) => (
              <span key={hora} className="w-10 text-center">
                {hora}:00
              </span>
            ))}
          </div>
          
          {/* Línea base */}
          <div className="h-1 bg-slate-700/50 rounded-full mt-2 relative">
            {/* Línea de "ahora" */}
            {posicionAhora >= 0 && posicionAhora <= 100 && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-sprc-orange rounded-full shadow-lg shadow-sprc-orange/50 z-10"
                style={{ left: `${posicionAhora}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-sprc-orange font-medium whitespace-nowrap">
                  {format(ahora, 'HH:mm')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Lista de trabajos como barras */}
        <div className="space-y-3 mt-8">
          {trabajosHoy.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No hay trabajos registrados para hoy</p>
          ) : (
            trabajosHoy.map((trabajo) => {
              const camion = camiones.find(c => c.id === trabajo.camion_id);
              const tecnicosAsignados = trabajo.tecnicos?.map(id => tecnicos.find(t => t.id === id)).filter(Boolean) || [];
              const contratista = trabajo.contratista_id ? contratistas.find(c => c.id === trabajo.contratista_id) : null;
              
              // Calcular posición y ancho de la barra
              const [horaStr, minStr] = trabajo.hora_entrada.split(':');
              const horaEntrada = parseInt(horaStr);
              const minEntrada = parseInt(minStr);
              
              const inicioRelativo = ((horaEntrada - horaInicio) + (minEntrada / 60)) / (horaFin - horaInicio + 1) * 100;
              const duracionHoras = trabajo.tiempo_estimado_horas;
              const anchoRelativo = (duracionHoras / (horaFin - horaInicio + 1)) * 100;
              
              const horasTranscurridas = calcularHorasTranscurridas(trabajo.fecha_entrada, trabajo.hora_entrada);
              const estaRetrasado = trabajo.estado !== 'completado' && horasTranscurridas > trabajo.tiempo_estimado_horas;

              return (
                <div 
                  key={trabajo.id}
                  className="relative h-16 cursor-pointer group"
                  onClick={() => setModalDetalleTrabajo(trabajo.id)}
                >
                  {/* Barra del trabajo */}
                  <div
                    className={cn(
                      'absolute top-0 h-full rounded-lg border-2 transition-all',
                      'hover:scale-[1.02] hover:shadow-lg',
                      getColorEstado(trabajo.estado),
                      estaRetrasado && 'border-red-500/50'
                    )}
                    style={{
                      left: `${Math.max(0, inicioRelativo)}%`,
                      width: `${Math.min(anchoRelativo, 100 - inicioRelativo)}%`,
                      minWidth: '120px',
                    }}
                  >
                    {/* Barra de progreso dentro */}
                    <div 
                      className={cn('h-full rounded-lg opacity-50', getColorTipo(trabajo.tipo))}
                      style={{ width: `${trabajo.progreso_estimado}%` }}
                    />
                    
                    {/* Contenido */}
                    <div className="absolute inset-0 p-2 flex items-center gap-2 overflow-hidden">
                      <div className="flex-shrink-0">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{camion?.numero}</span>
                          {estaRetrasado && <AlertTriangle className="w-4 h-4 text-red-400" />}
                        </div>
                        <p className="text-xs text-slate-300 truncate">
                          {trabajo.tipo === 'preventivo' ? 'Preventivo' : trabajo.descripcion_falla}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-slate-400">{trabajo.hora_entrada}</p>
                        <p className="text-xs text-slate-500">{trabajo.progreso_estimado}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Lista detallada */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Detalle de Trabajos</h3>
        
        {trabajosHoy.map((trabajo) => {
          const camion = camiones.find(c => c.id === trabajo.camion_id);
          const tecnicosAsignados = trabajo.tecnicos?.map(id => tecnicos.find(t => t.id === id)).filter(Boolean) || [];
          const contratista = trabajo.contratista_id ? contratistas.find(c => c.id === trabajo.contratista_id) : null;
          const horasTranscurridas = calcularHorasTranscurridas(trabajo.fecha_entrada, trabajo.hora_entrada);
          const estaRetrasado = trabajo.estado !== 'completado' && horasTranscurridas > trabajo.tiempo_estimado_horas;

          return (
            <Card 
              key={trabajo.id} 
              hover
              onClick={() => setModalDetalleTrabajo(trabajo.id)}
              className={cn(estaRetrasado && 'border-red-500/30')}
            >
              <div className="p-4 flex items-center gap-4">
                {/* Hora */}
                <div className="text-center w-16 flex-shrink-0">
                  <p className="text-lg font-display font-bold text-sprc-orange">{trabajo.hora_entrada.slice(0, 5)}</p>
                  <p className="text-xs text-slate-500">Entrada</p>
                </div>

                {/* Indicador de tipo */}
                <div className={cn('w-1 h-12 rounded-full', getColorTipo(trabajo.tipo))} />

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{camion?.numero}</span>
                    <Badge variant={trabajo.tipo === 'preventivo' ? 'preventivo' : 'correctivo'}>
                      {trabajo.tipo}
                    </Badge>
                    <Badge 
                      variant={
                        trabajo.estado === 'en_proceso' ? 'en_proceso' :
                        trabajo.estado === 'completado' ? 'completado' :
                        'esperando'
                      }
                    >
                      {ESTADOS_TRABAJO[trabajo.estado]}
                    </Badge>
                    {estaRetrasado && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        Retrasado
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-400 mt-1">
                    {trabajo.tipo === 'preventivo' 
                      ? 'Mantenimiento preventivo'
                      : trabajo.descripcion_falla
                    }
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    {tecnicosAsignados.length > 0 && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {tecnicosAsignados.map(t => t?.nombre.split(' ')[0]).join(', ')}
                      </span>
                    )}
                    {contratista && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {contratista.nombre}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progreso */}
                <div className="w-24 flex-shrink-0">
                  <ProgressBar value={trabajo.progreso_estimado} size="sm" />
                  <p className="text-xs text-slate-500 text-center mt-1">{trabajo.progreso_estimado}%</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
