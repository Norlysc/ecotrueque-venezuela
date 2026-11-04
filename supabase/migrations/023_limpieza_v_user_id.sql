-- =============================================================
-- EcoTrueque: limpieza de la tabla accidental public.v_user_id (noviembre 2026)
-- Ejecutar en Supabase SQL Editor
-- =============================================================
-- La exportación del esquema del 4/11/2026 muestra una tabla public.v_user_id (una
-- columna id uuid, sin filas) que no está en ninguna migración. Se crea cuando la línea
--   SELECT id INTO v_user_id FROM public.profiles ...
-- del script 007 se ejecuta fuera de su bloque DO: en SQL, SELECT ... INTO crea una
-- tabla. La aplicación no la usa y la API la expone, por lo que se elimina.

DROP TABLE IF EXISTS public.v_user_id;
