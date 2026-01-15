-- ============================================
-- HABILITAR REALTIME EN SUPABASE
-- ============================================
-- Ejecuta esto en el SQL Editor de Supabase
-- DESPUÉS de haber creado las tablas

-- Habilitar realtime para las tablas principales
alter publication supabase_realtime add table trabajos;
alter publication supabase_realtime add table programacion;
alter publication supabase_realtime add table notas_turno;
alter publication supabase_realtime add table camiones;
alter publication supabase_realtime add table tecnicos;
alter publication supabase_realtime add table contratistas;

-- Verificar que las tablas están habilitadas
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
