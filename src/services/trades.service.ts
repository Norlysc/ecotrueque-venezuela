import { supabase } from '@lib/supabase';
import type { TradeRequest, Trade, Review } from '@/types/app.types';

export const tradesService = {
  async createRequest(data: {
    requester_id: string;
    owner_id: string;
    requested_listing_id: string;
    offered_listing_id: string;
    message?: string;
  }): Promise<TradeRequest> {
    const { data: request, error: requestError } = await supabase
      .from('trade_requests')
      .insert({
        requester_id: data.requester_id,
        owner_id: data.owner_id,
        requested_listing_id: data.requested_listing_id,
        offered_listing_id: data.offered_listing_id,
        message: data.message ?? null,
        status: 'pending',
        requester_confirmed: false,
        owner_confirmed: false,
      })
      .select()
      .single();

    if (requestError) throw requestError;

    const { data: conversation } = await supabase
      .from('conversations')
      .insert({
        trade_request_id: request.id,
        participant_1_id: data.requester_id,
        participant_2_id: data.owner_id,
      })
      .select()
      .single();

    if (data.message && conversation) {
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: data.requester_id,
        type: 'trade_proposal',
        content: data.message,
        trade_request_id: request.id,
      });
    }

    await supabase.from('notifications').insert({
      user_id: data.owner_id,
      type: 'trade_request',
      title: '🤝 Nueva propuesta de trueque',
      body: 'Alguien quiere intercambiar contigo',
      data: { trade_request_id: request.id },
    });

    return request as TradeRequest;
  },

  async respondToRequest(
    requestId: string,
    action: 'accept' | 'reject',
    userId: string
  ): Promise<void> {
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { data: request, error } = await supabase
      .from('trade_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;

    const notifType = action === 'accept' ? 'trade_accepted' : 'trade_rejected';
    const notifTitle = action === 'accept' ? '✅ ¡Trueque aceptado!' : '❌ Trueque rechazado';

    await supabase.from('notifications').insert({
      user_id: (request as any).requester_id,
      type: notifType,
      title: notifTitle,
      body: action === 'accept' ? '¡Coordina el lugar de encuentro!' : 'El dueño rechazó tu propuesta.',
      data: { trade_request_id: requestId },
    });
  },

  async confirmMeeting(requestId: string, isRequester: boolean): Promise<void> {
    const field = isRequester ? 'requester_confirmed' : 'owner_confirmed';
    await supabase
      .from('trade_requests')
      .update({ [field]: true })
      .eq('id', requestId);

    const { data: request } = await supabase
      .from('trade_requests')
      .select('requester_confirmed, owner_confirmed')
      .eq('id', requestId)
      .single();

    if (request?.requester_confirmed && request?.owner_confirmed) {
      await supabase.rpc('complete_trade', { p_request_id: requestId });
    }
  },

  async cancelRequest(requestId: string): Promise<void> {
    await supabase
      .from('trade_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);
  },

  async getMyRequests(userId: string): Promise<TradeRequest[]> {
    const { data, error } = await supabase
      .from('trade_requests')
      .select(`
        *,
        requester:profiles!requester_id(*),
        owner:profiles!owner_id(*),
        requested_listing:listings!requested_listing_id(*),
        offered_listing:listings!offered_listing_id(*)
      `)
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TradeRequest[];
  },

  async getReceivedRequests(userId: string): Promise<TradeRequest[]> {
    const { data, error } = await supabase
      .from('trade_requests')
      .select(`
        *,
        requester:profiles!requester_id(*),
        owner:profiles!owner_id(*),
        requested_listing:listings!requested_listing_id(*),
        offered_listing:listings!offered_listing_id(*)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as TradeRequest[];
  },

  async getTradeHistory(userId: string): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        requested_listing:listings!requested_listing_id(id, title, images, category),
        offered_listing:listings!offered_listing_id(id, title, images, category),
        requester:profiles!requester_id(id, full_name, avatar_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `)
      .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
      .order('completed_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Trade[];
  },

  async getMyReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(*)')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Review[];
  },

  async getTradeByRequestId(requestId: string): Promise<Trade | null> {
    const { data } = await supabase
      .from('trades')
      .select(`
        *,
        requested_listing:listings!requested_listing_id(id, title, images, category),
        offered_listing:listings!offered_listing_id(id, title, images, category)
      `)
      .eq('trade_request_id', requestId)
      .maybeSingle();
    return data as Trade | null;
  },

  async hasReviewed(tradeId: string, reviewerId: string): Promise<boolean> {
    const { data } = await supabase
      .from('reviews')
      .select('id')
      .eq('trade_id', tradeId)
      .eq('reviewer_id', reviewerId)
      .maybeSingle();
    return !!data;
  },

  async createReview(data: {
    trade_id: string;
    reviewer_id: string;
    reviewed_id: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        trade_id: data.trade_id,
        reviewer_id: data.reviewer_id,
        reviewed_id: data.reviewed_id,
        rating: data.rating,
        comment: data.comment ?? null,
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: data.reviewed_id,
      type: 'new_review',
      title: '⭐ Nueva reseña',
      body: `Recibiste ${data.rating} estrellas en tu trueque`,
      data: { trade_id: data.trade_id },
    });

    return review as Review;
  },
};
