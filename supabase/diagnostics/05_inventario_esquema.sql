-- =============================================================
-- EcoTrueque: inventario del esquema desde el servidor (solo lectura)
-- Ejecutar en Supabase → SQL Editor. Cada bloque devuelve una tabla de resultados;
-- se puede descargar como CSV con el botón «Download» del editor.
-- Sirve como evidencia de lo que realmente está aplicado en la base de datos.
-- =============================================================

-- 1. Tablas, columnas, tipos y restricciones NOT NULL / DEFAULT
SELECT c.table_name, c.ordinal_position, c.column_name, c.data_type, c.udt_name,
       c.is_nullable, c.column_default
FROM information_schema.columns c
JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name
WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
ORDER BY c.table_name, c.ordinal_position;

-- 2. Claves primarias, foráneas, únicas y CHECK
SELECT conrelid::regclass AS tabla, conname AS restriccion,
       CASE contype WHEN 'p' THEN 'PRIMARY KEY' WHEN 'f' THEN 'FOREIGN KEY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' END AS tipo,
       pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace AND contype IN ('p', 'f', 'u', 'c')
ORDER BY tabla::text, tipo, restriccion;

-- 3. Índices
SELECT tablename AS tabla, indexname AS indice, indexdef AS definicion
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. Triggers
SELECT event_object_table AS tabla, trigger_name, action_timing AS momento,
       string_agg(event_manipulation, ', ') AS eventos, action_statement AS accion
FROM information_schema.triggers
WHERE trigger_schema = 'public'
GROUP BY event_object_table, trigger_name, action_timing, action_statement
UNION ALL
SELECT 'auth.users', tgname, 'AFTER', 'INSERT', pg_get_triggerdef(t.oid)
FROM pg_trigger t WHERE t.tgrelid = 'auth.users'::regclass AND NOT t.tgisinternal
ORDER BY 1, 2;

-- 5. Funciones del esquema public
SELECT p.proname AS funcion, pg_get_function_arguments(p.oid) AS argumentos,
       pg_get_function_result(p.oid) AS devuelve,
       CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'INVOKER' END AS seguridad,
       l.lanname AS lenguaje
FROM pg_proc p JOIN pg_language l ON l.oid = p.prolang
WHERE p.pronamespace = 'public'::regnamespace
ORDER BY p.proname;

-- 6. RLS activada por tabla
SELECT relname AS tabla, relrowsecurity AS rls_activada
FROM pg_class
WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
ORDER BY relname;

-- 7. Políticas RLS (tablas y Storage)
SELECT schemaname AS esquema, tablename AS tabla, policyname AS politica, cmd AS operacion,
       qual AS usando, with_check AS con_verificacion
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;

-- 8. Buckets de Storage
SELECT id, public, file_size_limit, allowed_mime_types FROM storage.buckets ORDER BY id;

-- 9. Extensiones instaladas
SELECT extname, extversion FROM pg_extension ORDER BY extname;
