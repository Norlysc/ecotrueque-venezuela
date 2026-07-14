import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mail, Send, RefreshCw } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';
import { useAuth } from '@hooks/useAuth';

const schema = z.object({
  email: z.string().email('Ingresa un email válido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { resetPassword, isLoading } = useAuth();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    await resetPassword(data.email);
    setSentEmail(data.email);
    setSent(true);
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#fff" strokeWidth={1.75} />
          </TouchableOpacity>
          <Text style={styles.emoji}>🔑</Text>
          <Text style={styles.headerTitle}>Recuperar contraseña</Text>
        </LinearGradient>

        <View style={[styles.form, { backgroundColor: theme.background }]}>
          {!sent ? (
            <>
              <Text style={[styles.title, { color: theme.text }]}>
                ¿Olvidaste tu contraseña?
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Ingresa tu email y te enviaremos un enlace para restablecerla.
              </Text>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Correo electrónico"
                    placeholder="tu@email.com"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={Mail}
                    error={errors.email?.message}
                    isDark={isDark}
                  />
                )}
              />

              <Button
                label="Enviar enlace de recuperación"
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                size="lg"
                icon={Send}
                isLoading={isLoading}
                fullWidth
              />
            </>
          ) : (
            <>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>📧</Text>
              </View>
              <Text style={[styles.title, { color: theme.text }]}>
                ¡Correo enviado!
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Enviamos las instrucciones a{' '}
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>{sentEmail}</Text>
              </Text>

              {/* Pasos */}
              <View style={[styles.stepsCard, { backgroundColor: isDark ? '#1A1A18' : '#F8F9FA' }]}>
                {[
                  { n: '1', text: 'Abre tu aplicación de correo' },
                  { n: '2', text: 'Busca el email de EcoTrueque' },
                  { n: '3', text: 'Haz clic en "Restablecer contraseña"' },
                  { n: '4', text: 'Crea una nueva contraseña segura' },
                ].map((step) => (
                  <View key={step.n} style={styles.stepRow}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{step.n}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.textSecondary }]}>{step.text}</Text>
                  </View>
                ))}
              </View>

              <Button
                label={countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar correo'}
                onPress={handleSubmit(onSubmit)}
                variant="outline"
                size="lg"
                icon={RefreshCw}
                isLoading={isLoading}
                disabled={countdown > 0}
                fullWidth
              />
            </>
          )}

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.backToLogin}>
            <ArrowLeft size={16} color={COLORS.primary} strokeWidth={1.75} />
            <Text style={[styles.backToLoginText, { color: COLORS.primary }]}>
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
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
  backBtn: { position: 'absolute', left: SPACING.base, top: 56, padding: SPACING.sm },
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
  successIcon: { alignItems: 'center', marginBottom: SPACING.base },
  successEmoji: { fontSize: 64 },
  title: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.sm,
  },
  subtitle: { fontSize: TYPOGRAPHY.size.base, lineHeight: 24, marginBottom: SPACING['2xl'] },
  stepsCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING['2xl'],
    gap: SPACING.md,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold },
  stepText: { flex: 1, fontSize: TYPOGRAPHY.size.base },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
  },
  backToLoginText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium },
});
