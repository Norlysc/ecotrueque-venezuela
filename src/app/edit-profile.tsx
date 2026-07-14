import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  StyleSheet,
  useColorScheme,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Camera, Check, ChevronDown, X, User, Phone, MapPin, FileText, Save,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '@stores/authStore';
import { authService } from '@services/auth.service';
import { Avatar } from '@components/ui/Avatar';
import { getEcoLevel } from '@constants/theme';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';

const VENEZUELA_STATES = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas',
  'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital',
  'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda',
  'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira',
  'Trujillo', 'La Guaira', 'Yaracuy', 'Zulia',
];

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  const { profile, setProfile } = useAuthStore();
  const level = getEcoLevel(profile?.eco_points ?? 0);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [state, setState] = useState(profile?.state ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const hasChanges =
    fullName !== (profile?.full_name ?? '') ||
    bio !== (profile?.bio ?? '') ||
    phone !== (profile?.phone ?? '') ||
    city !== (profile?.city ?? '') ||
    state !== (profile?.state ?? '') ||
    avatarUri !== null;

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Sin permiso', text2: 'Necesitamos acceso a tu galería' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!fullName.trim()) {
      Toast.show({ type: 'error', text1: 'Nombre requerido', text2: 'El nombre no puede estar vacío' });
      return;
    }
    setIsSaving(true);
    try {
      let avatar_url = profile.avatar_url;

      if (avatarUri) {
        try {
          avatar_url = await authService.uploadAvatar(profile.id, avatarUri);
        } catch (avatarErr: any) {
          const msg = avatarErr?.message ?? '';
          const hint = msg.includes('Bucket not found') || msg.includes('not found')
            ? 'Crea el bucket "avatars" en Supabase Storage'
            : 'Verifica tu conexión e intenta de nuevo';
          Toast.show({ type: 'info', text1: 'Foto no subida', text2: hint });
        }
      }

      const updated = await authService.updateProfile(profile.id, {
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        state: state || null,
        avatar_url,
      });

      setProfile(updated);
      Toast.show({ type: 'success', text1: '¡Perfil actualizado!', text2: 'Los cambios fueron guardados' });
      router.back();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error al guardar', text2: error.message ?? 'Intenta de nuevo' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarUri = avatarUri ?? profile?.avatar_url ?? null;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#085041', '#0F6E56']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <ArrowLeft size={22} color="#fff" strokeWidth={1.75} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar perfil</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving || !hasChanges}
            style={[styles.saveBtn, (!hasChanges || isSaving) && styles.saveBtnDisabled]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Save size={15} color="#fff" strokeWidth={2} />
                <Text style={styles.saveBtnText}>Guardar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer} activeOpacity={0.8}>
          {currentAvatarUri ? (
            <Image source={{ uri: currentAvatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: COLORS.primary + '44' }]}>
              <User size={40} color="#fff" strokeWidth={1.5} />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Camera size={16} color="#fff" strokeWidth={2} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Toca para cambiar foto</Text>
      </LinearGradient>

      {/* Form */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + SPACING['2xl'] }]}
          keyboardShouldPersistTaps="handled"
        >
          <Section title="Información personal" isDark={isDark} theme={theme}>
            <Field
              label="Nombre completo"
              icon={<User size={18} color={COLORS.primary} strokeWidth={1.75} />}
              isDark={isDark}
              theme={theme}
            >
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Tu nombre completo"
                placeholderTextColor={theme.textTertiary}
                maxLength={80}
              />
            </Field>

            <Field
              label="Biografía"
              icon={<FileText size={18} color={COLORS.primary} strokeWidth={1.75} />}
              isDark={isDark}
              theme={theme}
            >
              <TextInput
                style={[styles.textInput, styles.textArea, { color: theme.text }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Cuéntanos un poco sobre ti..."
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={3}
                maxLength={280}
              />
              <Text style={[styles.charCount, { color: theme.textTertiary }]}>
                {bio.length}/280
              </Text>
            </Field>

            <Field
              label="Teléfono"
              icon={<Phone size={18} color={COLORS.primary} strokeWidth={1.75} />}
              isDark={isDark}
              theme={theme}
            >
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+58 424 000 0000"
                placeholderTextColor={theme.textTertiary}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </Field>
          </Section>

          <Section title="Ubicación" isDark={isDark} theme={theme}>
            <Field
              label="Ciudad"
              icon={<MapPin size={18} color={COLORS.primary} strokeWidth={1.75} />}
              isDark={isDark}
              theme={theme}
            >
              <TextInput
                style={[styles.textInput, { color: theme.text }]}
                value={city}
                onChangeText={setCity}
                placeholder="Ej. Caracas"
                placeholderTextColor={theme.textTertiary}
                maxLength={60}
              />
            </Field>

            <TouchableOpacity
              onPress={() => setShowStatePicker(true)}
              activeOpacity={0.75}
            >
              <Field
                label="Estado"
                icon={<MapPin size={18} color={COLORS.primary} strokeWidth={1.75} />}
                isDark={isDark}
                theme={theme}
                rightEl={<ChevronDown size={18} color={theme.textTertiary} strokeWidth={1.75} />}
              >
                <Text
                  style={[styles.textInput, { color: state ? theme.text : theme.textTertiary }]}
                  numberOfLines={1}
                >
                  {state || 'Selecciona tu estado'}
                </Text>
              </Field>
            </TouchableOpacity>
          </Section>

          {/* Botón guardar inferior */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving || !hasChanges}
            activeOpacity={0.85}
            style={[
              styles.bottomSaveBtn,
              (!hasChanges || isSaving) && styles.bottomSaveBtnDisabled,
              SHADOWS.green,
            ]}
          >
            <LinearGradient
              colors={['#085041', '#0F6E56']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Save size={18} color="#fff" strokeWidth={2} />
                <Text style={styles.bottomSaveBtnText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal selector de estados */}
      <Modal
        visible={showStatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + SPACING.base }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona tu estado</Text>
              <TouchableOpacity onPress={() => setShowStatePicker(false)}>
                <X size={22} color={theme.textSecondary} strokeWidth={1.75} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={VENEZUELA_STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stateItem, { borderBottomColor: theme.border }]}
                  onPress={() => { setState(item); setShowStatePicker(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stateItemText, { color: theme.text }]}>{item}</Text>
                  {state === item && (
                    <Check size={18} color={COLORS.primary} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Section({
  title, children, isDark, theme,
}: { title: string; children: React.ReactNode; isDark: boolean; theme: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

function Field({
  label, icon, isDark, theme, children, rightEl,
}: {
  label: string;
  icon: React.ReactNode;
  isDark: boolean;
  theme: any;
  children: React.ReactNode;
  rightEl?: React.ReactNode;
}) {
  return (
    <View style={[styles.field, { borderBottomColor: theme.border }]}>
      <View style={styles.fieldIcon}>{icon}</View>
      <View style={styles.fieldBody}>
        <Text style={[styles.fieldLabel, { color: theme.textTertiary }]}>{label}</Text>
        {children}
      </View>
      {rightEl && <View style={styles.fieldRight}>{rightEl}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    alignItems: 'center',
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  headerBtn: { padding: SPACING.xs },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },

  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    position: 'relative',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: SPACING.sm,
  },

  form: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    gap: SPACING.sm,
  },

  section: { gap: SPACING.xs },
  sectionTitle: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    letterSpacing: 0.8,
    paddingHorizontal: SPACING.xs,
  },
  sectionCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    minHeight: 60,
    gap: SPACING.md,
  },
  fieldIcon: { width: 28, alignItems: 'center' },
  fieldBody: { flex: 1, gap: 2 },
  fieldRight: { paddingLeft: SPACING.sm },
  fieldLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },

  textInput: {
    fontSize: TYPOGRAPHY.size.base,
    padding: 0,
    margin: 0,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 2,
  },
  charCount: {
    fontSize: TYPOGRAPHY.size.xs,
    textAlign: 'right',
    marginTop: 2,
  },

  bottomSaveBtn: {
    height: 52,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    overflow: 'hidden',
    marginTop: SPACING.base,
  },
  bottomSaveBtnDisabled: { opacity: 0.5 },
  bottomSaveBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stateItemText: { fontSize: TYPOGRAPHY.size.base },
});
