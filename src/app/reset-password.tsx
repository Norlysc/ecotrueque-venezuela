import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Check, RefreshCw, LockKeyhole } from 'lucide-react-native';
import { IconTile } from '@components/ui/IconTile';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Logo } from '@components/ui/LogoSVG';
import { UniversityBadge } from '@components/ui/UniversityBadge';
import { BrandBackground } from '@components/ui/BrandBackground';
import { authService } from '@services/auth.service';
import { useAuthStore } from '@stores/authStore';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';

const schema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { session, isLoading, setPasswordRecovery } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await authService.updatePassword(data.password);
      setPasswordRecovery(false);
      Toast.show({
        type: 'success',
        text1: 'Contraseña actualizada',
        text2: 'Ya puedes usar tu nueva contraseña',
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg: string = error?.message ?? '';
      Toast.show({
        type: 'error',
        text1: 'No se pudo cambiar la contraseña',
        text2: msg.includes('different from the old')
          ? 'La nueva contraseña debe ser distinta a la anterior'
          : msg || 'Intenta de nuevo',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING['2xl'] }} />;
    }

    // Sin sesión: el enlace venció, ya se usó o se abrió directamente esta página
    if (!session) {
      return (
        <>
          <Text style={[styles.title, { color: theme.text }]}>Enlace no válido o vencido</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Los enlaces de recuperación solo sirven una vez y por tiempo limitado.
            Solicita uno nuevo y ábrelo desde el correo más reciente.
          </Text>
          <Button
            label="Solicitar un enlace nuevo"
            onPress={() => router.replace('/(auth)/forgot-password')}
            variant="primary"
            size="lg"
            icon={RefreshCw}
            fullWidth
          />
        </>
      );
    }

    return (
      <>
        <Text style={[styles.title, { color: theme.text }]}>Crea tu nueva contraseña</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Para la cuenta{' '}
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>{session.user.email}</Text>
        </Text>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Nueva contraseña"
              placeholder="Mínimo 6 caracteres"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              leftIcon={Lock}
              isPassword
              error={errors.password?.message}
              isDark={isDark}
            />
          )}
        />

        <Controller
          control={control}
          name="confirm"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirmar contraseña"
              placeholder="Repite la contraseña"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              leftIcon={Lock}
              isPassword
              error={errors.confirm?.message}
              isDark={isDark}
            />
          )}
        />

        <Button
          label="Guardar contraseña"
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="lg"
          icon={Check}
          isLoading={saving}
          fullWidth
        />
      </>
    );
  };

  // ── Web: gradiente de fondo + tarjeta flotante centrada (igual que login) ──
  if (Platform.OS === 'web') {
    return (
      <BrandBackground style={styles.webBackground}>
        <ScrollView
          contentContainerStyle={styles.webScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <UniversityBadge />

          <View style={styles.webLogoWrapper}>
            <Logo iconSize={72} onDark showTagline />
          </View>

          <View style={[styles.webCard, { backgroundColor: theme.background }]}>
            {renderBody()}
          </View>
        </ScrollView>
      </BrandBackground>
    );
  }

  // ── Móvil ──
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#0F6E56', '#1D9E75']}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <UniversityBadge style={{ marginTop: 40 }} />
          <IconTile icon={LockKeyhole} size={64} iconSize={30} variant="onDark" rounded style={{ marginTop: SPACING.lg }} />
          <Text style={styles.headerTitle}>Restablecer contraseña</Text>
        </LinearGradient>

        <View style={[styles.form, { backgroundColor: theme.background }]}>
          {renderBody()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING['2xl'],
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginTop: SPACING.lg },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginTop: SPACING.sm,
  },
  form: {
    flex: 1,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -20,
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
  },
  // Web
  webBackground: { flex: 1 },
  webScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  webLogoWrapper: {
    marginBottom: 28,
    alignItems: 'center',
  },
  webCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    paddingHorizontal: 36,
    paddingTop: 36,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: { fontSize: TYPOGRAPHY.size.base, lineHeight: 24, marginBottom: SPACING['2xl'] },
});
