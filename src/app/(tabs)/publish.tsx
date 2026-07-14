import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { X, Check, Image as ImageIcon, Camera, CheckCircle, ArrowRight, Tag, DollarSign } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CATEGORIES } from '@constants/categories';
import { useCreateListing } from '@hooks/useListings';
import type { CategoryId } from '@constants/categories';
import type { ListingType } from '@/types/app.types';

const CONDITIONS = [
  { id: 'new', label: 'Nuevo', emoji: '✨' },
  { id: 'like_new', label: 'Como nuevo', emoji: '🌟' },
  { id: 'good', label: 'Buen estado', emoji: '👍' },
  { id: 'fair', label: 'Regular', emoji: '🔶' },
  { id: 'poor', label: 'Para reparar', emoji: '🔧' },
] as const;

type Condition = typeof CONDITIONS[number]['id'];

interface PublishForm {
  type: ListingType;
  category: CategoryId | null;
  title: string;
  description: string;
  condition: Condition | null;
  looking_for: string;
  tags: string;
  estimated_value_usd: string;
  images: string[];
}

const INITIAL_FORM: PublishForm = {
  type: 'good',
  category: null,
  title: '',
  description: '',
  condition: null,
  looking_for: '',
  tags: '',
  estimated_value_usd: '',
  images: [],
};

export default function PublishScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PublishForm>(INITIAL_FORM);
  const { mutateAsync: createListing, isPending } = useCreateListing();

  const updateForm = (key: keyof PublishForm, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Sin permiso', text2: 'Necesitamos acceso a tu galería' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - form.images.length,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      updateForm('images', [...form.images, ...uris].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Toast.show({ type: 'info', text1: 'Solo en móvil', text2: 'La cámara no está disponible en el navegador' });
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Sin permiso', text2: 'Necesitamos acceso a tu cámara' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && form.images.length < 5) {
      updateForm('images', [...form.images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    updateForm('images', form.images.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!form.category || !form.title) {
      Toast.show({ type: 'error', text1: 'Faltan datos', text2: 'Completa el título y la categoría' });
      return;
    }
    if (form.images.length === 0) {
      Toast.show({ type: 'error', text1: 'Agrega al menos una foto', text2: 'Las fotos ayudan a conseguir mejores trueques' });
      return;
    }
    try {
      await createListing({
        type: form.type,
        category: form.category,
        title: form.title,
        description: form.description,
        condition: form.condition ?? undefined,
        looking_for: form.looking_for,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        estimated_value_usd: form.estimated_value_usd ? parseFloat(form.estimated_value_usd) : undefined,
        imageUris: form.images,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('Bucket') || msg.includes('bucket') || msg.includes('storage')) {
        Toast.show({
          type: 'error',
          text1: 'Error de almacenamiento',
          text2: 'Crea el bucket "listings" en Supabase Storage',
        });
      } else {
        Toast.show({ type: 'error', text1: 'Error al publicar', text2: 'Inténtalo de nuevo' });
      }
    }
  };

  const canGoNext = () => {
    if (step === 1) return form.type && form.category;
    if (step === 2) return form.title.length >= 5 && form.looking_for.length >= 3;
    if (step === 3) return form.images.length > 0;
    return true;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <X size={24} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Publicar trueque</Text>
        <Text style={[styles.stepCounter, { color: theme.textSecondary }]}>{step}/4</Text>
      </View>

      {/* Stepper */}
      <View style={[styles.stepper, { backgroundColor: theme.surface }]}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    s < step ? COLORS.primary : s === step ? COLORS.primary : theme.border,
                  opacity: s > step ? 0.4 : 1,
                },
              ]}
            >
              {s < step ? (
                <Check size={14} color="#fff" strokeWidth={1.75} />
              ) : (
                <Text style={styles.stepCircleText}>{s}</Text>
              )}
            </View>
            {s < 4 && (
              <View
                style={[
                  styles.stepConnector,
                  { backgroundColor: s < step ? COLORS.primary : theme.border },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* PASO 1: Tipo y categoría */}
        {step === 1 && (
          <>
            <Text style={[styles.stepTitle, { color: theme.text }]}>¿Qué vas a ofrecer?</Text>

            <View style={styles.typeRow}>
              {([
                { id: 'good', label: 'Un bien', emoji: '📦', desc: 'Objeto físico' },
                { id: 'service', label: 'Un servicio', emoji: '🤝', desc: 'Habilidad o tiempo' },
              ] as const).map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => updateForm('type', t.id)}
                  style={[
                    styles.typeCard,
                    {
                      borderColor: form.type === t.id ? COLORS.primary : theme.border,
                      backgroundColor: form.type === t.id
                        ? (isDark ? '#0F2D24' : '#E8F5F0')
                        : theme.surface,
                    },
                  ]}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeLabel, { color: theme.text }]}>{t.label}</Text>
                  <Text style={[styles.typeDesc, { color: theme.textSecondary }]}>{t.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.subSectionTitle, { color: theme.text }]}>Categoría</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => updateForm('category', cat.id)}
                  style={[
                    styles.categoryItem,
                    {
                      borderColor: form.category === cat.id ? cat.color : 'transparent',
                      backgroundColor:
                        form.category === cat.id
                          ? `${cat.color}22`
                          : isDark
                          ? '#252523'
                          : '#F0F2F5',
                    },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      { color: form.category === cat.id ? cat.color : theme.textSecondary },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* PASO 2: Detalles */}
        {step === 2 && (
          <>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Detalles del trueque</Text>

            <Input
              label="Título *"
              placeholder="Ej: Laptop Dell Core i5 2019"
              value={form.title}
              onChangeText={(v) => updateForm('title', v)}
              isDark={isDark}
            />

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Descripción ({form.description.length}/500)
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
                ]}
                placeholder="Describe el artículo en detalle..."
                placeholderTextColor={theme.textTertiary}
                value={form.description}
                onChangeText={(v) => updateForm('description', v.slice(0, 500))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {form.type === 'good' && (
              <>
                <Text style={[styles.subSectionTitle, { color: theme.text }]}>Condición</Text>
                <View style={styles.conditionsRow}>
                  {CONDITIONS.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => updateForm('condition', c.id)}
                      style={[
                        styles.conditionChip,
                        {
                          borderColor: form.condition === c.id ? COLORS.primary : theme.border,
                          backgroundColor: form.condition === c.id
                            ? (isDark ? '#0F2D24' : '#E8F5F0')
                            : theme.surface,
                        },
                      ]}
                    >
                      <Text style={styles.conditionEmoji}>{c.emoji}</Text>
                      <Text
                        style={[
                          styles.conditionLabel,
                          { color: form.condition === c.id ? COLORS.primary : theme.textSecondary },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={[styles.lookingForContainer, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}>
              <Text style={[styles.lookingForTitle, { color: COLORS.primaryDark }]}>
                🔄 ¿Qué buscas a cambio?
              </Text>
              <TextInput
                style={[styles.lookingForInput, { color: COLORS.primaryDark }]}
                placeholder="Ej: Tablet, servicios de diseño, frutas..."
                placeholderTextColor={COLORS.primary + '80'}
                value={form.looking_for}
                onChangeText={(v) => updateForm('looking_for', v)}
              />
            </View>

            <Input
              label="Tags (separados por coma)"
              placeholder="laptop, tecnología, Dell"
              value={form.tags}
              onChangeText={(v) => updateForm('tags', v)}
              leftIcon={Tag}
              isDark={isDark}
            />

            <Input
              label="Valor estimado en USD (opcional)"
              placeholder="0.00"
              value={form.estimated_value_usd}
              onChangeText={(v) => updateForm('estimated_value_usd', v)}
              keyboardType="decimal-pad"
              leftIcon={DollarSign}
              isDark={isDark}
            />
          </>
        )}

        {/* PASO 3: Fotos */}
        {step === 3 && (
          <>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Fotos del artículo</Text>
            <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
              Agrega hasta 5 fotos. La primera será la principal.
            </Text>

            <View style={styles.photosGrid}>
              {form.images.map((uri, i) => (
                <View key={uri} style={styles.photoItem}>
                  <Image source={{ uri }} style={styles.photo} />
                  {i === 0 && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>Principal</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => removeImage(i)} style={styles.removePhoto}>
                    <X size={14} color="#fff" strokeWidth={1.75} />
                  </TouchableOpacity>
                </View>
              ))}

              {form.images.length < 5 && (
                <View style={styles.addPhotoButtons}>
                  <TouchableOpacity
                    onPress={pickImages}
                    style={[styles.addPhotoBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  >
                    <ImageIcon size={24} color={COLORS.primary} strokeWidth={1.75} />
                    <Text style={[styles.addPhotoBtnText, { color: theme.textSecondary }]}>Galería</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={takePhoto}
                    style={[styles.addPhotoBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  >
                    <Camera size={24} color={COLORS.primary} strokeWidth={1.75} />
                    <Text style={[styles.addPhotoBtnText, { color: theme.textSecondary }]}>Cámara</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        {/* PASO 4: Preview */}
        {step === 4 && (
          <>
            <Text style={[styles.stepTitle, { color: theme.text }]}>Revisa tu publicación</Text>

            {form.images.length > 0 && (
              <Image source={{ uri: form.images[0] }} style={styles.previewImage} />
            )}

            <View style={[styles.previewCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.previewTitle, { color: theme.text }]}>{form.title}</Text>
              <Text style={[styles.previewCategory, { color: COLORS.primary }]}>
                {CATEGORIES.find((c) => c.id === form.category)?.emoji}{' '}
                {CATEGORIES.find((c) => c.id === form.category)?.label}
              </Text>
              <View style={[styles.lookingForPreview, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}>
                <Text style={{ color: COLORS.primaryDark }}>🔄 Busca: {form.looking_for}</Text>
              </View>
              {form.description.length > 0 && (
                <Text style={[styles.previewDesc, { color: theme.textSecondary }]}>
                  {form.description}
                </Text>
              )}
            </View>

            {/* Checklist */}
            <View style={[styles.checklist, { backgroundColor: theme.surface }]}>
              <Text style={[styles.checklistTitle, { color: theme.text }]}>Verificación</Text>
              {[
                { label: 'Fotos agregadas', ok: form.images.length > 0 },
                { label: 'Título descriptivo', ok: form.title.length >= 10 },
                { label: 'Descripción completa', ok: form.description.length >= 20 },
                { label: 'Qué busca a cambio', ok: form.looking_for.length >= 3 },
                { label: 'Categoría seleccionada', ok: !!form.category },
              ].map((item) => (
                <View key={item.label} style={styles.checklistItem}>
                  <CheckCircle
                    size={18}
                    color={item.ok ? COLORS.primary : theme.border}
                    strokeWidth={1.75}
                  />
                  <Text style={[styles.checklistLabel, { color: item.ok ? theme.text : theme.textTertiary }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Botones de navegación */}
        <View style={styles.navButtons}>
          {step < 4 ? (
            <Button
              label="Siguiente"
              onPress={() => canGoNext() && setStep(step + 1)}
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              fullWidth
              disabled={!canGoNext()}
            />
          ) : (
            <Button
              label={isPending ? 'Subiendo fotos...' : 'Publicar trueque 🤝'}
              onPress={handlePublish}
              variant="eco"
              size="lg"
              isLoading={isPending}
              fullWidth
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  headerTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold },
  stepCounter: { fontSize: TYPOGRAPHY.size.sm },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
  },
  stepItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: { color: '#fff', fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold },
  stepConnector: { flex: 1, height: 2, marginHorizontal: SPACING.xs },
  content: { padding: SPACING.base, paddingBottom: SPACING['4xl'] },
  stepTitle: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.sm },
  stepSubtitle: { fontSize: TYPOGRAPHY.size.base, marginBottom: SPACING.base },
  subSectionTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.sm, marginTop: SPACING.base },
  typeRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    gap: SPACING.xs,
  },
  typeEmoji: { fontSize: 36 },
  typeLabel: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  typeDesc: { fontSize: TYPOGRAPHY.size.xs, textAlign: 'center' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  categoryItem: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    width: '30%',
    borderWidth: 2,
    gap: 4,
  },
  categoryEmoji: { fontSize: 24 },
  categoryLabel: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.medium, textAlign: 'center' },
  inputGroup: { marginBottom: SPACING.base },
  inputLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium, marginBottom: SPACING.xs },
  textArea: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: SPACING.md,
    minHeight: 100,
    fontSize: TYPOGRAPHY.size.base,
  },
  conditionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.base },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    gap: 4,
  },
  conditionEmoji: { fontSize: 16 },
  conditionLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  lookingForContainer: { borderRadius: RADIUS.md, padding: SPACING.base, marginBottom: SPACING.base },
  lookingForTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: SPACING.xs },
  lookingForInput: { fontSize: TYPOGRAPHY.size.base },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  photoItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: { width: '100%', height: '100%' },
  mainBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  mainBadgeText: { color: '#fff', fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.bold },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButtons: { flexDirection: 'row', gap: SPACING.sm },
  addPhotoBtn: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  addPhotoBtnText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  previewImage: { width: '100%', height: 200, borderRadius: RADIUS.lg, marginBottom: SPACING.base },
  previewCard: { borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, gap: SPACING.sm },
  previewTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  previewCategory: { fontSize: TYPOGRAPHY.size.base },
  lookingForPreview: { borderRadius: RADIUS.sm, padding: SPACING.sm },
  previewDesc: { fontSize: TYPOGRAPHY.size.base, lineHeight: 22 },
  checklist: { borderRadius: RADIUS.lg, padding: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.base },
  checklistTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.xs },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  checklistLabel: { fontSize: TYPOGRAPHY.size.base },
  navButtons: { marginTop: SPACING.lg },
});
