import { useHangarStore } from '@/stores/hangarStore';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';
import { ProgressBar } from '@/components/ui';
import { 
  Truck, 
  Clock, 
  MapPin,
  Paintbrush,
  Radio,
  ExternalLink
} from 'lucide-react';
import { formatHora } from '@/lib/utils';
import { ESTADOS_TRABAJO } from '@/types';

export function TrabajosFueraBahia() {
  const { trabajos, camiones, contratistas, setModalDetalleTrabajo } = useHangarStore();
  
  const trabajosFuera = trabajos.filter(
    t => (t.ubicacion_tipo === 'fuera_bahia' || t.ubicacion_tipo === 'otro_departamento') && 
         t.estado !== 'completado'
  );

  if (trabajosFuera.length === 0) {
    return null;
  }

  const getIcon = (ubicacion?: string) => {
    if (ubicacion?.toLowerCase().includes('pintura')) return Paintbrush;
    if (ubicacion?.toLowerCase().includes('telecom')) return Radio;
    return ExternalLink;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-white">
          Trabajos Fuera del Hangar
        </h2>
        <span className="text-sm text-slate-400">
          {trabajosFuera.length} activo{trabajosFuera.length !== 1 && 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trabajosFuera.map((trabajo) => {
          const camion = camiones.find(c => c.id === trabajo.camion_id);
          const contratista = trabajo.contratista_id 
            ? contratistas.find(c => c.id === trabajo.contratista_id) 
            : null;
          const Icon = getIcon(trabajo.ubicacion_especifica);

          return (
            <Card 
              key={trabajo.id} 
              hover
              onClick={() => setModalDetalleTrabajo(trabajo.id)}
              className="relative overflow-hidden border-amber-500/20"
            >
              {/* Indicador de ubicación */}
              <div className="absolute top-0 left-0 px-3 py-1.5 bg-amber-500/20 rounded-br-xl flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-amber-300">
                  {trabajo.ubicacion_especifica || 'Externo'}
                </span>
              </div>

              <div className="p-4 pt-10">
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
                  
                  {contratista && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[100px]">{contratista.nombre}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
