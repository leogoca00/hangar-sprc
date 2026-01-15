import { useHangarStore } from '@/stores/hangarStore';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import { 
  Truck, 
  Clock, 
  Wrench, 
  AlertTriangle,
  User,
  Building2
} from 'lucide-react';
import { cn, formatHora, calcularHorasTranscurridas } from '@/lib/utils';
import { BAHIAS, ESTADOS_TRABAJO } from '@/types';
import type { TrabajoMantenimiento } from '@/types';

export function BayGrid() {
  const { trabajos, camiones, tecnicos, contratistas, setModalDetalleTrabajo } = useHangarStore();
  
  // Obtener trabajo activo por bahía
  const getTrabajoEnBahia = (bahia: number): TrabajoMantenimiento | undefined => {
    return trabajos.find(
      t => t.ubicacion_tipo === 'bahia' && 
           t.bahia_numero === bahia && 
           t.estado !== 'completado'
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-white">
          Bahías del Hangar
        </h2>
        <span className="text-sm text-slate-400">
          {BAHIAS.filter(b => getTrabajoEnBahia(b)).length} / {BAHIAS.length} ocupadas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {BAHIAS.map((bahia) => {
          const trabajo = getTrabajoEnBahia(bahia);
          const camion = trabajo ? camiones.find(c => c.id === trabajo.camion_id) : null;
          const tecnicosAsignados = trabajo?.tecnicos?.map(id => tecnicos.find(t => t.id === id)).filter(Boolean) || [];
          const contratista = trabajo?.contratista_id ? contratistas.find(c => c.id === trabajo.contratista_id) : null;
          
          const horasTranscurridas = trabajo 
            ? calcularHorasTranscurridas(trabajo.fecha_entrada, trabajo.hora_entrada)
            : 0;
          const estaRetrasado = trabajo && horasTranscurridas > trabajo.tiempo_estimado_horas;

          if (!trabajo) {
            return (
              <Card 
                key={bahia} 
                className="border-dashed border-slate-700/50 bg-slate-800/20 min-h-[200px] flex flex-col items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-display font-bold text-slate-500">{bahia}</span>
                  </div>
                  <p className="text-slate-500 text-sm">Bahía disponible</p>
                </div>
              </Card>
            );
          }

          return (
            <Card 
              key={bahia} 
              hover
              onClick={() => setModalDetalleTrabajo(trabajo.id)}
              className={cn(
                "relative overflow-hidden",
                estaRetrasado && "border-red-500/30"
              )}
            >
              {/* Header con número de bahía */}
              <div className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-sprc-orange to-amber-500 flex items-center justify-center rounded-br-2xl">
                <span className="text-lg font-display font-bold text-white">{bahia}</span>
              </div>

              {/* Indicador de retraso */}
              {estaRetrasado && (
                <div className="absolute top-2 right-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                </div>
              )}

              <div className="p-4 pt-8">
                {/* Camión */}
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-sprc-orange" />
                  <span className="font-display font-bold text-white text-lg">
                    {camion?.numero}
                  </span>
                  <Badge variant={trabajo.tipo === 'preventivo' ? 'preventivo' : 'correctivo'}>
                    {trabajo.tipo}
                  </Badge>
                </div>

                {/* Descripción */}
                <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                  {trabajo.tipo === 'preventivo' 
                    ? trabajo.paquete_trabajo?.join(', ').replace(/_/g, ' ')
                    : trabajo.descripcion_falla
                  }
                </p>

                {/* Estado */}
                <div className="mb-3">
                  <Badge 
                    variant={
                      trabajo.estado === 'en_proceso' ? 'en_proceso' :
                      trabajo.estado.startsWith('esperando') ? 'esperando' :
                      'default'
                    }
                  >
                    {ESTADOS_TRABAJO[trabajo.estado]}
                  </Badge>
                </div>

                {/* Progreso */}
                <div className="mb-3">
                  <ProgressBar value={trabajo.progreso_estimado} showLabel size="sm" />
                </div>

                {/* Info adicional */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Desde {formatHora(trabajo.hora_entrada)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {trabajo.ejecutado_por === 'tecnico_interno' ? (
                      <>
                        <User className="w-3.5 h-3.5" />
                        <span>{tecnicosAsignados.length} téc.</span>
                      </>
                    ) : trabajo.ejecutado_por === 'contratista' ? (
                      <>
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[80px]">{contratista?.nombre}</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Externo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
