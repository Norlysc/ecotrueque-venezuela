import { supabase, uploadImage } from '@lib/supabase';
import type { Conversation, Message } from '@/types/app.types';

export const chatService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!participant_1_id(*),
        participant_2:profiles!participant_2_id(*),
        trade_request:trade_requests(
          *,
          requested_listing:listings!requested_listing_id(title, images)
        ),
        listing:listings!listing_id(id, title, images),
        last_message:messages(content, type, created_at, sender_id, is_read)
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    return (data ?? []).map((conv: any) => {
      const other =
        conv.participant_1_id === userId ? conv.participant_2 : conv.participant_1;
      const lastMsg = Array.isArray(conv.last_message)
        ? conv.last_message[0]
        : conv.last_message;

      const unreadCount = Array.isArray(conv.last_message)
        ? conv.last_message.filter((m: any) => !m.is_read && m.sender_id !== userId).length
        : 0;

      const listing = Array.isArray(conv.listing) ? conv.listing[0] : conv.listing;
      return {
        ...conv,
        other_user: other,
        last_message: lastMsg,
        unread_count: unreadCount,
        listing: listing ?? null,
      } as Conversation;
    });
  },

  async getMessages(
    conversationId: string,
    limit = 50,
    before?: string
  ): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Message[];
  },

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content?: string;
    type?: 'text' | 'image' | 'system';
    imageUri?: string;
  }): Promise<Message> {
    let image_url: string | null = null;

    if (data.imageUri) {
      const path = `${data.senderId}/${Date.now()}.jpg`;
      image_url = await uploadImage('messages', path, data.imageUri);
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: data.conversationId,
        sender_id: data.senderId,
        type: data.type ?? (image_url ? 'image' : 'text'),
        content: data.content ?? null,
        image_url,
        is_read: false,
      })
      .select('*, sender:profiles!sender_id(*)')
      .single();

    if (error) throw error;

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', data.conversationId);

    return message as Message;
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);
  },

  subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => onMessage(payload.new as Message)
      )
      .subscribe();
  },

  async getOrCreateListingConversation(
    currentUserId: string,
    otherUserId: string,
    listingId: string
  ): Promise<string> {
    // Buscar conversación existente para esta publicación específica
    const { data: asP1 } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('participant_1_id', currentUserId)
      .eq('participant_2_id', otherUserId)
      .limit(1);

    if (asP1 && asP1.length > 0) return asP1[0].id;

    const { data: asP2 } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('participant_1_id', otherUserId)
      .eq('participant_2_id', currentUserId)
      .limit(1);

    if (asP2 && asP2.length > 0) return asP2[0].id;

    // No existe: crear conversación vinculada a esta publicación
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: currentUserId,
        participant_2_id: otherUserId,
        listing_id: listingId,
      })
      .select('id')
      .single();

    if (error) throw error;
    return newConv.id;
  },

  async getConversationById(conversationId: string, userId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!participant_1_id(*),
        participant_2:profiles!participant_2_id(*),
        trade_request:trade_requests(*),
        listing:listings!listing_id(id, title, images)
      `)
      .eq('id', conversationId)
      .single();
    if (error) return null;
    const other = data.participant_1_id === userId ? data.participant_2 : data.participant_1;
    const tr = Array.isArray(data.trade_request) ? data.trade_request[0] : data.trade_request;
    const listing = Array.isArray(data.listing) ? data.listing[0] : data.listing;
    return { ...data, other_user: other, trade_request: tr, listing: listing ?? null } as Conversation;
  },

  subscribeToConversations(
    userId: string,
    onUpdate: (conversation: Conversation) => void
  ) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_1_id=eq.${userId}`,
        },
        (payload) => onUpdate(payload.new as Conversation)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_2_id=eq.${userId}`,
        },
        (payload) => onUpdate(payload.new as Conversation)
      )
      .subscribe();
  },
};
