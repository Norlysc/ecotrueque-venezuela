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
import { Send, Mail, Lock } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Logo } from '@components/ui/LogoSVG';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';
import { useAuth } from '@hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { signIn, signInWithMagicLink, isLoading } = useAuth();
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const { control, handleSubmit, getValues, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    await signIn(data.email, data.password);
  };

  const handleMagicLink = async () => {
    const email = getValues('email');
    if (!email) return;
    await signInWithMagicLink(email);
    setMagicLinkSent(true);
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
        {/* Header gradiente */}
        <LinearGradient
          colors={['#0F6E56', '#1D9E75', '#5DCAA5']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <Logo iconSize={76} onDark showTagline />
        </LinearGradient>

        {/* Formulario */}
        <View style={[styles.form, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.text }]}>Bienvenido de vuelta</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Inicia sesión para continuar
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Contraseña"
                placeholder="Tu contraseña"
                value={value}
                onChangeText={onChange}
                isPassword
                leftIcon={Lock}
                error={errors.password?.message}
                isDark={isDark}
              />
            )}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotBtn}
          >
            <Text style={[styles.forgotText, { color: COLORS.primary }]}>
              ¿Olvidé mi contraseña?
            </Text>
          </TouchableOpacity>

          <Button
            label="Iniciar sesión"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            size="lg"
            isLoading={isLoading}
            fullWidth
          />

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textTertiary }]}>o</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <Button
            label={magicLinkSent ? '✓ Enlace enviado a tu email' : 'Entrar con enlace mágico'}
            onPress={handleMagicLink}
            variant="outline"
            size="lg"
            icon={Send}
            fullWidth
            disabled={magicLinkSent}
          />

          {/* Card eco */}
          <View style={[styles.ecoCard, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}>
            <Text style={styles.ecoEmoji}>🌍</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ecoTitle, { color: COLORS.primaryDark }]}>
                Comunidad EcoTrueque
              </Text>
              <Text style={[styles.ecoText, { color: COLORS.primary }]}>
                2,400 kg de CO₂ evitados juntos
              </Text>
            </View>
          </View>

          {/* Link registro */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: theme.textSecondary }]}>
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: COLORS.primary }]}>
                Regístrate gratis
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: SPACING.base,
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
  title: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.base,
    marginBottom: SPACING['2xl'],
  },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -SPACING.sm, marginBottom: SPACING.base },
  forgotText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.base,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: SPACING.md, fontSize: TYPOGRAPHY.size.sm },
  ecoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginTop: SPACING.base,
    gap: SPACING.sm,
  },
  ecoEmoji: { fontSize: 28 },
  ecoTitle: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  ecoText: { fontSize: TYPOGRAPHY.size.sm },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  registerText: { fontSize: TYPOGRAPHY.size.base },
  registerLink: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
});
