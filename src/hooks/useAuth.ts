import { useState } from 'react';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@stores/authStore';

const SUPABASE_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos',
  'Email not confirmed': 'Confirma tu email antes de iniciar sesión',
  'User already registered': 'Ya existe una cuenta con este email',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'Unable to validate email address: invalid format': 'El formato del email no es válido',
  'For security purposes, you can only request this after': 'Espera un momento antes de reenviar el correo',
  'Token has expired or is invalid': 'El enlace expiró. Solicita uno nuevo',
  'signup_disabled': 'El registro está desactivado temporalmente',
  'email rate limit exceeded': 'Demasiados intentos. Espera unos minutos e intenta de nuevo',
  'over_email_send_rate_limit': 'Demasiados intentos. Espera unos minutos e intenta de nuevo',
};

const translateError = (errorMessage: string): string => {
  for (const [key, value] of Object.entries(SUPABASE_ERROR_MAP)) {
    if (errorMessage.includes(key)) return value;
  }
  return 'Ocurrió un error. Por favor intenta de nuevo';
};

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { clear } = useAuthStore();

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => {
    setIsLoading(true);
    try {
      await authService.signUp(email, password, fullName, phone);
      Toast.show({
        type: 'success',
        text1: '¡Cuenta creada!',
        text2: 'Revisa tu email para confirmar tu cuenta',
      });
      router.replace('/(auth)/login');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al registrarse',
        text2: translateError(error.message ?? ''),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al iniciar sesión',
        text2: translateError(error.message ?? ''),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.signInWithMagicLink(email);
      Toast.show({
        type: 'success',
        text1: '¡Enlace enviado!',
        text2: `Revisa ${email} para acceder`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al enviar enlace',
        text2: translateError(error.message ?? ''),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(email);
      Toast.show({
        type: 'success',
        text1: 'Correo enviado',
        text2: 'Revisa tu bandeja de entrada',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al enviar correo',
        text2: translateError(error.message ?? ''),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      clear();
      router.replace('/(auth)/login');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al cerrar sesión',
        text2: 'Por favor intenta de nuevo',
      });
    }
  };

  return { signUp, signIn, signInWithMagicLink, resetPassword, signOut, isLoading };
}
