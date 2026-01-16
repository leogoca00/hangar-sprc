import { useState } from 'react';
import { useHangarStore } from '@/stores/hangarStore';
import { Card, Button, Input, Textarea, Select, Badge } from '@/components/ui';
import { 
  MessageSquare, 
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  Check,
  Sun,
  Sunset,
  Moon,
  User
} from 'lucide-react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, getFechaActual } from '@/lib/utils';
import type { Prioridad, Turno } from '@/types';

export function NotasTurno() {
  const {
    notas,
    tecnicos,
    agregarNota,
    marcarNotaLeida,
    eliminarNota,
    getNotasPorFecha,
  } = useHangarStore();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(getFechaActual());
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    autor: '',
    turno: 'dia' as Turno,
    nota: '',
    prioridad: 'normal' as Prioridad,
  });

  const hoy = getFechaActual();
  const esHoy = fechaSeleccionada === hoy;
  const notasDelDia = getNotasPorFecha(fechaSeleccionada);

  const cambiarFecha = (dias: number) => {
    const fecha = parseISO(fechaSeleccionada);
    const nuevaFecha = dias > 0 ? addDays(fecha, dias) : subDays(fecha, Math.abs(dias));
    setFechaSeleccionada(format(nuevaFecha, 'yyyy-MM-dd'));
  };

  const resetForm = () => {
    setFormData({
      autor: '',
      turno: 'dia',
      nota: '',
      prioridad: 'normal',
    });
    setMostrarFormulario(false);
  };

  const handleAgregar = () => {
    if (!formData.autor || !formData.nota) return;
    
    agregarNota({
      fecha: fechaSeleccionada,
      turno: formData.turno,
      autor: formData.autor,
      nota: formData.nota,
      prioridad: formData.prioridad,
    });
    
    resetForm();
  };

  const getPrioridadIcon = (prioridad: Prioridad) => {
    switch (prioridad) {
      case 'urgente': return AlertTriangle;
      case 'alta': return AlertCircle;
      default: return Info;
    }
  };

  const getPrioridadColor = (prioridad: Prioridad) => {
    switch (prioridad) {
      case 'urgente': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'alta': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const notasDia = notasDelDia.filter(n => n.turno === 'dia');
  const notasTarde = notasDelDia.filter(n => n.turno === 'tarde');
  const notasNoche = notasDelDia.filter(n => n.turno === 'noche');
  const notasNoLeidas = notasDelDia.filter(n => !n.leida).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-sprc-orange" />
            Notas de Cambio de Turno
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Comunicación entre turnos de día, tarde y noche
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
              {format(parseISO(fechaSeleccionada), "EEEE d", { locale: es })}
            </p>
            <p className="text-xs text-slate-400">
              {format(parseISO(fechaSeleccionada), "MMMM yyyy", { locale: es })}
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

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-white">{notasDelDia.length}</p>
          <p className="text-xs text-slate-400">Total notas</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-amber-400">{notasNoLeidas}</p>
          <p className="text-xs text-slate-400">Sin leer</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-red-400">
            {notasDelDia.filter(n => n.prioridad === 'urgente').length}
          </p>
          <p className="text-xs text-slate-400">Urgentes</p>
        </Card>
      </div>

      {/* Botón agregar */}
      {!mostrarFormulario && (
        <Button onClick={() => setMostrarFormulario(true)}>
          <Plus className="w-5 h-5" />
          Nueva Nota
        </Button>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Nueva Nota de Turno</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tu nombre"
              value={formData.autor}
              onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
              placeholder="¿Quién escribe?"
            />

            <Select
              label="Turno"
              value={formData.turno}
              onChange={(e) => setFormData({ ...formData, turno: e.target.value as Turno })}
              options={[
                { value: 'dia', label: '☀️ Turno Día' },
                { value: 'tarde', label: '🌅 Turno Tarde' },
                { value: 'noche', label: '🌙 Turno Noche' },
              ]}
            />

            <Select
              label="Prioridad"
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as Prioridad })}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'alta', label: '⚠️ Alta' },
                { value: 'urgente', label: '🚨 Urgente' },
              ]}
            />

            <div className="md:col-span-3">
              <Textarea
                label="Nota"
                placeholder="Escribe aquí la información que debe saber el siguiente turno..."
                value={formData.nota}
                onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleAgregar} disabled={!formData.autor || !formData.nota}>
              <Plus className="w-4 h-4" />
              Agregar Nota
            </Button>
          </div>
        </Card>
      )}

      {/* Secciones por turno */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Turno Día */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Turno Día</h3>
            <span className="text-sm text-slate-500">({notasDia.length})</span>
          </div>

          {notasDia.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <p className="text-slate-500">No hay notas del turno día</p>
            </Card>
          ) : (
            notasDia.map((nota) => {
              const Icon = getPrioridadIcon(nota.prioridad);
              return (
                <Card 
                  key={nota.id} 
                  className={cn(
                    'p-4 transition-all',
                    !nota.leida && 'ring-2 ring-sprc-orange/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      getPrioridadColor(nota.prioridad)
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-white">{nota.autor}</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium border',
                          getPrioridadColor(nota.prioridad)
                        )}>
                          {nota.prioridad}
                        </span>
                        {!nota.leida && (
                          <span className="px-2 py-0.5 rounded bg-sprc-orange/20 text-sprc-orange text-xs font-medium">
                            Nueva
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-300 whitespace-pre-line text-sm">{nota.nota}</p>
                      
                      <p className="text-xs text-slate-500 mt-2">
                        {format(parseISO(nota.created_at), "HH:mm", { locale: es })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      {!nota.leida && (
                        <button
                          onClick={() => marcarNotaLeida(nota.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => eliminarNota(nota.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Turno Tarde */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sunset className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Turno Tarde</h3>
            <span className="text-sm text-slate-500">({notasTarde.length})</span>
          </div>

          {notasTarde.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <p className="text-slate-500">No hay notas del turno tarde</p>
            </Card>
          ) : (
            notasTarde.map((nota) => {
              const Icon = getPrioridadIcon(nota.prioridad);
              return (
                <Card 
                  key={nota.id} 
                  className={cn(
                    'p-4 transition-all',
                    !nota.leida && 'ring-2 ring-sprc-orange/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      getPrioridadColor(nota.prioridad)
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-white">{nota.autor}</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium border',
                          getPrioridadColor(nota.prioridad)
                        )}>
                          {nota.prioridad}
                        </span>
                        {!nota.leida && (
                          <span className="px-2 py-0.5 rounded bg-sprc-orange/20 text-sprc-orange text-xs font-medium">
                            Nueva
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-300 whitespace-pre-line text-sm">{nota.nota}</p>
                      
                      <p className="text-xs text-slate-500 mt-2">
                        {format(parseISO(nota.created_at), "HH:mm", { locale: es })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      {!nota.leida && (
                        <button
                          onClick={() => marcarNotaLeida(nota.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => eliminarNota(nota.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Turno Noche */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Turno Noche</h3>
            <span className="text-sm text-slate-500">({notasNoche.length})</span>
          </div>

          {notasNoche.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <p className="text-slate-500">No hay notas del turno noche</p>
            </Card>
          ) : (
            notasNoche.map((nota) => {
              const Icon = getPrioridadIcon(nota.prioridad);
              return (
                <Card 
                  key={nota.id} 
                  className={cn(
                    'p-4 transition-all',
                    !nota.leida && 'ring-2 ring-sprc-orange/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      getPrioridadColor(nota.prioridad)
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-white">{nota.autor}</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium border',
                          getPrioridadColor(nota.prioridad)
                        )}>
                          {nota.prioridad}
                        </span>
                        {!nota.leida && (
                          <span className="px-2 py-0.5 rounded bg-sprc-orange/20 text-sprc-orange text-xs font-medium">
                            Nueva
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-300 whitespace-pre-line text-sm">{nota.nota}</p>
                      
                      <p className="text-xs text-slate-500 mt-2">
                        {format(parseISO(nota.created_at), "HH:mm", { locale: es })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      {!nota.leida && (
                        <button
                          onClick={() => marcarNotaLeida(nota.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => eliminarNota(nota.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
