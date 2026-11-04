import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { blocksService, BlocksNotAvailableError } from '@services/blocks.service';
import { useAuthStore } from '@stores/authStore';

const BLOCK_KEYS = { mine: (userId: string) => ['blocks', userId] as const };

/** Personas que el usuario actual bloqueó */
export function useBlockedIds() {
  const { user } = useAuthStore();
  const uid = user?.id ?? '';
  return useQuery({
    queryKey: BLOCK_KEYS.mine(uid),
    queryFn: () => blocksService.getBlockedIds(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleBlock() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: ({ userId, block }: { userId: string; block: boolean }) =>
      block ? blocksService.block(user!.id, userId) : blocksService.unblock(user!.id, userId),
    onSuccess: (_, { block }) => {
      qc.invalidateQueries({ queryKey: ['blocks'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
      Toast.show({
        type: 'success',
        text1: block ? 'Usuario bloqueado' : 'Usuario desbloqueado',
        text2: block ? 'Ya no verás sus publicaciones ni podrán escribirse' : 'Vuelves a ver sus publicaciones',
      });
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'No se pudo completar',
        text2: error instanceof BlocksNotAvailableError ? error.message : 'Revisa tu conexión e inténtalo de nuevo',
      });
    },
  });
}
