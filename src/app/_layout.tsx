import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { queryClient } from '@lib/queryClient';
import { supabase } from '@lib/supabase';
import { useAuthStore } from '@stores/authStore';
import { useThemeStore } from '@stores/themeStore';
import { useNotificationStore } from '@stores/notificationStore';
import { toastConfig } from '@components/ui/Toast';
import { authService } from '@services/auth.service';
import type { Notification } from '@/types/app.types';

export default function RootLayout() {
  const { setSession, setProfile, setLoading, user } = useAuthStore();
  const { loadSaved } = useThemeStore();
  const { addNotification, setUnreadCount, setUnreadMessageCount, incrementUnreadMessageCount } = useNotificationStore();

  useEffect(() => {
    loadSaved();
  }, []);

  // Carga inicial de conteos no leídos
  useEffect(() => {
    if (!user?.id) return;

    // Conteo de notificaciones no leídas
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .then(({ count }) => setUnreadCount(count ?? 0));

    // Conteo de mensajes no leídos
    supabase
      .rpc('get_unread_message_count', { p_user_id: user.id })
      .then(({ data }) => setUnreadMessageCount(data ?? 0));
  }, [user?.id]);

  // Suscripción realtime a notificaciones nuevas
  useEffect(() => {
    if (!user?.id) return;

    const notifChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new as Notification;
          addNotification(notif);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Toast.show({
            type: 'info',
            text1: notif.title,
            text2: notif.body,
            visibilityTime: 4000,
          });
        }
      )
      .subscribe();

    // Suscripción realtime a mensajes nuevos (para badge del chat)
    const msgChannel = supabase
      .channel(`messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as any;
          if (msg.sender_id !== user.id) {
            incrementUnreadMessageCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        setProfile(profile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.root}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="listing/[id]"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="chat/[conversationId]"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="trade/request"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="eco/dashboard"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="about"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="trade-requests"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="edit-profile"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="review-modal"
              options={{ presentation: 'transparentModal', animation: 'fade' }}
            />
            <Stack.Screen
              name="user/[userId]"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="edit-listing/[id]"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="notifications"
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
          </Stack>
          <StatusBar style="auto" />
          <Toast config={toastConfig} />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
