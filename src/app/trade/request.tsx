import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  useColorScheme,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { X, Repeat, CheckCircle, Shield, ChevronRight, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListingDetail } from '@hooks/useListings';
import { useUserListings } from '@hooks/useListings';
import { useCreateTradeRequest } from '@hooks/useTrades';
import { Avatar } from '@components/ui/Avatar';
import { Button } from '@components/ui/Button';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CATEGORIES } from '@constants/categories';
import type { Listing } from '@/types/app.types';

export default function TradeRequestScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const { data: targetListing } = useListingDetail(listingId);
  const { data: myListings } = useUserListings();
  const { mutateAsync: createRequest, isPending } = useCreateTradeRequest();

  const activeListings = (myListings ?? []).filter((l: Listing) => l.status === 'active');
  const selectedListing = activeListings.find((l: Listing) => l.id === selectedListingId);

  const handleSubmit = async () => {
    if (!selectedListingId || !targetListing) return;
    await createRequest({
      requested_listing_id: targetListing.id,
      offered_listing_id: selectedListingId,
      owner_id: targetListing.user_id,
      message: message || undefined,
    });
    router.back();
  };

  const getEcoImpact = () => {
    if (!targetListing || !selectedListing) return null;
    const co2 = targetListing.eco_impact.co2_saved_kg + (selectedListing.eco_impact?.co2_saved_kg ?? 0);
    const waste = targetListing.eco_impact.waste_reduced_kg + (selectedListing.eco_impact?.waste_reduced_kg ?? 0);
    return { co2: co2.toFixed(1), waste: waste.toFixed(1) };
  };

  const ecoImpact = getEcoImpact();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Propuesta de trueque</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card del listing deseado */}
        {targetListing && (
          <View style={[styles.targetCard, { backgroundColor: isDark ? '#252523' : '#F8F9FA' }]}>
            <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>Quieres obtener</Text>
            <View style={styles.listingPreview}>
              {targetListing.images.length > 0 && (
                <Image source={{ uri: targetListing.images[0].url }} style={styles.listingThumb} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.listingTitle, { color: theme.text }]} numberOfLines={2}>
                  {targetListing.title}
                </Text>
                <Text style={[styles.listingCategory, { color: COLORS.primary }]}>
                  {CATEGORIES.find((c) => c.id === targetListing.category)?.emoji}{' '}
                  {CATEGORIES.find((c) => c.id === targetListing.category)?.label}
                </Text>
                <View style={styles.ownerRow}>
                  <Avatar
                    uri={targetListing.user?.avatar_url ?? null}
                    name={targetListing.user?.full_name ?? ''}
                    size="xs"
                  />
                  <Text style={[styles.ownerName, { color: theme.textSecondary }]}>
                    {targetListing.user?.full_name}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Ícono de intercambio */}
        <View style={styles.exchangeCenter}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.exchangeIcon}
          >
            <Repeat size={24} color="#fff" strokeWidth={1.75} />
          </LinearGradient>
        </View>

        {/* Mis listings para ofrecer */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>¿Qué ofreces a cambio?</Text>

        {activeListings.length === 0 ? (
          <View style={[styles.noListingsCard, { backgroundColor: isDark ? '#252523' : '#F8F9FA' }]}>
            <Text style={styles.noListingsEmoji}>📦</Text>
            <Text style={[styles.noListingsTitle, { color: theme.text }]}>
              No tienes publicaciones activas
            </Text>
            <Text style={[styles.noListingsSubtitle, { color: theme.textSecondary }]}>
              Publica algo para poder proponer un trueque
            </Text>
            <Button
              label="Publicar algo"
              variant="primary"
              size="md"
              icon={Plus}
              onPress={() => router.replace('/(tabs)/publish')}
            />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.myListingsRow}
          >
            {activeListings.map((listing: Listing) => (
              <TouchableOpacity
                key={listing.id}
                onPress={() =>
                  setSelectedListingId(selectedListingId === listing.id ? null : listing.id)
                }
                style={[
                  styles.myListingCard,
                  {
                    borderColor:
                      selectedListingId === listing.id ? COLORS.primary : theme.border,
                    backgroundColor:
                      selectedListingId === listing.id
                        ? isDark
                          ? '#0F2D24'
                          : '#E8F5F0'
                        : theme.surface,
                  },
                ]}
                activeOpacity={0.8}
              >
                {listing.images.length > 0 ? (
                  <Image source={{ uri: listing.images[0].url }} style={styles.myListingImage} />
                ) : (
                  <View style={[styles.myListingImagePlaceholder, { backgroundColor: theme.border }]}>
                    <Text style={{ fontSize: 24 }}>
                      {CATEGORIES.find((c) => c.id === listing.category)?.emoji ?? '📦'}
                    </Text>
                  </View>
                )}
                <Text style={[styles.myListingTitle, { color: theme.text }]} numberOfLines={2}>
                  {listing.title}
                </Text>
                <Text style={[styles.myListingCategory, { color: theme.textSecondary }]}>
                  {CATEGORIES.find((c) => c.id === listing.category)?.label}
                </Text>
                {selectedListingId === listing.id && (
                  <View style={styles.selectedCheck}>
                    <CheckCircle size={20} color={COLORS.primary} strokeWidth={1.75} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Mensaje opcional */}
        <View style={styles.messageSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Mensaje (opcional)</Text>
          <TextInput
            style={[
              styles.messageInput,
              { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
            ]}
            placeholder="Cuéntale algo sobre tu propuesta..."
            placeholderTextColor={theme.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Card sitios seguros */}
        <TouchableOpacity
          style={[styles.safeCard, { backgroundColor: isDark ? '#0D1F3C' : '#EBF4FF' }]}
          onPress={() => router.push('/(tabs)/map')}
        >
          <Shield size={20} color={COLORS.info} strokeWidth={1.75} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.safeTitle, { color: COLORS.infoDark }]}>
              💙 Realiza el intercambio en un sitio seguro
            </Text>
            <Text style={[styles.safeSubtitle, { color: COLORS.info }]}>
              Ver sitios seguros verificados en el mapa
            </Text>
          </View>
          <ChevronRight size={16} color={COLORS.info} strokeWidth={1.75} />
        </TouchableOpacity>

        {/* Impacto eco estimado */}
        {ecoImpact && (
          <View style={[styles.ecoImpactCard, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}>
            <Text style={[styles.ecoImpactTitle, { color: COLORS.primaryDark }]}>
              🌍 Impacto eco estimado de este trueque
            </Text>
            <View style={styles.ecoImpactRow}>
              <View style={styles.ecoImpactItem}>
                <Text style={[styles.ecoImpactValue, { color: COLORS.primary }]}>
                  {ecoImpact.co2} kg
                </Text>
                <Text style={[styles.ecoImpactLabel, { color: COLORS.primaryDark }]}>CO₂ evitado</Text>
              </View>
              <View style={styles.ecoImpactItem}>
                <Text style={[styles.ecoImpactValue, { color: COLORS.primary }]}>
                  {ecoImpact.waste} kg
                </Text>
                <Text style={[styles.ecoImpactLabel, { color: COLORS.primaryDark }]}>Residuos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Botón enviar */}
        <Button
          label="Enviar propuesta de trueque 🤝"
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          isLoading={isPending}
          disabled={!selectedListingId}
          fullWidth
        />

        <View style={{ height: insets.bottom + SPACING.base }} />
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
  content: { padding: SPACING.base, gap: SPACING.base },
  targetCard: { borderRadius: RADIUS.lg, padding: SPACING.base },
  cardLabel: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.semibold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  listingPreview: { flexDirection: 'row', gap: SPACING.md },
  listingThumb: { width: 80, height: 80, borderRadius: RADIUS.md },
  listingTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  listingCategory: { fontSize: TYPOGRAPHY.size.sm, marginVertical: 4 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  ownerName: { fontSize: TYPOGRAPHY.size.xs },
  exchangeCenter: { alignItems: 'center', paddingVertical: SPACING.sm },
  exchangeIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.green,
  },
  sectionTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.sm },
  noListingsCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING['2xl'],
    alignItems: 'center',
    gap: SPACING.md,
  },
  noListingsEmoji: { fontSize: 48 },
  noListingsTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, textAlign: 'center' },
  noListingsSubtitle: { fontSize: TYPOGRAPHY.size.sm, textAlign: 'center' },
  myListingsRow: { gap: SPACING.md, paddingBottom: SPACING.sm },
  myListingCard: {
    width: 140,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    overflow: 'hidden',
    padding: SPACING.sm,
    gap: SPACING.xs,
    position: 'relative',
  },
  myListingImage: { width: '100%', height: 100, borderRadius: RADIUS.md },
  myListingImagePlaceholder: {
    width: '100%',
    height: 100,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myListingTitle: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  myListingCategory: { fontSize: TYPOGRAPHY.size.xs },
  selectedCheck: { position: 'absolute', top: SPACING.xs, right: SPACING.xs },
  messageSection: {},
  messageInput: {
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: SPACING.md,
    minHeight: 80,
    fontSize: TYPOGRAPHY.size.base,
  },
  safeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
  },
  safeTitle: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  safeSubtitle: { fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },
  ecoImpactCard: { borderRadius: RADIUS.lg, padding: SPACING.base, gap: SPACING.sm },
  ecoImpactTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  ecoImpactRow: { flexDirection: 'row', gap: SPACING.base },
  ecoImpactItem: { flex: 1, alignItems: 'center' },
  ecoImpactValue: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  ecoImpactLabel: { fontSize: TYPOGRAPHY.size.xs },
});
