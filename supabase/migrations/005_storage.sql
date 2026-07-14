-- ============================================
-- EcoTrueque Venezuela - Storage Buckets
-- ============================================

-- Bucket: avatars (máximo 5MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: listings (máximo 10MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listings',
  'listings',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Bucket: messages (máximo 10MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'messages',
  'messages',
  FALSE,  -- Privado: solo los participantes pueden verlo
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- POLÍTICAS STORAGE: avatars
-- ============================================
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_auth_upload" ON storage.objects;
CREATE POLICY "avatars_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "avatars_own_update" ON storage.objects;
CREATE POLICY "avatars_own_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "avatars_own_delete" ON storage.objects;
CREATE POLICY "avatars_own_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ============================================
-- POLÍTICAS STORAGE: listings
-- ============================================
DROP POLICY IF EXISTS "listings_public_read" ON storage.objects;
CREATE POLICY "listings_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listings');

DROP POLICY IF EXISTS "listings_auth_upload" ON storage.objects;
CREATE POLICY "listings_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'listings' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "listings_own_update" ON storage.objects;
CREATE POLICY "listings_own_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'listings' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "listings_own_delete" ON storage.objects;
CREATE POLICY "listings_own_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'listings' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ============================================
-- POLÍTICAS STORAGE: messages (privado)
-- ============================================
DROP POLICY IF EXISTS "messages_auth_read" ON storage.objects;
CREATE POLICY "messages_auth_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'messages' AND
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "messages_auth_upload" ON storage.objects;
CREATE POLICY "messages_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'messages' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );
