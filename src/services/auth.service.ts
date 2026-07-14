import { Platform } from 'react-native';
import { supabase } from '@lib/supabase';
import type { UserProfile } from '@/types/app.types';

export const authService = {
  async signUp(
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone ?? null } },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'ecotrueque://reset-password',
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as UserProfile;
  },

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as UserProfile;
  },

  async uploadAvatar(userId: string, uri: string): Promise<string> {
    // Detect extension from URI (strip query params first)
    const cleanUri = uri.split('?')[0];
    const rawExt = cleanUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg';
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const path = `${userId}/avatar.${ext}`;

    let uploadPayload: Blob | FormData;

    if (Platform.OS === 'web') {
      // En web, la URI es un blob:// o data: URL — fetch la convierte a Blob
      const response = await fetch(uri);
      uploadPayload = await response.blob();
    } else {
      // En nativo, usar FormData con la URI del filesystem local
      const formData = new FormData();
      formData.append('file', { uri, name: `avatar.${ext}`, type: contentType } as any);
      uploadPayload = formData;
    }

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, uploadPayload, { contentType, upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    return publicUrl;
  },
};
