import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Warehouse, 
  Bell, 
  Settings, 
  Menu,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-sprc-navy/80 backdrop-blur-xl border-b border-slate-700/30">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sprc-orange to-amber-500 shadow-lg shadow-sprc-orange/20">
                <Warehouse className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-white leading-none">
                  Hangar SPRC
                </h1>
                <p className="text-xs text-slate-400">Sistema de Mantenimiento</p>
              </div>
            </div>
          </div>

          {/* Center: Date & Time */}
          <div className="hidden md:flex flex-col items-center">
            <p className="text-sm font-medium text-white">
              {format(currentTime, "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </p>
            <p className="text-2xl font-display font-bold text-sprc-orange tabular-nums">
              {format(currentTime, 'HH:mm:ss')}
            </p>
          </div>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-2">
            {/* Real-time Indicator */}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/20 text-red-300'
              )}
            >
              {isOnline ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">En vivo</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-sprc-orange rounded-full" />
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
