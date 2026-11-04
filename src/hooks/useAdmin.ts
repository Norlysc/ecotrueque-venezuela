import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { adminService } from '@services/admin.service';
import { useAuthStore } from '@stores/authStore';
import type { ReportStatus } from '@utils/reports';

const ADMIN_KEYS = { reports: ['admin', 'reports'] as const };

/** El rol se lee del perfil (profiles.is_admin); el servidor lo vuelve a comprobar en cada operación */
export function useIsAdmin(): boolean {
  const { profile } = useAuthStore();
  return !!profile?.is_admin;
}

export function useAdminReports() {
  const isAdmin = useIsAdmin();
  return useQuery({
    queryKey: ADMIN_KEYS.reports,
    queryFn: () => adminService.getReports(),
    enabled: isAdmin,
    staleTime: 30_000,
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, status, note }: { reportId: string; status: ReportStatus; note?: string }) =>
      adminService.updateReport(reportId, status, note),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.reports });
      Toast.show({
        type: 'success',
        text1: status === 'resolved' ? 'Reporte resuelto' : status === 'reviewed' ? 'Reporte en revisión' : 'Reporte reabierto',
        text2: status === 'pending' ? undefined : 'Se avisó a quien lo envió',
      });
    },
    onError: () => Toast.show({ type: 'error', text1: 'No se pudo actualizar el reporte' }),
  });
}

export function usePauseListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => adminService.pauseListing(listingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.reports });
      qc.invalidateQueries({ queryKey: ['listings'] });
      Toast.show({ type: 'success', text1: 'Publicación pausada', text2: 'Ya no aparece en explorar ni en el mapa' });
    },
    onError: () => Toast.show({ type: 'error', text1: 'No se pudo pausar la publicación' }),
  });
}
