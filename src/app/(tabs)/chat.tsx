import { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Pencil, Search, X, ChevronRight, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConversations } from '@hooks/useChat';
import { useReceivedRequests } from '@hooks/useTrades';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { EmptyState } from '@components/ui/EmptyState';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import type { Conversation } from '@/types/app.types';

const TRADE_STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  accepted: { label: 'Aceptado', variant: 'success' },
  rejected: { label: 'Rechazado', variant: 'error' },
  completed: { label: 'Completado', variant: 'info' },
  cancelled: { label: 'Cancelado', variant: 'error' },
};

function ConversationItem({ item, isDark }: { item: Conversation; isDark: boolean }) {
  const theme = isDark ? THEME.dark : THEME.light;
  const hasUnread = (item.unread_count ?? 0) > 0;
  const tradeStatus = item.trade_request?.status;
  const statusInfo = tradeStatus ? TRADE_STATUS_LABELS[tradeStatus] : null;
  const listingTitle = item.listing?.title ?? null;
  const listingImage = item.listing?.images?.[0]?.url ?? null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chat/${item.id}`)}
      style={[
        styles.conversationItem,
        {
          backgroundColor: hasUnread
            ? isDark ? '#0F2D24' : '#E8F5F0'
            : theme.surface,
        },
      ]}
      activeOpacity={0.7}
    >
      {/* Avatar del otro usuario — si el chat es de un listing, muestra la imagen del producto encima */}
      <View style={styles.avatarContainer}>
        <Avatar
          uri={item.other_user?.avatar_url ?? null}
          name={item.other_user?.full_name ?? ''}
          size="md"
          isOnline={Math.random() > 0.5}
          isDark={isDark}
        />
        {listingImage && (
          <Image
            source={{ uri: listingImage }}
            style={styles.listingThumb}
          />
        )}
      </View>

      {/* Contenido */}
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.userName, { color: theme.text, fontWeight: hasUnread ? '700' : '500' }]}
              numberOfLines={1}
            >
              {item.other_user?.full_name ?? 'Usuario'}
            </Text>
            {statusInfo && (
              <Badge label={statusInfo.label} variant={statusInfo.variant} size="xs" />
            )}
          </View>
          <Text style={[styles.timeText, { color: theme.textTertiary }]}>
            {item.last_message_at
              ? formatDistanceToNow(new Date(item.last_message_at), { locale: es, addSuffix: false })
              : ''}
          </Text>
        </View>
        {listingTitle && (
          <Text style={[styles.listingLabel, { color: COLORS.primary }]} numberOfLines={1}>
            📦 {listingTitle}
          </Text>
        )}

        <View style={styles.messagePreviewRow}>
          <Text
            style={[
              styles.messagePreview,
              {
                color: hasUnread ? theme.text : theme.textSecondary,
                fontWeight: hasUnread ? '600' : '400',
              },
            ]}
            numberOfLines={1}
          >
            {item.last_message?.type === 'image'
              ? '📷 Imagen'
              : item.last_message?.type === 'trade_proposal'
              ? '🤝 Propuesta de trueque'
              : item.last_message?.content ?? 'Inicia la conversación'}
          </Text>
          {hasUnread && (
            <View style={styles.unreadDot}>
              <Text style={styles.unreadCount}>
                {(item.unread_count ?? 0) > 9 ? '9+' : item.unread_count}
              </Text>
            </View>
          )}
        </View>

        {/* Listing relacionado */}
        {item.trade_request?.requested_listing && (
          <Text style={[styles.listingRef, { color: COLORS.primary }]} numberOfLines={1}>
            📦 {item.trade_request.requested_listing.title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversations, isLoading, refetch, isRefetching } = useConversations();
  const { data: receivedRequests } = useReceivedRequests();
  const pendingCount = (receivedRequests ?? []).filter(r => r.status === 'pending').length;

  const filtered = (conversations ?? []).filter((c: Conversation) => {
    if (!searchQuery) return true;
    const name = c.other_user?.full_name?.toLowerCase() ?? '';
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Mensajes</Text>
        <TouchableOpacity>
          <Pencil size={22} color={COLORS.primary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}>
          <Search size={16} color={theme.textTertiary} strokeWidth={1.75} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar conversación..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color={theme.textTertiary} strokeWidth={1.75} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationItem item={item} isDark={isDark} />}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.borderLight }]} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          pendingCount > 0 ? (
            <TouchableOpacity
              style={styles.pendingBanner}
              onPress={() => router.push('/trade-requests')}
              activeOpacity={0.85}
            >
              <View style={styles.pendingBannerLeft}>
                <Bell size={18} color="#fff" strokeWidth={2} fill="#fff" />
                <View>
                  <Text style={styles.pendingBannerTitle}>
                    {pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} de trueque
                  </Text>
                  <Text style={styles.pendingBannerSub}>Toca para ver y responder</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#fff" strokeWidth={1.75} />
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              emoji="💬"
              title="Sin conversaciones"
              subtitle="Cuando propongas un trueque, la conversación aparecerá aquí"
              isDark={isDark}
            />
          ) : null
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  title: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold },
  searchContainer: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 40,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.size.base },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  avatarContainer: { position: 'relative' },
  listingThumb: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  listingLabel: { fontSize: TYPOGRAPHY.size.xs, fontWeight: '600' },
  conversationContent: { flex: 1, justifyContent: 'center', gap: 2 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  userName: { fontSize: TYPOGRAPHY.size.base },
  timeText: { fontSize: TYPOGRAPHY.size.xs },
  messagePreviewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  messagePreview: { flex: 1, fontSize: TYPOGRAPHY.size.sm },
  unreadDot: {
    backgroundColor: COLORS.primary,
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  unreadCount: { color: '#fff', fontSize: 10, fontWeight: '700' },
  listingRef: { fontSize: TYPOGRAPHY.size.xs },
  separator: { height: 1, marginLeft: 76 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    margin: SPACING.base,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.green,
  },
  pendingBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  pendingBannerTitle: { color: '#fff', fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold },
  pendingBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: TYPOGRAPHY.size.xs, marginTop: 1 },
});
