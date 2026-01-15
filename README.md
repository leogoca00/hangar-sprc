# 🏭 Hangar SPRC - Sistema de Gestión de Mantenimiento

Sistema de gestión de mantenimiento para la flota de 82 Terminal Tractors del Hangar SPRC (Sociedad Portuaria Regional de Cartagena).

![Preview](https://via.placeholder.com/800x400/0A1628/F97316?text=Hangar+SPRC)

## 🚀 Inicio Rápido

### 1. Clonar e instalar dependencias

```bash
# Clonar el repositorio
git clone <tu-repo>
cd hangar-sprc

# Instalar dependencias
npm install
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus credenciales de Supabase
# VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 4. Build para producción

```bash
npm run build
npm run preview
```

## 📦 Despliegue en Vercel

### Opción 1: Desde GitHub

1. Sube el código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa el repositorio
4. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. ¡Deploy!

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en el dashboard de Vercel
```

## 🗄️ Configuración de Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la URL y la ANON KEY desde Settings > API

### 2. Crear tablas

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Tabla de camiones
CREATE TABLE camiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(10) UNIQUE NOT NULL,
  modelo VARCHAR(100),
  horometro_actual INTEGER DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'operativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de técnicos
CREATE TABLE tecnicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  especialidad VARCHAR(20) NOT NULL,
  turno VARCHAR(20) DEFAULT 'principal',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de contratistas
CREATE TABLE contratistas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  especialidad VARCHAR(100),
  contacto VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de trabajos de mantenimiento
CREATE TABLE trabajos_mantenimiento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  camion_id UUID REFERENCES camiones(id),
  ubicacion_tipo VARCHAR(20) NOT NULL,
  bahia_numero INTEGER,
  ubicacion_especifica VARCHAR(100),
  tipo VARCHAR(20) NOT NULL,
  paquete_trabajo TEXT[],
  descripcion_falla TEXT,
  sistema_afectado VARCHAR(30),
  ejecutado_por VARCHAR(20) NOT NULL,
  tecnicos UUID[],
  contratista_id UUID REFERENCES contratistas(id),
  departamento_externo VARCHAR(50),
  fecha_entrada DATE NOT NULL,
  hora_entrada TIME NOT NULL,
  fecha_salida DATE,
  hora_salida TIME,
  tiempo_estimado_horas NUMERIC(5,2),
  estado VARCHAR(30) DEFAULT 'en_proceso',
  progreso_estimado INTEGER DEFAULT 0,
  horometro_entrada INTEGER,
  horometro_salida INTEGER,
  repuestos_utilizados JSONB,
  observaciones_iniciales TEXT,
  observaciones_finales TEXT,
  estado_final_camion VARCHAR(20),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notas de turno
CREATE TABLE notas_turno (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  turno VARCHAR(20) NOT NULL,
  tecnico_id UUID REFERENCES tecnicos(id),
  nota TEXT NOT NULL,
  prioridad VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar los 82 camiones
INSERT INTO camiones (numero, modelo, horometro_actual)
SELECT 
  'TT-' || LPAD(generate_series::TEXT, 3, '0'),
  'Kalmar Ottawa T2',
  FLOOR(RANDOM() * 15000 + 2000)::INTEGER
FROM generate_series(1, 82);

-- Habilitar Row Level Security
ALTER TABLE camiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_turno ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (ajustar según necesidad de autenticación)
CREATE POLICY "Allow all" ON camiones FOR ALL USING (true);
CREATE POLICY "Allow all" ON tecnicos FOR ALL USING (true);
CREATE POLICY "Allow all" ON contratistas FOR ALL USING (true);
CREATE POLICY "Allow all" ON trabajos_mantenimiento FOR ALL USING (true);
CREATE POLICY "Allow all" ON notas_turno FOR ALL USING (true);
```

### 3. Habilitar Realtime (opcional)

En el dashboard de Supabase:
1. Ve a Database > Replication
2. Activa realtime para las tablas que quieras sincronizar en tiempo real

## 🛠️ Tecnologías

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **Supabase** - Backend (PostgreSQL + Auth + Realtime)
- **React Hook Form + Zod** - Forms & Validation
- **Lucide React** - Icons
- **date-fns** - Date utilities

## 📁 Estructura del Proyecto

```
hangar-sprc/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes reutilizables
│   │   ├── layout/       # Header, Sidebar, etc.
│   │   ├── hangar/       # Componentes específicos del hangar
│   │   ├── dashboard/    # Estadísticas y gráficos
│   │   └── forms/        # Formularios y modales
│   ├── stores/           # Estado global (Zustand)
│   ├── lib/              # Utilidades y cliente Supabase
│   ├── types/            # Tipos TypeScript
│   ├── hooks/            # Custom hooks
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Características

- ✅ Vista de 7 bahías del hangar en tiempo real
- ✅ Registro de trabajos preventivos y correctivos
- ✅ Seguimiento de trabajos fuera del hangar (Pintura, Telecomunicaciones)
- ✅ Asignación de técnicos y contratistas
- ✅ Tracking de progreso y tiempos
- ✅ Indicadores de disponibilidad de flota
- ✅ Alertas de trabajos retrasados
- ✅ Interfaz responsive para tablet y desktop

## 📝 Sectores/Ubicaciones

- **Hangar**: Bahías 1-7
- **Zona de Pintura**: Trabajos de pintura y acabados
- **Área Externa**: Trabajos menores fuera del hangar
- **Telecomunicaciones**: GPS, radios, sistemas de comunicación

## 🔒 Seguridad

- Variables de entorno para credenciales
- Row Level Security en Supabase
- Validación de formularios con Zod

## 📄 Licencia

MIT License - Uso libre para SPRC

---

Desarrollado con ❤️ para SPRC Cartagena
