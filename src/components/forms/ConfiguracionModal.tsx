import { useState } from 'react';
import { useHangarStore } from '@/stores/hangarStore';
import { Modal, Button, Input, Select, Badge } from '@/components/ui';
import { 
  Users, 
  Building2, 
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Power,
  PowerOff
} from 'lucide-react';
import { ESPECIALIDADES_TECNICO, TURNOS } from '@/types';
import type { EspecialidadTecnico, Turno } from '@/types';

type Tab = 'tecnicos' | 'contratistas' | 'tipos';

export function ConfiguracionModal() {
  const { 
    modalConfiguracion, 
    setModalConfiguracion,
    tecnicos,
    contratistas,
    tiposTrabajo,
    agregarTecnico,
    actualizarTecnico,
    toggleTecnicoActivo,
    eliminarTecnico,
    agregarContratista,
    actualizarContratista,
    toggleContratistaActivo,
    eliminarContratista,
    agregarTipoTrabajo,
    actualizarTipoTrabajo,
    toggleTipoTrabajoActivo,
    eliminarTipoTrabajo,
  } = useHangarStore();

  const [activeTab, setActiveTab] = useState<Tab>('tecnicos');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [tecnicoForm, setTecnicoForm] = useState({ nombre: '', especialidad: 'mecanico' as EspecialidadTecnico, turno: 'dia' as Turno });
  const [contratistaForm, setContratistaForm] = useState({ nombre: '', especialidad: '', contacto: '' });
  const [tipoTrabajoForm, setTipoTrabajoForm] = useState({ nombre: '', categoria: 'preventivo' as 'preventivo' | 'correctivo', tiempo_estimado_default: 2 });

  const handleClose = () => {
    setModalConfiguracion(false);
    setEditingId(null);
    setIsAdding(false);
  };

  const resetForms = () => {
    setTecnicoForm({ nombre: '', especialidad: 'mecanico', turno: 'dia' });
    setContratistaForm({ nombre: '', especialidad: '', contacto: '' });
    setTipoTrabajoForm({ nombre: '', categoria: 'preventivo', tiempo_estimado_default: 2 });
    setIsAdding(false);
    setEditingId(null);
  };

  // Técnicos handlers
  const handleAddTecnico = () => {
    if (!tecnicoForm.nombre.trim()) return;
    agregarTecnico(tecnicoForm);
    resetForms();
  };

  const handleUpdateTecnico = (id: string) => {
    if (!tecnicoForm.nombre.trim()) return;
    actualizarTecnico(id, tecnicoForm);
    resetForms();
  };

  const startEditTecnico = (tecnico: typeof tecnicos[0]) => {
    setTecnicoForm({ nombre: tecnico.nombre, especialidad: tecnico.especialidad, turno: tecnico.turno });
    setEditingId(tecnico.id);
    setIsAdding(false);
  };

  // Contratistas handlers
  const handleAddContratista = () => {
    if (!contratistaForm.nombre.trim()) return;
    agregarContratista(contratistaForm);
    resetForms();
  };

  const handleUpdateContratista = (id: string) => {
    if (!contratistaForm.nombre.trim()) return;
    actualizarContratista(id, contratistaForm);
    resetForms();
  };

  const startEditContratista = (contratista: typeof contratistas[0]) => {
    setContratistaForm({ nombre: contratista.nombre, especialidad: contratista.especialidad, contacto: contratista.contacto || '' });
    setEditingId(contratista.id);
    setIsAdding(false);
  };

  // Tipos de trabajo handlers
  const handleAddTipoTrabajo = () => {
    if (!tipoTrabajoForm.nombre.trim()) return;
    agregarTipoTrabajo(tipoTrabajoForm);
    resetForms();
  };

  const handleUpdateTipoTrabajo = (id: string) => {
    if (!tipoTrabajoForm.nombre.trim()) return;
    actualizarTipoTrabajo(id, tipoTrabajoForm);
    resetForms();
  };

  const startEditTipoTrabajo = (tipo: typeof tiposTrabajo[0]) => {
    setTipoTrabajoForm({ 
      nombre: tipo.nombre, 
      categoria: tipo.categoria, 
      tiempo_estimado_default: tipo.tiempo_estimado_default || 2 
    });
    setEditingId(tipo.id);
    setIsAdding(false);
  };

  const tabs = [
    { id: 'tecnicos' as Tab, label: 'Técnicos', icon: Users, count: tecnicos.length },
    { id: 'contratistas' as Tab, label: 'Contratistas', icon: Building2, count: contratistas.length },
    { id: 'tipos' as Tab, label: 'Tipos de Trabajo', icon: Wrench, count: tiposTrabajo.length },
  ];

  return (
    <Modal
      isOpen={modalConfiguracion}
      onClose={handleClose}
      title="Configuración"
      size="xl"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700/30 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); resetForms(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-sprc-orange text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-700/50 text-xs">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* ==================== TÉCNICOS ==================== */}
        {activeTab === 'tecnicos' && (
          <>
            {/* Add button */}
            {!isAdding && !editingId && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="w-4 h-4" />
                Agregar Técnico
              </Button>
            )}

            {/* Add/Edit form */}
            {(isAdding || editingId) && (
              <div className="p-4 rounded-xl bg-slate-800/50 space-y-4">
                <h4 className="font-medium text-white">
                  {isAdding ? 'Nuevo Técnico' : 'Editar Técnico'}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Nombre"
                    value={tecnicoForm.nombre}
                    onChange={(e) => setTecnicoForm({ ...tecnicoForm, nombre: e.target.value })}
                    placeholder="Nombre completo"
                  />
                  <Select
                    label="Especialidad"
                    value={tecnicoForm.especialidad}
                    onChange={(e) => setTecnicoForm({ ...tecnicoForm, especialidad: e.target.value as EspecialidadTecnico })}
                    options={Object.entries(ESPECIALIDADES_TECNICO).map(([value, label]) => ({ value, label }))}
                  />
                  <Select
                    label="Turno"
                    value={tecnicoForm.turno}
                    onChange={(e) => setTecnicoForm({ ...tecnicoForm, turno: e.target.value as Turno })}
                    options={Object.entries(TURNOS).map(([value, label]) => ({ value, label }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={resetForms}>
                    <X className="w-4 h-4" /> Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => editingId ? handleUpdateTecnico(editingId) : handleAddTecnico()}
                  >
                    <Check className="w-4 h-4" /> {editingId ? 'Guardar' : 'Agregar'}
                  </Button>
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-2">
              {tecnicos.map((tecnico) => (
                <div
                  key={tecnico.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    tecnico.activo 
                      ? 'bg-slate-800/30 border-slate-700/30' 
                      : 'bg-slate-800/10 border-slate-700/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${tecnico.activo ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    <div>
                      <p className="font-medium text-white">{tecnico.nombre}</p>
                      <p className="text-xs text-slate-400">
                        {ESPECIALIDADES_TECNICO[tecnico.especialidad]} • Turno {TURNOS[tecnico.turno]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleTecnicoActivo(tecnico.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        tecnico.activo 
                          ? 'text-emerald-400 hover:bg-emerald-500/20' 
                          : 'text-slate-500 hover:bg-slate-700/50'
                      }`}
                      title={tecnico.activo ? 'Desactivar' : 'Activar'}
                    >
                      {tecnico.activo ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEditTecnico(tecnico)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarTecnico(tecnico.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ==================== CONTRATISTAS ==================== */}
        {activeTab === 'contratistas' && (
          <>
            {!isAdding && !editingId && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="w-4 h-4" />
                Agregar Contratista
              </Button>
            )}

            {(isAdding || editingId) && (
              <div className="p-4 rounded-xl bg-slate-800/50 space-y-4">
                <h4 className="font-medium text-white">
                  {isAdding ? 'Nuevo Contratista' : 'Editar Contratista'}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Nombre / Empresa"
                    value={contratistaForm.nombre}
                    onChange={(e) => setContratistaForm({ ...contratistaForm, nombre: e.target.value })}
                    placeholder="Nombre de la empresa"
                  />
                  <Input
                    label="Especialidad"
                    value={contratistaForm.especialidad}
                    onChange={(e) => setContratistaForm({ ...contratistaForm, especialidad: e.target.value })}
                    placeholder="Ej: Pintura, Hidráulicos..."
                  />
                  <Input
                    label="Contacto"
                    value={contratistaForm.contacto}
                    onChange={(e) => setContratistaForm({ ...contratistaForm, contacto: e.target.value })}
                    placeholder="Teléfono"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={resetForms}>
                    <X className="w-4 h-4" /> Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => editingId ? handleUpdateContratista(editingId) : handleAddContratista()}
                  >
                    <Check className="w-4 h-4" /> {editingId ? 'Guardar' : 'Agregar'}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {contratistas.map((contratista) => (
                <div
                  key={contratista.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    contratista.activo 
                      ? 'bg-slate-800/30 border-slate-700/30' 
                      : 'bg-slate-800/10 border-slate-700/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${contratista.activo ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    <div>
                      <p className="font-medium text-white">{contratista.nombre}</p>
                      <p className="text-xs text-slate-400">
                        {contratista.especialidad} {contratista.contacto && `• ${contratista.contacto}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleContratistaActivo(contratista.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        contratista.activo 
                          ? 'text-emerald-400 hover:bg-emerald-500/20' 
                          : 'text-slate-500 hover:bg-slate-700/50'
                      }`}
                    >
                      {contratista.activo ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEditContratista(contratista)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarContratista(contratista.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ==================== TIPOS DE TRABAJO ==================== */}
        {activeTab === 'tipos' && (
          <>
            {!isAdding && !editingId && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="w-4 h-4" />
                Agregar Tipo de Trabajo
              </Button>
            )}

            {(isAdding || editingId) && (
              <div className="p-4 rounded-xl bg-slate-800/50 space-y-4">
                <h4 className="font-medium text-white">
                  {isAdding ? 'Nuevo Tipo de Trabajo' : 'Editar Tipo de Trabajo'}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Nombre"
                    value={tipoTrabajoForm.nombre}
                    onChange={(e) => setTipoTrabajoForm({ ...tipoTrabajoForm, nombre: e.target.value })}
                    placeholder="Ej: Cambio de aceite..."
                  />
                  <Select
                    label="Categoría"
                    value={tipoTrabajoForm.categoria}
                    onChange={(e) => setTipoTrabajoForm({ ...tipoTrabajoForm, categoria: e.target.value as 'preventivo' | 'correctivo' })}
                    options={[
                      { value: 'preventivo', label: 'Preventivo' },
                      { value: 'correctivo', label: 'Correctivo' },
                    ]}
                  />
                  <Input
                    type="number"
                    label="Tiempo estimado (horas)"
                    value={tipoTrabajoForm.tiempo_estimado_default}
                    onChange={(e) => setTipoTrabajoForm({ ...tipoTrabajoForm, tiempo_estimado_default: Number(e.target.value) })}
                    placeholder="2"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={resetForms}>
                    <X className="w-4 h-4" /> Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => editingId ? handleUpdateTipoTrabajo(editingId) : handleAddTipoTrabajo()}
                  >
                    <Check className="w-4 h-4" /> {editingId ? 'Guardar' : 'Agregar'}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {tiposTrabajo.map((tipo) => (
                <div
                  key={tipo.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    tipo.activo 
                      ? 'bg-slate-800/30 border-slate-700/30' 
                      : 'bg-slate-800/10 border-slate-700/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${tipo.activo ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{tipo.nombre}</p>
                        <Badge variant={tipo.categoria === 'preventivo' ? 'preventivo' : 'correctivo'}>
                          {tipo.categoria}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">
                        Tiempo estimado: {tipo.tiempo_estimado_default}h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleTipoTrabajoActivo(tipo.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        tipo.activo 
                          ? 'text-emerald-400 hover:bg-emerald-500/20' 
                          : 'text-slate-500 hover:bg-slate-700/50'
                      }`}
                    >
                      {tipo.activo ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEditTipoTrabajo(tipo)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarTipoTrabajo(tipo.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
