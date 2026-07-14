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
import { ArrowLeft, Check, CheckCircle, ArrowRight, UserPlus, User, Mail, Phone, MapPin, Lock, Shield } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';
import { useAuth } from '@hooks/useAuth';

const VENEZUELA_STATES = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón',
  'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta',
  'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Vargas', 'Yaracuy',
  'Zulia', 'Dependencias Federales',
];

const step1Schema = z.object({
  full_name: z.string().min(2, 'Nombre muy corto').max(60, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .regex(/^(\+58|0)(4(12|14|16|24|26))\d{7}$/, 'Formato: 04XX-XXXXXXX o +584XXXXXXXXX')
    .optional()
    .or(z.literal('')),
  state: z.string().min(1, 'Selecciona un estado'),
  city: z.string().min(2, 'Ingresa tu ciudad'),
});

const step2Schema = z.object({
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirm_password: z.string(),
  accept_terms: z.boolean().refine((v) => v, 'Debes aceptar los términos'),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'];
  const colors = ['#E24B4A', '#EF9F27', '#EF9F27', '#1D9E75', '#1D9E75', '#0F6E56'];
  return { score, label: labels[score], color: colors[score] };
};

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { signUp, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Form | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);

  const form1 = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { full_name: '', email: '', phone: '', state: '', city: '' },
  });

  const form2 = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { password: '', confirm_password: '', accept_terms: false },
  });

  const handleStep1 = async (data: Step1Form) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2 = async (data: Step2Form) => {
    console.log('[Register] handleStep2 → validación OK, step1Data:', step1Data ? 'presente' : 'NULL');
    console.log('[Register] password length:', data.password.length, 'accept_terms:', data.accept_terms);
    if (!step1Data) {
      console.log('[Register] ERROR: step1Data es null, abortando');
      return;
    }
    await signUp(step1Data.email, data.password, step1Data.full_name, step1Data.phone || undefined);
  };

  const strength = getPasswordStrength(password);

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
        {/* Header */}
        <LinearGradient
          colors={['#0F6E56', '#1D9E75']}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity
            onPress={() => (step === 2 ? setStep(1) : router.back())}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color="#fff" strokeWidth={1.75} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear cuenta</Text>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
          <Text style={styles.stepText}>Paso {step} de 2</Text>
        </LinearGradient>

        <View style={[styles.form, { backgroundColor: theme.background }]}>
          {step === 1 ? (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Tus datos</Text>

              <Controller
                control={form1.control}
                name="full_name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Nombre completo"
                    placeholder="Juan Pérez"
                    value={value}
                    onChangeText={onChange}
                    leftIcon={User}
                    error={form1.formState.errors.full_name?.message}
                    isDark={isDark}
                  />
                )}
              />

              <Controller
                control={form1.control}
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
                    error={form1.formState.errors.email?.message}
                    isDark={isDark}
                  />
                )}
              />

              <Controller
                control={form1.control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Teléfono (opcional)"
                    placeholder="0414-1234567"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    leftIcon={Phone}
                    error={form1.formState.errors.phone?.message}
                    isDark={isDark}
                  />
                )}
              />

              {/* Estados Venezuela */}
              <Text style={[styles.label, { color: theme.textSecondary }]}>Estado</Text>
              <Controller
                control={form1.control}
                name="state"
                render={({ field: { onChange, value } }) => (
                  <>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.statesScroll}
                      contentContainerStyle={styles.statesContent}
                    >
                      {VENEZUELA_STATES.map((s) => (
                        <TouchableOpacity
                          key={s}
                          onPress={() => onChange(s)}
                          style={[
                            styles.stateChip,
                            {
                              backgroundColor:
                                value === s
                                  ? COLORS.primary
                                  : isDark
                                  ? '#252523'
                                  : '#F0F2F5',
                              borderColor: value === s ? COLORS.primary : 'transparent',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.stateChipText,
                              { color: value === s ? '#fff' : theme.textSecondary },
                            ]}
                          >
                            {s}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    {form1.formState.errors.state && (
                      <Text style={styles.errorText}>{form1.formState.errors.state.message}</Text>
                    )}
                  </>
                )}
              />

              <Controller
                control={form1.control}
                name="city"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Ciudad"
                    placeholder="Caracas"
                    value={value}
                    onChangeText={onChange}
                    leftIcon={MapPin}
                    error={form1.formState.errors.city?.message}
                    isDark={isDark}
                  />
                )}
              />

              <Button
                label="Continuar"
                onPress={form1.handleSubmit(handleStep1)}
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                fullWidth
              />
            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Tu contraseña</Text>

              <>
                <Input
                  label="Contraseña"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    form2.setValue('password', v, { shouldValidate: false });
                  }}
                  onBlur={() => form2.trigger('password')}
                  isPassword
                  autoCapitalize="none"
                  leftIcon={Lock}
                  error={form2.formState.errors.password?.message}
                  isDark={isDark}
                />
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                i <= strength.score ? strength.color : isDark ? '#333' : '#E5E7EB',
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                )}
              </>

              <Input
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  form2.setValue('confirm_password', v, { shouldValidate: false });
                }}
                onBlur={() => form2.trigger('confirm_password')}
                isPassword
                autoCapitalize="none"
                leftIcon={Shield}
                error={form2.formState.errors.confirm_password?.message}
                isDark={isDark}
              />

              {/* Términos */}
              <TouchableOpacity
                onPress={() => {
                  const next = !termsChecked;
                  setTermsChecked(next);
                  form2.setValue('accept_terms', next, { shouldValidate: false });
                }}
                style={styles.termsRow}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: termsChecked ? COLORS.primary : theme.border,
                      backgroundColor: termsChecked ? COLORS.primary : 'transparent',
                    },
                  ]}
                >
                  {termsChecked && <Check size={12} color="#fff" strokeWidth={1.75} />}
                </View>
                <Text style={[styles.termsText, { color: theme.textSecondary }]}>
                  Acepto los{' '}
                  <Text style={{ color: COLORS.primary }}>términos y condiciones</Text>
                  {' '}y la{' '}
                  <Text style={{ color: COLORS.primary }}>política de privacidad</Text>
                </Text>
              </TouchableOpacity>
              {form2.formState.errors.accept_terms && (
                <Text style={styles.errorText}>{form2.formState.errors.accept_terms.message}</Text>
              )}

              {/* Card beneficios */}
              <View style={[styles.benefitsCard, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}>
                <Text style={[styles.benefitsTitle, { color: COLORS.primaryDark }]}>
                  🌱 Al unirte obtienes:
                </Text>
                {[
                  '100 EcoPoints de bienvenida',
                  'Acceso al mapa de trueques',
                  'Sitios seguros verificados',
                  'Impacto ecológico real',
                ].map((b) => (
                  <View key={b} style={styles.benefitRow}>
                    <CheckCircle size={14} color={COLORS.primary} strokeWidth={1.75} />
                    <Text style={[styles.benefitText, { color: COLORS.primaryDark }]}>{b}</Text>
                  </View>
                ))}
              </View>

              <Button
                label="Crear cuenta gratis"
                onPress={() => {
                  console.log('[Register] Botón presionado — terms:', termsChecked, '| errors:', JSON.stringify(form2.formState.errors));
                  form2.handleSubmit(handleStep2)();
                }}
                variant="eco"
                size="lg"
                icon={UserPlus}
                isLoading={isLoading}
                fullWidth
              />
            </>
          )}

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: theme.textSecondary }]}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginLink, { color: COLORS.primary }]}>Inicia sesión</Text>
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
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING['2xl'],
    alignItems: 'center',
  },
  backBtn: { position: 'absolute', left: SPACING.base, top: 56, padding: SPACING.sm },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#fff',
    marginTop: SPACING.lg,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.base,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  stepDotActive: { backgroundColor: '#fff' },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: SPACING.xs,
  },
  stepLineActive: { backgroundColor: '#fff' },
  stepText: { color: 'rgba(255,255,255,0.8)', fontSize: TYPOGRAPHY.size.sm, marginTop: SPACING.xs },
  form: {
    flex: 1,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -20,
    paddingHorizontal: SPACING['2xl'],
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.base,
  },
  label: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium, marginBottom: SPACING.xs },
  statesScroll: { marginBottom: SPACING.base },
  statesContent: { gap: SPACING.xs, paddingRight: SPACING.md },
  stateChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  stateChipText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  errorText: { color: COLORS.error, fontSize: TYPOGRAPHY.size.xs, marginTop: -SPACING.sm, marginBottom: SPACING.sm },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: -SPACING.sm, marginBottom: SPACING.sm },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: RADIUS.full },
  strengthLabel: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.semibold, width: 80 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.base },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.xs,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsText: { flex: 1, fontSize: TYPOGRAPHY.size.sm, lineHeight: 20 },
  benefitsCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.base,
  },
  benefitsTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs },
  benefitText: { fontSize: TYPOGRAPHY.size.sm },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  loginText: { fontSize: TYPOGRAPHY.size.base },
  loginLink: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
});
