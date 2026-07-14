import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { tradesService } from '@services/trades.service';
import { ecoService } from '@services/eco.service';
import { useAuthStore } from '@stores/authStore';

const TRADE_KEYS = {
  my: (userId: string) => ['trades', 'my', userId] as const,
  received: (userId: string) => ['trades', 'received', userId] as const,
  history: (userId: string) => ['trades', 'history', userId] as const,
  metrics: (userId: string) => ['eco', 'metrics', userId] as const,
};

export function useMyTradeRequests() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: TRADE_KEYS.my(uid),
    queryFn: () => tradesService.getMyRequests(uid),
    enabled: !!uid,
  });
}

export function useReceivedRequests() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: TRADE_KEYS.received(uid),
    queryFn: () => tradesService.getReceivedRequests(uid),
    enabled: !!uid,
    refetchInterval: 30000,
  });
}

export function useTradeHistory() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: TRADE_KEYS.history(uid),
    queryFn: () => tradesService.getTradeHistory(uid),
    enabled: !!uid,
  });
}

export function useCreateTradeRequest() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      requested_listing_id: string;
      offered_listing_id: string;
      owner_id: string;
      message?: string;
    }) =>
      tradesService.createRequest({
        requester_id: user?.id ?? '',
        owner_id: data.owner_id,
        requested_listing_id: data.requested_listing_id,
        offered_listing_id: data.offered_listing_id,
        message: data.message,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRADE_KEYS.my(user?.id ?? '') });
      Toast.show({
        type: 'success',
        text1: '¡Propuesta enviada! 🤝',
        text2: 'El otro usuario recibirá una notificación',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error al enviar propuesta',
        text2: 'Por favor intenta de nuevo',
      });
    },
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: 'accept' | 'reject' }) =>
      tradesService.respondToRequest(requestId, action, user?.id ?? ''),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: TRADE_KEYS.received(user?.id ?? '') });
      Toast.show({
        type: 'success',
        text1: action === 'accept' ? '✅ Trueque aceptado' : '❌ Trueque rechazado',
      });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Error al responder' });
    },
  });
}

export function useConfirmMeeting() {
  const qc = useQueryClient();
  const { user, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: ({ requestId, isRequester }: { requestId: string; isRequester: boolean }) =>
      tradesService.confirmMeeting(requestId, isRequester),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['trades'] });
      qc.invalidateQueries({ queryKey: ['eco', 'metrics', user?.id ?? ''] });
      qc.invalidateQueries({ queryKey: ['chat'] });
      // Refresh profile stats from DB (complete_trade may have updated them)
      if (user?.id) {
        const { authService } = await import('@services/auth.service');
        const freshProfile = await authService.getProfile(user.id);
        if (freshProfile) setProfile(freshProfile);
      }
      Toast.show({
        type: 'success',
        text1: '✅ Encuentro confirmado',
        text2: 'Si el otro también confirma, el trueque se completará',
      });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Error al confirmar', text2: 'Inténtalo de nuevo' });
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (data: {
      trade_id: string;
      reviewed_id: string;
      rating: number;
      comment?: string;
    }) =>
      tradesService.createReview({
        trade_id: data.trade_id,
        reviewer_id: user?.id ?? '',
        reviewed_id: data.reviewed_id,
        rating: data.rating,
        comment: data.comment,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRADE_KEYS.history(user?.id ?? '') });
      qc.invalidateQueries({ queryKey: ['reviews', 'my', user?.id ?? ''] });
      qc.invalidateQueries({ queryKey: ['reviews', 'hasReviewed'] });
      Toast.show({
        type: 'success',
        text1: '⭐ Reseña enviada',
        text2: 'Gracias por tu valoración',
      });
    },
    onError: () => {
      Toast.show({ type: 'error', text1: 'Error al enviar reseña' });
    },
  });
}

export function useEcoMetrics() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: TRADE_KEYS.metrics(uid),
    queryFn: () => ecoService.getMetrics(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyReviews() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: ['reviews', 'my', uid] as const,
    queryFn: () => tradesService.getMyReviews(uid),
    enabled: !!uid,
  });
}

export function useHasReviewed(tradeRequestId: string | null | undefined) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['reviews', 'hasReviewed', tradeRequestId, user?.id] as const,
    queryFn: async () => {
      if (!tradeRequestId || !user?.id) return false;
      const trade = await tradesService.getTradeByRequestId(tradeRequestId);
      if (!trade) return false;
      return tradesService.hasReviewed(trade.id, user.id);
    },
    enabled: !!tradeRequestId && !!user?.id,
    staleTime: 1000 * 60,
  });
}
