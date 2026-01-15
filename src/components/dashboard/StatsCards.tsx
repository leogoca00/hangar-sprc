import { useHangarStore } from '@/stores/hangarStore';
import { Card } from '@/components/ui';
import { 
  Truck, 
  Wrench, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsCards() {
  const { disponibilidad, trabajosActivos, trabajos, camiones } = useHangarStore();
  const stats = disponibilidad();
  const activos = trabajosActivos();
  
  const preventivosHoy = activos.filter(t => t.tipo === 'preventivo').length;
  const correctivosHoy = activos.filter(t => t.tipo === 'correctivo').length;
  const esperandoRepuesto = activos.filter(t => t.estado === 'esperando_repuesto').length;
  const completadosHoy = trabajos.filter(t => t.estado === 'completado').length;

  const statsData = [
    {
      label: 'Disponibilidad',
      value: `${stats.porcentaje}%`,
      subValue: `${stats.operativos} / ${camiones.length} operativos`,
      icon: TrendingUp,
      color: stats.porcentaje >= 90 ? 'emerald' : stats.porcentaje >= 80 ? 'amber' : 'red',
    },
    {
      label: 'En Mantenimiento',
      value: stats.enMantenimiento,
      subValue: `${preventivosHoy} prev. / ${correctivosHoy} corr.`,
      icon: Wrench,
      color: 'orange',
    },
    {
      label: 'Completados Hoy',
      value: completadosHoy,
      subValue: 'Trabajos finalizados',
      icon: CheckCircle2,
      color: 'blue',
    },
    {
      label: 'Esperando Repuesto',
      value: esperandoRepuesto,
      subValue: esperandoRepuesto > 0 ? 'Requieren atención' : 'Sin pendientes',
      icon: esperandoRepuesto > 0 ? AlertTriangle : Clock,
      color: esperandoRepuesto > 0 ? 'amber' : 'slate',
    },
  ];

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      icon: 'text-emerald-500',
    },
    amber: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      icon: 'text-amber-500',
    },
    red: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      icon: 'text-red-500',
    },
    orange: {
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      icon: 'text-orange-500',
    },
    blue: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      icon: 'text-blue-500',
    },
    slate: {
      bg: 'bg-slate-500/20',
      text: 'text-slate-400',
      icon: 'text-slate-500',
    },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses];
        const Icon = stat.icon;
        
        return (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">
                  {stat.label}
                </p>
                <p className={cn('text-3xl font-display font-bold', colors.text)}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stat.subValue}
                </p>
              </div>
              <div className={cn('p-3 rounded-xl', colors.bg)}>
                <Icon className={cn('w-6 h-6', colors.icon)} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
