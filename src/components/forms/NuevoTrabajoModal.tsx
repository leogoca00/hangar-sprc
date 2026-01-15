import { useState } from 'react';
import { useHangarStore } from '@/stores/hangarStore';
import { Modal, Button, Input, Select, Textarea, RadioGroup, Checkbox } from '@/components/ui';
import { 
  Truck, 
  Wrench, 
  Users, 
  Clock,
  Save,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  BAHIAS, 
  SISTEMAS_AFECTADOS,
  TIEMPOS_ESTIMADOS,
  type UbicacionTipo,
  type TipoTrabajo,
  type EjecutadoPor,
  type SistemaAfectado,
} from '@/types';

export function NuevoTrabajoModal() {
  const { 
    modalNuevoTrabajo, 
    setModalNuevoTrabajo, 
    camionesDisponibles,
    tecnicos, 
    contratistas,
    tiposTrabajo,
    bahiasOcupadas,
    agregarTrabajo,
    getCamionById,
  } = useHangarStore();
  
  const [step, setStep] = useState(1);
  const ocupadas = bahiasOcupadas();
  const camionesLibres = camionesDisponibles();

  // Form state
  const [formData, setFormData] = useState({
    camion_id: '',
    horometro_entrada: 0,
    ubicacion_tipo: 'bahia' as UbicacionTipo,
    bahia_numero: undefined as number | undefined,
    ubicacion_especifica: '',
    tipo: 'preventivo' as TipoTrabajo,
    paquete_trabajo: [] as string[],
    descripcion_falla: '',
    sistema_afectado: '' as SistemaAfectado | '',
    ejecutado_por: 'tecnico_interno' as EjecutadoPor,
    tecnicos: [] as string[],
    contratista_id: '',
    tiempo_estimado_horas: 4,
    observaciones_iniciales: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      camion_id: '',
      horometro_entrada: 0,
      ubicacion_tipo: 'bahia',
      bahia_numero: undefined,
      ubicacion_especifica: '',
      tipo: 'preventivo',
      paquete_trabajo: [],
      descripcion_falla: '',
      sistema_afectado: '',
      ejecutado_por: 'tecnico_interno',
      tecnicos: [],
      contratista_id: '',
      tiempo_estimado_horas: 4,
      observaciones_iniciales: '',
    });
    setErrors({});
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    setModalNuevoTrabajo(false);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.camion_id) {
      newErrors.camion_id = 'Selecciona un camión';
    }
    if (!formData.horometro_entrada || formData.horometro_entrada <= 0) {
      newErrors.horometro_entrada = 'Ingresa el horómetro';
    }
    if (formData.ubicacion_tipo === 'bahia' && !formData.bahia_numero) {
      newErrors.bahia_numero = 'Selecciona una bahía';
    }
    if (formData.ubicacion_tipo === 'fuera_bahia' && !formData.ubicacion_especifica) {
      newErrors.ubicacion_especifica = 'Selecciona la ubicación';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.tipo === 'correctivo' && !formData.descripcion_falla) {
      newErrors.descripcion_falla = 'Describe la falla';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Preparar datos para enviar
    const trabajoData = {
      camion_id: formData.camion_id,
      ubicacion_tipo: formData.ubicacion_tipo,
      bahia_numero: formData.ubicacion_tipo === 'bahia' ? formData.bahia_numero : undefined,
      ubicacion_especifica: formData.ubicacion_tipo !== 'bahia' ? formData.ubicacion_especifica : undefined,
      tipo: formData.tipo,
      paquete_trabajo: formData.tipo === 'preventivo' ? formData.paquete_trabajo : undefined,
      descripcion_falla: formData.tipo === 'correctivo' ? formData.descripcion_falla : undefined,
      sistema_afectado: formData.tipo === 'correctivo' && formData.sistema_afectado ? formData.sistema_afectado as SistemaAfectado : undefined,
      ejecutado_por: formData.ejecutado_por,
      tecnicos: formData.ejecutado_por === 'tecnico_interno' ? formData.tecnicos : undefined,
      contratista_id: formData.ejecutado_por === 'contratista' ? formData.contratista_id : undefined,
      tiempo_estimado_horas: formData.tiempo_estimado_horas,
      horometro_entrada: formData.horometro_entrada,
      observaciones_iniciales: formData.observaciones_iniciales || undefined,
    };

    agregarTrabajo(trabajoData as any);
    handleClose();
  };

  // Actualizar horómetro cuando se selecciona un camión
  const handleCamionChange = (camionId: string) => {
    const camion = getCamionById(camionId);
    setFormData({
      ...formData,
      camion_id: camionId,
      horometro_entrada: camion?.horometro_actual || 0,
    });
  };

  const tiposPreventivos = tiposTrabajo.filter(t => t.categoria === 'preventivo' && t.activo);
  const tiposCorrectivos = tiposTrabajo.filter(t => t.categoria === 'correctivo' && t.activo);

  return (
    <Modal
      isOpen={modalNuevoTrabajo}
      onClose={handleClose}
      title="Registrar Nuevo Trabajo"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                s === step 
                  ? 'bg-sprc-orange text-white' 
                  : s < step 
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 mx-1 rounded ${s < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Camión y Ubicación */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-sprc-orange mb-4">
              <Truck className="w-5 h-5" />
              <span className="font-semibold">Paso 1: Camión y Ubicación</span>
            </div>

            {/* Selección de camión */}
            <div>
              <Select
                label="Camión"
                value={formData.camion_id}
                onChange={(e) => handleCamionChange(e.target.value)}
                placeholder="Selecciona el camión"
                options={camionesLibres.map(c => ({
                  value: c.id,
                  label: `${c.numero} - ${c.horometro_actual.toLocaleString()} hrs`,
                }))}
                error={errors.camion_id}
              />
              {camionesLibres.length === 0 && (
                <p className="text-sm text-amber-400 mt-2">
                  No hay camiones disponibles. Todos están en mantenimiento.
                </p>
              )}
            </div>

            {/* Horómetro de entrada */}
            <Input
              type="number"
              label="Horómetro de Entrada"
              placeholder="Ej: 6500"
              value={formData.horometro_entrada || ''}
              onChange={(e) => setFormData({ ...formData, horometro_entrada: Number(e.target.value) })}
              error={errors.horometro_entrada}
            />

            {/* Ubicación */}
            <RadioGroup
              name="ubicacion_tipo"
              label="Ubicación del trabajo"
              value={formData.ubicacion_tipo}
              onChange={(v) => setFormData({ ...formData, ubicacion_tipo: v as UbicacionTipo, bahia_numero: undefined, ubicacion_especifica: '' })}
              options={[
                { value: 'bahia', label: 'Bahía del Hangar', description: 'Trabajo dentro del hangar' },
                { value: 'fuera_bahia', label: 'Fuera de Bahía', description: 'Pintura, área externa, etc.' },
                { value: 'otro_departamento', label: 'Otro Departamento', description: 'Telecomunicaciones, etc.' },
              ]}
            />

            {/* Si es bahía, seleccionar número */}
            {formData.ubicacion_tipo === 'bahia' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Selecciona Bahía {errors.bahia_numero && <span className="text-red-400 ml-2">({errors.bahia_numero})</span>}
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {BAHIAS.map((num) => {
                    const estaOcupada = ocupadas.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={estaOcupada}
                        onClick={() => setFormData({ ...formData, bahia_numero: num })}
                        className={`
                          p-3 rounded-xl font-display font-bold text-lg transition-all
                          ${formData.bahia_numero === num
                            ? 'bg-sprc-orange text-white'
                            : estaOcupada
                            ? 'bg-slate-700/30 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                          }
                        `}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Si es fuera de bahía */}
            {formData.ubicacion_tipo === 'fuera_bahia' && (
              <Select
                label="Ubicación específica"
                value={formData.ubicacion_especifica}
                onChange={(e) => setFormData({ ...formData, ubicacion_especifica: e.target.value })}
                options={[
                  { value: 'Zona de Pintura', label: 'Zona de Pintura' },
                  { value: 'Área Externa', label: 'Área Externa' },
                  { value: 'Otro', label: 'Otro' },
                ]}
                error={errors.ubicacion_especifica}
              />
            )}

            {/* Si es otro departamento */}
            {formData.ubicacion_tipo === 'otro_departamento' && (
              <Select
                label="Departamento"
                value={formData.ubicacion_especifica}
                onChange={(e) => setFormData({ ...formData, ubicacion_especifica: e.target.value })}
                options={[
                  { value: 'Telecomunicaciones', label: 'Telecomunicaciones' },
                ]}
              />
            )}

            <div className="flex justify-end">
              <Button type="button" onClick={handleNext}>
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Tipo de trabajo */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-sprc-orange mb-4">
              <Wrench className="w-5 h-5" />
              <span className="font-semibold">Paso 2: Tipo de Trabajo</span>
            </div>

            <RadioGroup
              name="tipo"
              label="Tipo de mantenimiento"
              value={formData.tipo}
              onChange={(v) => setFormData({ ...formData, tipo: v as TipoTrabajo, paquete_trabajo: [], descripcion_falla: '', sistema_afectado: '' })}
              options={[
                { value: 'preventivo', label: 'Preventivo', description: 'Mantenimiento programado' },
                { value: 'correctivo', label: 'Correctivo', description: 'Reparación de falla' },
              ]}
            />

            {/* Si es preventivo */}
            {formData.tipo === 'preventivo' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Paquete de trabajo
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tiposPreventivos.map((tipo) => (
                    <Checkbox
                      key={tipo.id}
                      label={`${tipo.nombre} (${tipo.tiempo_estimado_default}h)`}
                      checked={formData.paquete_trabajo.includes(tipo.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, paquete_trabajo: [...formData.paquete_trabajo, tipo.id] });
                        } else {
                          setFormData({ ...formData, paquete_trabajo: formData.paquete_trabajo.filter(p => p !== tipo.id) });
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Si es correctivo */}
            {formData.tipo === 'correctivo' && (
              <>
                <Select
                  label="Sistema afectado"
                  value={formData.sistema_afectado}
                  onChange={(e) => setFormData({ ...formData, sistema_afectado: e.target.value as SistemaAfectado })}
                  placeholder="Selecciona el sistema"
                  options={Object.entries(SISTEMAS_AFECTADOS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
                <Textarea
                  label="Descripción de la falla"
                  placeholder="Describe la falla reportada..."
                  value={formData.descripcion_falla}
                  onChange={(e) => setFormData({ ...formData, descripcion_falla: e.target.value })}
                  error={errors.descripcion_falla}
                />
              </>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4" /> Atrás
              </Button>
              <Button type="button" onClick={handleNext}>
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Asignación y tiempo */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-sprc-orange mb-4">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Paso 3: Asignación</span>
            </div>

            <RadioGroup
              name="ejecutado_por"
              label="Ejecutado por"
              value={formData.ejecutado_por}
              onChange={(v) => setFormData({ ...formData, ejecutado_por: v as EjecutadoPor, tecnicos: [], contratista_id: '' })}
              options={[
                { value: 'tecnico_interno', label: 'Técnico Interno' },
                { value: 'contratista', label: 'Contratista' },
                { value: 'otro_departamento', label: 'Otro Departamento' },
              ]}
            />

            {/* Si es técnico interno */}
            {formData.ejecutado_por === 'tecnico_interno' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Técnicos asignados
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tecnicos.filter(t => t.activo).map((tecnico) => (
                    <Checkbox
                      key={tecnico.id}
                      label={`${tecnico.nombre} (${tecnico.especialidad})`}
                      checked={formData.tecnicos.includes(tecnico.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, tecnicos: [...formData.tecnicos, tecnico.id] });
                        } else {
                          setFormData({ ...formData, tecnicos: formData.tecnicos.filter(t => t !== tecnico.id) });
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Si es contratista */}
            {formData.ejecutado_por === 'contratista' && (
              <Select
                label="Contratista"
                value={formData.contratista_id}
                onChange={(e) => setFormData({ ...formData, contratista_id: e.target.value })}
                placeholder="Selecciona el contratista"
                options={contratistas.filter(c => c.activo).map(c => ({
                  value: c.id,
                  label: `${c.nombre} - ${c.especialidad}`,
                }))}
              />
            )}

            <div className="flex items-center gap-2 text-sprc-orange mt-6 mb-4">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Tiempo estimado</span>
            </div>

            <Select
              label="Duración estimada"
              value={String(formData.tiempo_estimado_horas)}
              onChange={(e) => setFormData({ ...formData, tiempo_estimado_horas: Number(e.target.value) })}
              options={TIEMPOS_ESTIMADOS.map(t => ({
                value: String(t.value),
                label: t.label,
              }))}
            />

            <Textarea
              label="Observaciones iniciales (opcional)"
              placeholder="Notas adicionales..."
              value={formData.observaciones_iniciales}
              onChange={(e) => setFormData({ ...formData, observaciones_iniciales: e.target.value })}
            />

            <div className="flex justify-between pt-4 border-t border-slate-700/30">
              <Button type="button" variant="ghost" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4" /> Atrás
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={handleClose}>
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSubmit}>
                  <Save className="w-4 h-4" />
                  Registrar Trabajo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
