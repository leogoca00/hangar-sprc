import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'preventivo' | 'correctivo' | 'en_proceso' | 'esperando' | 'completado' | 'urgente';
  className?: string;
}

const variants = {
  default: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  preventivo: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  correctivo: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  en_proceso: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  esperando: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  completado: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  urgente: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'text-xs font-semibold uppercase tracking-wide border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
