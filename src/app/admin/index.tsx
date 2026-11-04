import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';
import { router } from 'expo-router';
import { ArrowLeft, ShieldCheck, Flag, UserRound, Package, ChevronRight, ShieldAlert } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@components/ui/Button';
import { useAdminReports, useIsAdmin, usePauseListing, useUpdateReport } from '@hooks/useAdmin';
import { REPORT_STATUS_LABEL, availableActions, countByStatus, filterReports } from '@utils/reports';
import type { ReportFilter, ReportStatus } from '@utils/reports';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';

const FILTROS: { id: ReportFilter; label: string }[] = [
  { id: 'pending', label: 'Pendientes' },
  { id: 'reviewed', label: 'En revisión' },
  { id: 'resolved', label: 'Resueltos' },
  { id: 'all', label: 'Todos' },
];

const COLOR_ESTADO: Record<ReportStatus, string> = {
  pending: COLORS.warning,
  reviewed: COLORS.info,
  resolved: COLORS.success,
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });

// Panel de administración: reportes de la comunidad, su revisión y la pausa de publicaciones
export default function AdminScreen() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const isAdmin = useIsAdmin();
  const [filtro, setFiltro] = useState<ReportFilter>('pending');
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nota, setNota] = useState('');

  const { data: reports = [], isLoading, refetch, isRefetching } = useAdminReports();
  const { mutate: updateReport, isPending: actualizando } = useUpdateReport();
  const { mutate: pauseListing, isPending: pausando } = usePauseListing();

  const conteo = countByStatus(reports);
  const visibles = filterReports(reports, filtro);

  const cambiarEstado = (id: string, status: ReportStatus) =>
    updateReport({ reportId: id, status, note: nota }, { onSuccess: () => { setAbierto(null); setNota(''); } });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
          style={styles.headerBtn}
          accessibilityLabel="Volver"
        >
          <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Panel de administración</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {isAdmin ? `${conteo.pending} ${conteo.pending === 1 ? 'reporte pendiente' : 'reportes pendientes'}` : 'Acceso restringido'}
          </Text>
        </View>
        <ShieldCheck size={22} color={COLORS.primary} strokeWidth={1.75} />
      </View>

      {!isAdmin ? (
        <View style={styles.empty}>
          <ShieldAlert size={44} color={theme.textTertiary} strokeWidth={1.25} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Solo para administradores</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            Tu cuenta no tiene permisos para revisar reportes.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll} contentContainerStyle={styles.filtros}>
            {FILTROS.map((f) => {
              const activo = filtro === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFiltro(f.id)}
                  style={[styles.chip, { backgroundColor: activo ? COLORS.primary : isDark ? '#252523' : '#F0F2F5' }]}
                >
                  <Text style={[styles.chipText, { color: activo ? '#fff' : theme.textSecondary }]}>
                    {f.label} ({conteo[f.id]})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            contentContainerStyle={{ padding: SPACING.base, gap: SPACING.md, paddingBottom: insets.bottom + SPACING['3xl'] }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
          >
            {isLoading && <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Cargando reportes...</Text>}

            {!isLoading && visibles.length === 0 && (
              <View style={styles.empty}>
                <Flag size={40} color={theme.textTertiary} strokeWidth={1.25} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin reportes en esta lista</Text>
                <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                  Los reportes que envíe la comunidad desde el chat aparecerán aquí.
                </Text>
              </View>
            )}

            {visibles.map((r) => {
              const acciones = availableActions(r.status, r.reported_listing?.status);
              const expandido = abierto === r.id;
              return (
                <View key={r.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <TouchableOpacity onPress={() => { setAbierto(expandido ? null : r.id); setNota(r.admin_note ?? ''); }} activeOpacity={0.8}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.reason, { color: theme.text }]} numberOfLines={2}>{r.reason}</Text>
                      <View style={[styles.badge, { backgroundColor: COLOR_ESTADO[r.status] + '22' }]}>
                        <Text style={[styles.badgeText, { color: COLOR_ESTADO[r.status] }]}>{REPORT_STATUS_LABEL[r.status]}</Text>
                      </View>
                    </View>
                    {!!r.description && (
                      <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={expandido ? undefined : 2}>
                        {r.description}
                      </Text>
                    )}
                    <Text style={[styles.meta, { color: theme.textTertiary }]}>
                      Enviado por {r.reporter?.full_name ?? 'usuario'} · {fecha(r.created_at)}
                    </Text>
                  </TouchableOpacity>

                  {r.reported_user && (
                    <TouchableOpacity style={styles.link} onPress={() => router.push(`/user/${r.reported_user!.id}`)}>
                      <UserRound size={16} color={COLORS.primary} strokeWidth={1.9} />
                      <Text style={[styles.linkText, { color: theme.text }]} numberOfLines={1}>Reportado: {r.reported_user.full_name}</Text>
                      <ChevronRight size={16} color={theme.textTertiary} strokeWidth={1.75} />
                    </TouchableOpacity>
                  )}
                  {r.reported_listing && (
                    <TouchableOpacity style={styles.link} onPress={() => router.push(`/listing/${r.reported_listing!.id}`)}>
                      <Package size={16} color={COLORS.primary} strokeWidth={1.9} />
                      <Text style={[styles.linkText, { color: theme.text }]} numberOfLines={1}>
                        {r.reported_listing.title}{r.reported_listing.status === 'paused' ? ' · pausada' : ''}
                      </Text>
                      <ChevronRight size={16} color={theme.textTertiary} strokeWidth={1.75} />
                    </TouchableOpacity>
                  )}

                  {!!r.admin_note && !expandido && (
                    <Text style={[styles.nota, { color: theme.textSecondary, backgroundColor: isDark ? '#252523' : '#F4F7F5' }]}>
                      Nota: {r.admin_note}
                    </Text>
                  )}

                  {expandido && (
                    <View style={{ gap: SPACING.sm, marginTop: SPACING.sm }}>
                      <TextInput
                        style={[styles.input, { backgroundColor: isDark ? '#252523' : '#F0F2F5', color: theme.text }]}
                        placeholder="Nota de la revisión (opcional)"
                        placeholderTextColor={theme.textTertiary}
                        value={nota}
                        onChangeText={setNota}
                        multiline
                        maxLength={300}
                      />
                      <View style={styles.acciones}>
                        {acciones.review && (
                          <Button label="Marcar en revisión" variant="outline" size="sm" isLoading={actualizando} onPress={() => cambiarEstado(r.id, 'reviewed')} />
                        )}
                        {acciones.resolve && (
                          <Button label="Resolver" size="sm" isLoading={actualizando} onPress={() => cambiarEstado(r.id, 'resolved')} />
                        )}
                        {acciones.reopen && (
                          <Button label="Reabrir" variant="outline" size="sm" isLoading={actualizando} onPress={() => cambiarEstado(r.id, 'pending')} />
                        )}
                        {acciones.pauseListing && (
                          <Button label="Pausar publicación" variant="danger" size="sm" isLoading={pausando} onPress={() => pauseListing(r.reported_listing!.id)} />
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.base, paddingBottom: SPACING.md },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  headerSub: { fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },
  filtrosScroll: { flexGrow: 0 },
  filtros: { gap: SPACING.xs, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, alignItems: 'center' },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: 7, borderRadius: RADIUS.full },
  chipText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  card: { borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.xs },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  reason: { flex: 1, fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  badgeText: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.semibold },
  desc: { fontSize: TYPOGRAPHY.size.sm, marginTop: 4 },
  meta: { fontSize: TYPOGRAPHY.size.xs, marginTop: 6 },
  link: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 6 },
  linkText: { flex: 1, fontSize: TYPOGRAPHY.size.sm },
  nota: { fontSize: TYPOGRAPHY.size.xs, padding: SPACING.sm, borderRadius: RADIUS.md },
  input: { borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: TYPOGRAPHY.size.sm, minHeight: 60, textAlignVertical: 'top' },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  empty: { alignItems: 'center', paddingVertical: SPACING['3xl'], paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  emptyTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  emptySub: { fontSize: TYPOGRAPHY.size.sm, textAlign: 'center' },
});
