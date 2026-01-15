import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-sprc-blue/40 to-sprc-navy/80',
        'backdrop-blur-sm rounded-2xl border border-slate-700/30',
        'shadow-xl shadow-black/20',
        hover && 'transition-all duration-300 cursor-pointer hover:border-sprc-orange/30 hover:shadow-sprc-orange/5 hover:translate-y-[-2px]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-4 border-b border-slate-700/30', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-4 border-t border-slate-700/30', className)}>
      {children}
    </div>
  );
}
