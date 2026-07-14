import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, useColorScheme, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReceivedRequests, useRespondToRequest, useConfirmMeeting } from '@hooks/useTrades';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CATEGORIES } from '@constants/categories';
import type { TradeRequest } from '@/types/app.types';

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',   variant: 'warning'  as const, emoji: '⏳' },
  accepted:  { label: 'Aceptado',    variant: 'success'  as const, emoji: '✅' },
  rejected:  { label: 'Rechazado',   variant: 'error'    as const, emoji: '❌' },
  cancelled: { label: 'Cancelado',   variant: 'error'    as const, emoji: '🚫' },
  completed: { label: 'Completado',  variant: 'info'     as const, emoji: '🎉' },
};

export default function TradeRequestsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');

  const { data: requests, isLoading, refetch, isRefetching } = useReceivedRequests();
  const { mutate: respond, isPending: isResponding, variables: respondingVars } = useRespondToRequest();
  const { mutate: confirmMeeting, isPending: isConfirming, variables: confirmVars } = useConfirmMeeting();

  const filtered = (requests ?? []).filter(r => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'accepted') return r.status === 'accepted';
    return true;
  });

  const pendingCount = (requests ?? []).filter(r => r.status === 'pending').length;

  const renderItem = ({ item }: { item: TradeRequest }) => {
    const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    const offeredCat = CATEGORIES.find(c => c.id === item.offered_listing?.category);
    const requestedCat = CATEGORIES.find(c => c.id === item.requested_listing?.category);
    const isThisResponding = isResponding &&
      (respondingVars?.requestId === item.id);

    return (
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: item.status === 'pending' ? COLORS.primary + '40' : theme.border }]}>
        {/* Requester info */}
        <View style={styles.cardHeader}>
          <Avatar uri={item.requester?.avatar_url ?? null} name={item.requester?.full_name ?? ''} size="md" isDark={isDark} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.requesterName, { color: theme.text }]}>
              {item.requester?.full_name ?? 'Usuario'}
            </Text>
            <Text style={[styles.timeAgo, { color: theme.textTertiary }]}>
              {formatDistanceToNow(new Date(item.created_at), { locale: es, addSuffix: true })}
            </Text>
          </View>
          <Badge label={`${statusCfg.emoji} ${statusCfg.label}`} variant={statusCfg.variant} size="sm" />
        </View>

        {/* Trade details */}
        <View style={[styles.tradeVisual, { backgroundColor: isDark ? '#1A1A18' : '#F8FAF9' }]}>
          {/* They offer */}
          <View style={styles.tradeItem}>
            <Text style={[styles.tradeLabel, { color: theme.textTertiary }]}>OFRECE</Text>
            {item.offered_listing?.images?.[0]?.url ? (
              <Image source={{ uri: item.offered_listing.images[0].url }} style={styles.tradeImage} />
            ) : (
              <View style={[styles.tradeImagePlaceholder, { backgroundColor: offeredCat?.color + '20' ?? '#F0F2F5' }]}>
                <Text style={{ fontSize: 26 }}>{offeredCat?.emoji ?? '📦'}</Text>
              </View>
            )}
            <Text style={[styles.tradeTitle, { color: theme.text }]} numberOfLines={2}>
              {item.offered_listing?.title ?? '—'}
            </Text>
          </View>

          {/* Arrow */}
          <View style={styles.tradeArrow}>
            <Text style={styles.tradeArrowText}>🔄</Text>
          </View>

          {/* They want */}
          <View style={styles.tradeItem}>
            <Text style={[styles.tradeLabel, { color: theme.textTertiary }]}>QUIERE</Text>
            {item.requested_listing?.images?.[0]?.url ? (
              <Image source={{ uri: item.requested_listing.images[0].url }} style={styles.tradeImage} />
            ) : (
              <View style={[styles.tradeImagePlaceholder, { backgroundColor: requestedCat?.color + '20' ?? '#F0F2F5' }]}>
                <Text style={{ fontSize: 26 }}>{requestedCat?.emoji ?? '📦'}</Text>
              </View>
            )}
            <Text style={[styles.tradeTitle, { color: theme.text }]} numberOfLines={2}>
              {item.requested_listing?.title ?? '—'}
            </Text>
          </View>
        </View>

        {/* Message if any */}
        {item.message && (
          <View style={[styles.messageBox, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}>
            <Text style={[styles.messageText, { color: theme.textSecondary }]}>💬 {item.message}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.cardActions}>
          {item.status === 'pending' && (
            <>
              <Button
                label="Rechazar"
                variant="danger"
                size="sm"
                isLoading={isThisResponding}
                onPress={() => respond({ requestId: item.id, action: 'reject' })}
              />
              <Button
                label="✅ Aceptar trueque"
                variant="primary"
                size="sm"
                isLoading={isThisResponding}
                onPress={() => respond({ requestId: item.id, action: 'accept' })}
              />
            </>
          )}
          {item.status === 'accepted' && (
            <View style={{ flex: 1 }}>
              <View style={styles.confirmRow}>
                <Text style={{ fontSize: 14 }}>{item.owner_confirmed ? '✅ Tú confirmaste' : '⏳ Tú: pendiente'}</Text>
                <Text style={{ fontSize: 14 }}>{item.requester_confirmed ? '✅ El solicitante confirmó' : '⏳ El otro: pendiente'}</Text>
              </View>
              {!item.owner_confirmed && (
                <Button
                  label="Confirmar encuentro realizado"
                  variant="primary"
                  size="sm"
                  fullWidth
                  isLoading={isConfirming && confirmVars?.requestId === item.id}
                  onPress={() => confirmMeeting({ requestId: item.id, isRequester: false })}
                />
              )}
            </View>
          )}
          {(item.status === 'accepted' || item.status === 'pending') && (
            <Button
              label="Ver chat"
              variant="outline"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              onPress={() => router.push('/(tabs)/chat')}
            />
          )}
          {item.status === 'completed' && (
            <Button
              label="⭐ Dejar reseña"
              variant="outline"
              size="sm"
              onPress={() =>
                router.push({
                  pathname: '/review-modal',
                  params: {
                    tradeRequestId: item.id,
                    reviewedUserId: item.requester?.id ?? '',
                    reviewedUserName: item.requester?.full_name ?? 'Usuario',
                    reviewedUserAvatar: item.requester?.avatar_url ?? '',
                  },
                })
              }
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Solicitudes recibidas</Text>
          {pendingCount > 0 && (
            <Text style={[styles.headerSub, { color: COLORS.primary }]}>
              {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => refetch()} style={styles.headerBtn}>
          <RefreshCw size={18} color={COLORS.primary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={[styles.filters, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {(['all', 'pending', 'accepted'] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, { backgroundColor: filter === f ? COLORS.primary : isDark ? '#2A2A28' : '#F0F2F5' }]}
          >
            <Text style={[styles.filterText, { color: filter === f ? '#fff' : theme.textSecondary }]}>
              {f === 'all' ? 'Todas' : f === 'pending' ? '⏳ Pendientes' : '✅ Aceptadas'}
            </Text>
            {f === 'pending' && pendingCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{pendingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, filtered.length === 0 && styles.listEmpty]}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 56 }}>📭</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {filter === 'pending' ? 'Sin solicitudes pendientes' : 'Sin solicitudes'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Cuando alguien proponga un trueque contigo, aparecerá aquí
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  headerSub: { fontSize: TYPOGRAPHY.size.xs, marginTop: 1 },
  filters: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  filterText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  filterBadge: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: SPACING.base, gap: SPACING.base },
  listEmpty: { flex: 1 },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.base,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  requesterName: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  timeAgo: { fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },
  tradeVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  tradeItem: { flex: 1, alignItems: 'center', gap: SPACING.xs },
  tradeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  tradeImage: { width: 70, height: 70, borderRadius: RADIUS.md },
  tradeImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeTitle: { fontSize: TYPOGRAPHY.size.xs, textAlign: 'center' },
  tradeArrow: { alignItems: 'center' },
  tradeArrowText: { fontSize: 22 },
  messageBox: { borderRadius: RADIUS.md, padding: SPACING.sm },
  messageText: { fontSize: TYPOGRAPHY.size.sm, fontStyle: 'italic' },
  cardActions: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'flex-end', flexWrap: 'wrap' },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm, flexWrap: 'wrap', gap: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md, padding: SPACING['2xl'] },
  emptyTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, textAlign: 'center' },
  emptySubtitle: { fontSize: TYPOGRAPHY.size.sm, textAlign: 'center', lineHeight: 20 },
});
