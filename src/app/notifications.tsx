import { useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useColorScheme, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Bell, Check, CheckCheck, ShoppingBag, MessageCircle, Star, Repeat2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { useAuthStore } from '@stores/authStore';
import { useNotificationStore } from '@stores/notificationStore';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import type { Notification } from '@/types/app.types';

const NOTIF_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  trade_request:  { icon: Repeat2,        color: '#378ADD', bg: '#EEF4FF' },
  trade_accepted: { icon: CheckCheck,     color: '#1D9E75', bg: '#E8F5F0' },
  trade_rejected: { icon: Check,          color: '#9CA3AF', bg: '#F3F4F6' },
  new_message:    { icon: MessageCircle,  color: '#F59E0B', bg: '#FEF3C7' },
  new_review:     { icon: Star,           color: '#EF4444', bg: '#FEE2E2' },
  listing_offer:  { icon: ShoppingBag,    color: '#8B5CF6', bg: '#EDE9FE' },
  default:        { icon: Bell,           color: COLORS.primary, bg: '#E8F5F0' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Ahora';
  if (m < 60) return `Hace ${m} min`;
  if (h < 24) return `Hace ${h}h`;
  if (d < 7) return `Hace ${d}d`;
  return new Date(dateStr).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { markAllAsRead, markAsRead } = useNotificationStore();
  const qc = useQueryClient();

  const { data: notifications = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id ?? '')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    },
    onSuccess: (_, id) => {
      markAsRead(id);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id ?? '')
        .eq('is_read', false);
    },
    onSuccess: () => {
      markAllAsRead();
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Marcar como leídas al abrir la pantalla (todas las visibles)
  useEffect(() => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length > 0) {
      markAllMutation.mutate();
    }
  }, [notifications.length]);

  const handlePress = useCallback((notif: Notification) => {
    if (!notif.is_read) markReadMutation.mutate(notif.id);

    // Navegar según el tipo de notificación
    const d = notif.data as any;
    if (d?.listing_id) {
      router.push(`/listing/${d.listing_id}`);
    } else if (d?.conversation_id) {
      router.push(`/chat/${d.conversation_id}`);
    } else if (d?.trade_request_id) {
      router.push('/trade-requests');
    }
  }, [markReadMutation]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          style={styles.headerBtn}
        >
          <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notificaciones</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => markAllMutation.mutate()}
          style={styles.headerBtn}
          disabled={unreadCount === 0}
        >
          <CheckCheck
            size={20}
            color={unreadCount > 0 ? COLORS.primary : theme.textTertiary}
            strokeWidth={1.75}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {isLoading && (
          <View style={styles.emptyState}>
            <Bell size={48} color={theme.border} strokeWidth={1.25} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>Cargando...</Text>
          </View>
        )}

        {!isLoading && notifications.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}>
              <Bell size={40} color={theme.textTertiary} strokeWidth={1.25} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin notificaciones</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Aquí aparecerán tus trueques, mensajes y novedades
            </Text>
          </View>
        )}

        {notifications.length > 0 && (
          <View style={styles.list}>
            {notifications.map((notif, i) => {
              const meta = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.default;
              const Icon = meta.icon;
              const isUnread = !notif.is_read;

              return (
                <TouchableOpacity
                  key={notif.id}
                  onPress={() => handlePress(notif)}
                  activeOpacity={0.75}
                  style={[
                    styles.notifItem,
                    {
                      backgroundColor: isUnread
                        ? (isDark ? '#1A2B22' : '#F0FAF5')
                        : theme.surface,
                      borderBottomColor: theme.border,
                      borderBottomWidth: i < notifications.length - 1 ? StyleSheet.hairlineWidth : 0,
                    },
                  ]}
                >
                  {/* Indicador no leído */}
                  {isUnread && (
                    <View style={[styles.unreadDot, { backgroundColor: COLORS.primary }]} />
                  )}

                  {/* Ícono */}
                  <View style={[styles.iconWrap, { backgroundColor: isDark ? meta.bg + '22' : meta.bg }]}>
                    <Icon size={22} color={meta.color} strokeWidth={1.75} />
                  </View>

                  {/* Contenido */}
                  <View style={styles.notifContent}>
                    <Text
                      style={[
                        styles.notifTitle,
                        { color: theme.text, fontWeight: isUnread ? '700' : '500' },
                      ]}
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    <Text
                      style={[styles.notifBody, { color: theme.textSecondary }]}
                      numberOfLines={2}
                    >
                      {notif.body}
                    </Text>
                    <Text style={[styles.notifTime, { color: theme.textTertiary }]}>
                      {timeAgo(notif.created_at)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
  headerBtn: { padding: 4, minWidth: 32, alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  headerTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  list: { paddingTop: SPACING.xs },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.base,
    gap: SPACING.md,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    left: 6,
    top: '50%',
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
    marginTop: -3.5,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1, gap: 2 },
  notifTitle: { fontSize: TYPOGRAPHY.size.base },
  notifBody: { fontSize: TYPOGRAPHY.size.sm, lineHeight: 18 },
  notifTime: { fontSize: TYPOGRAPHY.size.xs, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingTop: SPACING['4xl'] * 1.5, paddingHorizontal: SPACING['2xl'] },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: TYPOGRAPHY.size.base, textAlign: 'center', lineHeight: 22 },
});
