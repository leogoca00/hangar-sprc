import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { BayGrid } from '@/components/hangar/BayGrid';
import { TrabajosFueraBahia } from '@/components/hangar/TrabajosFueraBahia';
import { NuevoTrabajoModal } from '@/components/forms/NuevoTrabajoModal';
import { DetalleTrabajoModal } from '@/components/forms/DetalleTrabajoModal';
import { ConfiguracionModal } from '@/components/forms/ConfiguracionModal';
import { ProgramacionDiaria } from '@/components/programacion/ProgramacionDiaria';
import { TimelineView } from '@/components/timeline/TimelineView';
import { NotasTurno } from '@/components/notas/NotasTurno';
import { Button, Select } from '@/components/ui';
import { useHangarStore } from '@/stores/hangarStore';
import { 
  Plus, 
  Filter,
  Search,
  RefreshCw,
  Settings2,
  Warehouse,
  Calendar,
  Clock,
  MessageSquare,
  Loader2,
  WifiOff,
  Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';

function App() {
  const { 
    setModalNuevoTrabajo, 
    setModalConfiguracion,
    filtroTipo, 
    setFiltroTipo,
    filtroUbicacion,
    setFiltroUbicacion,
    busqueda,
    setBusqueda,
    camiones,
    vistaActual,
    setVistaActual,
    notas,
    isLoading,
    isConnected,
    error,
    inicializar,
  } = useHangarStore();

  useEffect(() => {
    inicializar();
  }, []);

  const notasNoLeidas = notas.filter(n => !n.leida).length;

  const vistas = [
    { id: 'hangar' as const, label: 'Hangar', icon: Warehouse },
    { id: 'programacion' as const, label: 'Programación', icon: Calendar },
    { id: 'timeline' as const, label: 'Timeline', icon: Clock },
    { id: 'notas' as const, label: 'Notas', icon: MessageSquare, badge: notasNoLeidas },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sprc-navy flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sprc-orange animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Conectando con la base de datos...</p>
          <p className="text-slate-400 text-sm mt-2">Hangar SPRC</p>
        </div>
      </div>
    );
  }

  if (!isConnected || error) {
    return (
      <div className="min-h-screen bg-sprc-navy flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-white text-xl font-bold mb-2">Error de conexión</h1>
          <p className="text-slate-400 mb-4">
            {error || 'No se pudo conectar con la base de datos. Verifica tu conexión a internet y las credenciales de Supabase.'}
          </p>
          <Button onClick={() => inicializar()}>
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sprc-navy bg-grid-pattern">
      <Header />
      
      <main className="px-4 lg:px-6 py-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-xl w-fit">
            {vistas.map((vista) => {
              const Icon = vista.icon;
              return (
                <button
                  key={vista.id}
                  onClick={() => setVistaActual(vista.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all relative',
                    vistaActual === vista.id
                      ? 'bg-sprc-orange text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{vista.label}</span>
                  {vista.badge && vista.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                      {vista.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Wifi className="w-4 h-4" />
            <span className="hidden sm:inline">Sincronizado</span>
          </div>
        </div>

        {vistaActual === 'hangar' && (
          <>
            <section className="animate-fade-in">
              <StatsCards />
            </section>

            <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-sprc-blue/20 border border-slate-700/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>
                
                <Select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'preventivo' | 'correctivo')}
                  options={[
                    { value: 'todos', label: 'Todos los tipos' },
                    { value: 'preventivo', label: 'Preventivos' },
                    { value: 'correctivo', label: 'Correctivos' },
                  ]}
                  className="!w-auto !py-2"
                />
                
                <Select
                  value={filtroUbicacion}
                  onChange={(e) => setFiltroUbicacion(e.target.value as 'todos' | 'bahia' | 'fuera_bahia' | 'otro_departamento')}
                  options={[
                    { value: 'todos', label: 'Todas las ubicaciones' },
                    { value: 'bahia', label: 'En Bahía' },
                    { value: 'fuera_bahia', label: 'Fuera de Bahía' },
                    { value: 'otro_departamento', label: 'Otro Departamento' },
                  ]}
                  className="!w-auto !py-2"
                />

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar camión..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-sprc-navy/60 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sprc-orange/50 w-40"
                  />
                </div>

                <div className="text-xs text-slate-500 hidden lg:block">
                  Flota: {camiones.length} camiones
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setModalConfiguracion(true)}
                  title="Configuración"
                >
                  <Settings2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Configuración</span>
                </Button>
                
                <button
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                  title="Actualizar"
                  onClick={() => inicializar()}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <Button onClick={() => setModalNuevoTrabajo(true)}>
                  <Plus className="w-5 h-5" />
                  Nuevo Trabajo
                </Button>
              </div>
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <BayGrid />
            </section>

            <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <TrabajosFueraBahia />
            </section>
          </>
        )}

        {vistaActual === 'programacion' && (
          <section className="animate-fade-in">
            <ProgramacionDiaria />
          </section>
        )}

        {vistaActual === 'timeline' && (
          <section className="animate-fade-in">
            <TimelineView />
          </section>
        )}

        {vistaActual === 'notas' && (
          <section className="animate-fade-in">
            <NotasTurno />
          </section>
        )}
      </main>

      <NuevoTrabajoModal />
      <DetalleTrabajoModal />
      <ConfiguracionModal />
    </div>
  );
}

export default App;
