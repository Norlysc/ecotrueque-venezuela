import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  useColorScheme, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCreateReview } from '@hooks/useTrades';
import { tradesService } from '@services/trades.service';
import { Avatar } from '@components/ui/Avatar';
import { Button } from '@components/ui/Button';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';

export default function ReviewModal() {
  const params = useLocalSearchParams<{
    tradeRequestId: string;
    reviewedUserId: string;
    reviewedUserName: string;
    reviewedUserAvatar?: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createReview } = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({ type: 'error', text1: 'Selecciona una calificación', text2: 'Elige entre 1 y 5 estrellas' });
      return;
    }
    setIsSubmitting(true);
    try {
      const trade = await tradesService.getTradeByRequestId(params.tradeRequestId);
      if (!trade) {
        Toast.show({ type: 'error', text1: 'Trueque no encontrado', text2: 'El trueque aún no se ha completado' });
        return;
      }
      await createReview({
        trade_id: trade.id,
        reviewed_id: params.reviewedUserId,
        rating,
        comment: comment.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('unique') || msg.includes('duplicate')) {
        Toast.show({ type: 'info', text1: 'Ya dejaste una reseña', text2: 'Solo puedes calificar una vez por trueque' });
        router.back();
      } else {
        Toast.show({ type: 'error', text1: 'Error al enviar reseña' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + SPACING.base }]}>
        {/* Handle + close */}
        <View style={styles.handle} />
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={20} color={theme.textSecondary} strokeWidth={1.75} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>⭐ Califica el trueque</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              ¿Cómo fue tu experiencia con esta persona?
            </Text>
          </View>

          {/* User being reviewed */}
          <View style={styles.userCard}>
            <Avatar
              uri={params.reviewedUserAvatar || null}
              name={params.reviewedUserName}
              size="lg"
              isDark={isDark}
            />
            <Text style={[styles.userName, { color: theme.text }]}>{params.reviewedUserName}</Text>
          </View>

          {/* Star rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={styles.starBtn}
              >
                <Star
                  size={44}
                  color={star <= rating ? '#FFC107' : isDark ? '#3A3A38' : '#E0E0E0'}
                  fill={star <= rating ? '#FFC107' : 'transparent'}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: COLORS.primary }]}>
              {['', '😞 Muy malo', '😐 Regular', '🙂 Bien', '😊 Muy bien', '🤩 Excelente'][rating]}
            </Text>
          )}

          {/* Comment */}
          <View style={[styles.commentBox, { backgroundColor: isDark ? '#252523' : '#F0F2F5', borderColor: theme.border }]}>
            <TextInput
              style={[styles.commentInput, { color: theme.text }]}
              placeholder="Escribe un comentario opcional... (ej: muy puntual, artículo en buen estado)"
              placeholderTextColor={theme.textTertiary}
              multiline
              maxLength={300}
              value={comment}
              onChangeText={setComment}
            />
            <Text style={[styles.charCount, { color: theme.textTertiary }]}>{comment.length}/300</Text>
          </View>

          {/* Submit */}
          <View style={styles.actions}>
            <Button
              label="Omitir"
              variant="ghost"
              size="md"
              onPress={() => router.back()}
            />
            <Button
              label="Enviar reseña"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={rating === 0}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    maxHeight: '90%',
    ...SHADOWS.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: '#C0C0C0',
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.base,
    padding: SPACING.xs,
    zIndex: 1,
  },
  header: { alignItems: 'center', paddingTop: SPACING.sm, marginBottom: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  subtitle: { fontSize: TYPOGRAPHY.size.sm, textAlign: 'center', marginTop: 4 },
  userCard: { alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  userName: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.semibold },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  starBtn: { padding: SPACING.xs },
  ratingLabel: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.lg,
  },
  commentBox: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    minHeight: 100,
  },
  commentInput: {
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: TYPOGRAPHY.size.xs, textAlign: 'right', marginTop: 4 },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'flex-end',
    marginBottom: SPACING.base,
  },
});
