import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserRound, Package, Flag, Ban, X, ChevronLeft, Check, ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Button } from '@components/ui/Button';
import { REPORT_REASONS, reportsService } from '@services/reports.service';
import { useBlockedIds, useToggleBlock } from '@hooks/useBlocks';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';

interface ChatOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  reporterId?: string;
  otherUser?: { id: string; full_name: string | null } | null;
  listing?: { id: string; title: string } | null;
}

// Menú de los tres puntos del chat: ver perfil, ver la publicación, reportar y bloquear a la otra persona
export function ChatOptionsMenu({ visible, onClose, reporterId, otherUser, listing }: ChatOptionsMenuProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<'menu' | 'report' | 'block'>('menu');
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [isSending, setIsSending] = useState(false);
  const name = otherUser?.full_name ?? 'esta persona';
  const { data: blockedIds = [] } = useBlockedIds();
  const { mutate: toggleBlock, isPending: isBlocking } = useToggleBlock();
  const isBlocked = !!otherUser?.id && blockedIds.includes(otherUser.id);

  const close = () => {
    onClose();
    setView('menu');
    setReason(null);
    setDetails('');
  };

  const go = (path: string) => {
    close();
    router.push(path as any);
  };

  const sendReport = async () => {
    if (!reason || !reporterId || !otherUser?.id) return;
    setIsSending(true);
    try {
      await reportsService.reportUser({
        reporterId,
        reportedUserId: otherUser.id,
        listingId: listing?.id,
        reason,
        description: details,
      });
      close();
      Toast.show({ type: 'success', text1: 'Reporte enviado', text2: 'Gracias, lo revisaremos para cuidar a la comunidad' });
    } catch {
      Toast.show({ type: 'error', text1: 'No se envió el reporte', text2: 'Revisa tu conexión e inténtalo de nuevo' });
    } finally {
      setIsSending(false);
    }
  };

  const Option = ({ icon: Icon, label, sub, color = theme.text, onPress }: {
    icon: LucideIcon; label: string; sub?: string; color?: string; onPress: () => void;
  }) => (
    <TouchableOpacity style={[styles.option, { borderBottomColor: theme.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.optionIcon, { backgroundColor: color === COLORS.error ? COLORS.error + '18' : COLORS.primary + '18' }]}>
        <Icon size={20} color={color === COLORS.error ? COLORS.error : COLORS.primary} strokeWidth={1.9} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionLabel, { color }]}>{label}</Text>
        {sub && <Text style={[styles.optionSub, { color: theme.textSecondary }]} numberOfLines={1}>{sub}</Text>}
      </View>
      <ChevronRight size={18} color={theme.textTertiary} strokeWidth={1.75} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + SPACING.base }]}
        >
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            {view !== 'menu' ? (
              <TouchableOpacity onPress={() => setView('menu')} style={styles.headerSide}>
                <ChevronLeft size={22} color={theme.text} strokeWidth={1.75} />
              </TouchableOpacity>
            ) : <View style={styles.headerSide} />}
            <Text style={[styles.title, { color: theme.text }]}>
              {view === 'menu' ? 'Opciones del chat' : view === 'report' ? `Reportar a ${name}` : `Bloquear a ${name}`}
            </Text>
            <TouchableOpacity onPress={close} style={[styles.headerSide, { alignItems: 'flex-end' }]}>
              <X size={22} color={theme.textSecondary} strokeWidth={1.75} />
            </TouchableOpacity>
          </View>

          {view === 'menu' ? (
            <View>
              {otherUser?.id && (
                <Option icon={UserRound} label="Ver perfil" sub={`Reputación y reseñas de ${name}`} onPress={() => go(`/user/${otherUser.id}`)} />
              )}
              {listing?.id && (
                <Option icon={Package} label="Ver publicación" sub={listing.title} onPress={() => go(`/listing/${listing.id}`)} />
              )}
              {otherUser?.id && (
                <Option icon={Flag} label="Reportar usuario" sub="Avísanos si algo no está bien" color={COLORS.error} onPress={() => setView('report')} />
              )}
              {otherUser?.id && (isBlocked ? (
                <Option
                  icon={Ban}
                  label="Desbloquear usuario"
                  sub="Volverás a ver sus publicaciones y podrán escribirse"
                  onPress={() => toggleBlock({ userId: otherUser.id, block: false }, { onSuccess: close })}
                />
              ) : (
                <Option icon={Ban} label="Bloquear usuario" sub="Deja de ver sus publicaciones y mensajes" color={COLORS.error} onPress={() => setView('block')} />
              ))}
            </View>
          ) : view === 'block' ? (
            <View style={styles.reportBody}>
              <Text style={[styles.reportHint, { color: theme.textSecondary }]}>
                Al bloquear a {name} dejarás de ver sus publicaciones y ninguno de los dos podrá enviar mensajes ni
                propuestas de trueque al otro. Puedes desbloquearlo cuando quieras desde este mismo menú.
              </Text>
              <Button
                label="Bloquear"
                variant="danger"
                fullWidth
                isLoading={isBlocking}
                onPress={() => otherUser?.id && toggleBlock({ userId: otherUser.id, block: true }, { onSuccess: close })}
              />
            </View>
          ) : (
            <View style={styles.reportBody}>
              <Text style={[styles.reportHint, { color: theme.textSecondary }]}>
                ¿Qué ocurrió? Tu reporte es confidencial: {name} no sabrá quién lo envió.
              </Text>
              {REPORT_REASONS.map((r) => {
                const selected = reason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.reason, {
                      borderColor: selected ? COLORS.primary : theme.border,
                      backgroundColor: selected ? COLORS.primary + '12' : 'transparent',
                    }]}
                    onPress={() => setReason(r)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.reasonText, { color: theme.text }]}>{r}</Text>
                    {selected && <Check size={18} color={COLORS.primary} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
              <TextInput
                style={[styles.details, { backgroundColor: isDark ? '#252523' : '#F0F2F5', color: theme.text }]}
                placeholder="Cuéntanos más (opcional)"
                placeholderTextColor={theme.textTertiary}
                value={details}
                onChangeText={setDetails}
                multiline
                maxLength={500}
              />
              <Button
                label="Enviar reporte"
                variant="danger"
                fullWidth
                isLoading={isSending}
                disabled={!reason}
                onPress={sendReport}
              />
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, maxHeight: '85%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  headerSide: { width: 32 },
  title: { flex: 1, textAlign: 'center', fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionIcon: { width: 40, height: 40, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  optionSub: { fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },
  reportBody: { padding: SPACING.base, gap: SPACING.sm },
  reportHint: { fontSize: TYPOGRAPHY.size.sm, marginBottom: SPACING.xs },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  reasonText: { fontSize: TYPOGRAPHY.size.base },
  details: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.size.base,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: SPACING.xs,
  },
});
