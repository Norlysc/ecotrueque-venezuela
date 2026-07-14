import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@services/chat.service';
import { useAuthStore } from '@stores/authStore';
import { useNotificationStore } from '@stores/notificationStore';
import { supabase } from '@lib/supabase';
import type { Message, Conversation } from '@/types/app.types';

const CHAT_KEYS = {
  conversations: (userId: string) => ['chat', 'conversations', userId] as const,
  messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
};

export function useConversations() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const uid = user?.id ?? '';

  const query = useQuery({
    queryKey: CHAT_KEYS.conversations(uid),
    queryFn: () => chatService.getConversations(uid),
    enabled: !!uid,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (!uid) return;
    const channel = chatService.subscribeToConversations(uid, () => {
      qc.invalidateQueries({ queryKey: CHAT_KEYS.conversations(uid) });
    });
    return () => { supabaseChannel(channel); };
  }, [uid, qc]);

  return query;
}

function supabaseChannel(channel: ReturnType<typeof chatService.subscribeToConversations>) {
  channel.unsubscribe();
}

function refreshUnreadMessageCount(uid: string, setUnreadMessageCount: (n: number) => void) {
  supabase
    .rpc('get_unread_message_count', { p_user_id: uid })
    .then(({ data }) => setUnreadMessageCount(data ?? 0));
}

export function useMessages(conversationId: string) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  const { setUnreadMessageCount } = useNotificationStore();

  const query = useQuery({
    queryKey: CHAT_KEYS.messages(conversationId),
    queryFn: () => chatService.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!conversationId) return;

    // Al abrir el chat, marcar como leídos y actualizar el badge global
    chatService.markAsRead(conversationId, uid)
      .then(() => refreshUnreadMessageCount(uid, setUnreadMessageCount))
      .catch(() => {});

    const channel = chatService.subscribeToMessages(conversationId, (newMessage: Message) => {
      qc.setQueryData(
        CHAT_KEYS.messages(conversationId),
        (old: Message[] | undefined) => {
          const existing = old ?? [];
          // Skip if real id already in cache (onSuccess may have added it already)
          if (existing.some(m => m.id === newMessage.id)) return existing;
          // If this is my own message, replace the optimistic placeholder
          if (newMessage.sender_id === uid) {
            const hasOptimistic = existing.some(
              m => m.id.startsWith('optimistic-') && m.sender_id === uid
            );
            if (hasOptimistic) {
              return existing.map(m =>
                m.id.startsWith('optimistic-') && m.sender_id === uid ? newMessage : m
              );
            }
          }
          return [...existing, newMessage];
        }
      );
      if (newMessage.sender_id !== uid) {
        chatService.markAsRead(conversationId, uid)
          .then(() => refreshUnreadMessageCount(uid, setUnreadMessageCount))
          .catch(() => {});
      }
    });

    return () => { channel.unsubscribe(); };
  }, [conversationId, uid, qc]);

  return query;
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      conversationId: string;
      content?: string;
      type?: 'text' | 'image';
      imageUri?: string;
    }) =>
      chatService.sendMessage({
        conversationId: data.conversationId,
        senderId: user?.id ?? '',
        content: data.content,
        type: data.type,
        imageUri: data.imageUri,
      }),
    onMutate: async (variables) => {
      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
        conversation_id: variables.conversationId,
        sender_id: user?.id ?? '',
        type: variables.type ?? 'text',
        content: variables.content ?? null,
        image_url: variables.imageUri ?? null,
        trade_request_id: null,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData(
        CHAT_KEYS.messages(variables.conversationId),
        (old: Message[] | undefined) => [...(old ?? []), optimisticMessage]
      );
      return { optimisticMessage };
    },
    onSuccess: (_newMessage, variables) => {
      qc.invalidateQueries({ queryKey: CHAT_KEYS.conversations(user?.id ?? '') });
    },
    onError: (_, variables, context: any) => {
      qc.setQueryData(
        CHAT_KEYS.messages(variables.conversationId),
        (old: Message[] | undefined) =>
          (old ?? []).filter((m) => m.id !== context?.optimisticMessage?.id)
      );
    },
  });
}

export function useConversationById(conversationId: string) {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: ['chat', 'conversation', conversationId] as const,
    queryFn: () => chatService.getConversationById(conversationId, uid),
    enabled: !!conversationId && !!uid,
    staleTime: 1000 * 60,
  });
}
