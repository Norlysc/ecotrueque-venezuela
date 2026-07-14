import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, useColorScheme, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Package, Handshake } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useListingDetail, useUpdateListing } from '@hooks/useListings';
import { Button } from '@components/ui/Button';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';

const CONDITIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'like_new', label: 'Como nuevo' },
  { value: 'good', label: 'Buen estado' },
  { value: 'fair', label: 'Regular' },
  { value: 'poor', label: 'Deteriorado' },
] as const;

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  const { data: listing, isLoading } = useListingDetail(id);
  const { mutateAsync: updateListing, isPending } = useUpdateListing();

  // Ref para inicializar el formulario solo una vez cuando llegan los datos
  const initialized = useRef(false);

  const [type, setType] = useState<'good' | 'service'>('good');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [condition, setCondition] = useState<string | null>(null);
  const [estimatedValue, setEstimatedValue] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    // Solo inicializa una vez para no pisar lo que escribe el usuario
    if (listing && !initialized.current) {
      initialized.current = true;
      setType(listing.type === 'service' ? 'service' : 'good');
      setTitle(listing.title);
      setDescription(listing.description ?? '');
      setLookingFor(listing.looking_for);
      setCondition(listing.condition ?? null);
      setEstimatedValue(listing.estimated_value_usd ? String(listing.estimated_value_usd) : '');
      setTagsInput((listing.tags ?? []).join(', '));
    }
  }, [listing]);

  const handleSave = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'El título es requerido' });
      return;
    }
    if (!lookingFor.trim()) {
      Toast.show({ type: 'error', text1: 'Indica qué buscas a cambio' });
      return;
    }
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const estimatedValueNum = estimatedValue ? parseFloat(estimatedValue) : undefined;

    try {
      await updateListing({
        id,
        updates: {
          type,
          title: title.trim(),
          description: description.trim(),
          looking_for: lookingFor.trim(),
          condition: type === 'service' ? null : (condition as any),
          estimated_value_usd: estimatedValueNum,
          tags,
        },
      });
      router.back();
    } catch {
      // toast shown by hook
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.headerBtn}>
            <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Editar publicación</Text>
          <View style={{ width: 30 }} />
        </View>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.headerBtn}>
          <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Editar publicación</Text>
        <TouchableOpacity onPress={handleSave} disabled={isPending} style={styles.headerBtn}>
          <Save size={22} color={isPending ? theme.textTertiary : COLORS.primary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>

        {/* Tipo: Bien o Servicio */}
        <Text style={[styles.label, { color: theme.text }]}>Tipo de publicación</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              { borderColor: type === 'good' ? COLORS.primary : theme.border, backgroundColor: type === 'good' ? COLORS.primary + '15' : theme.surface },
            ]}
            onPress={() => setType('good')}
          >
            <Package size={18} color={type === 'good' ? COLORS.primary : theme.textSecondary} strokeWidth={1.75} />
            <Text style={[styles.typeBtnLabel, { color: type === 'good' ? COLORS.primary : theme.textSecondary }]}>
              Bien / Objeto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              { borderColor: type === 'service' ? COLORS.primary : theme.border, backgroundColor: type === 'service' ? COLORS.primary + '15' : theme.surface },
            ]}
            onPress={() => setType('service')}
          >
            <Handshake size={18} color={type === 'service' ? COLORS.primary : theme.textSecondary} strokeWidth={1.75} />
            <Text style={[styles.typeBtnLabel, { color: type === 'service' ? COLORS.primary : theme.textSecondary }]}>
              Servicio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Título */}
        <Text style={[styles.label, { color: theme.text }]}>Título *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Título de tu publicación"
          placeholderTextColor={theme.textTertiary}
          maxLength={100}
        />
        <Text style={[styles.charCount, { color: theme.textTertiary }]}>{title.length}/100</Text>

        {/* Descripción */}
        <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textarea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe el artículo o servicio en detalle..."
          placeholderTextColor={theme.textTertiary}
          multiline
          maxLength={800}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, { color: theme.textTertiary }]}>{description.length}/800</Text>

        {/* Busca a cambio */}
        <Text style={[styles.label, { color: theme.text }]}>¿Qué buscas a cambio? *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          value={lookingFor}
          onChangeText={setLookingFor}
          placeholder="Ej: Laptop, servicios de diseño, plantas..."
          placeholderTextColor={theme.textTertiary}
          maxLength={200}
        />

        {/* Estado (solo bienes) */}
        {type === 'good' && (
          <>
            <Text style={[styles.label, { color: theme.text }]}>Estado del artículo</Text>
            <View style={styles.conditionRow}>
              {CONDITIONS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => setCondition(c.value)}
                  style={[
                    styles.conditionBtn,
                    {
                      borderColor: condition === c.value ? COLORS.primary : theme.border,
                      backgroundColor: condition === c.value ? COLORS.primary + '18' : theme.surface,
                    },
                  ]}
                >
                  <Text style={[styles.conditionLabel, { color: condition === c.value ? COLORS.primary : theme.textSecondary }]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Valor estimado */}
        <Text style={[styles.label, { color: theme.text }]}>Valor estimado (USD)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          value={estimatedValue}
          onChangeText={(v) => setEstimatedValue(v.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          placeholderTextColor={theme.textTertiary}
          keyboardType="numeric"
        />

        {/* Etiquetas */}
        <Text style={[styles.label, { color: theme.text }]}>Etiquetas</Text>
        <Text style={[styles.hint, { color: theme.textTertiary }]}>Separadas por coma</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder="laptop, dell, tecnología, ssd..."
          placeholderTextColor={theme.textTertiary}
        />

        <Button
          label={isPending ? 'Guardando...' : 'Guardar cambios'}
          variant="primary"
          size="lg"
          isLoading={isPending}
          onPress={handleSave}
          style={{ marginTop: SPACING.xl }}
        />

        <View style={{ height: SPACING['3xl'] + insets.bottom }} />
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
  headerBtn: { padding: 4, minWidth: 30, alignItems: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold },
  content: { padding: SPACING.base },
  label: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginTop: SPACING.lg, marginBottom: SPACING.xs },
  hint: { fontSize: TYPOGRAPHY.size.xs, marginBottom: SPACING.xs, marginTop: -4 },
  input: {
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.size.base,
  },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  charCount: { fontSize: TYPOGRAPHY.size.xs, textAlign: 'right', marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: SPACING.md },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  typeBtnLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  conditionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  conditionLabel: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.semibold },
});
