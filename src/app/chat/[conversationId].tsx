import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, EllipsisVertical, Image as ImageIcon, Camera, Send, CheckCircle, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useMessages, useSendMessage, useConversationById } from '@hooks/useChat';
import { useRespondToRequest, useConfirmMeeting, useHasReviewed } from '@hooks/useTrades';
import { useAuthStore } from '@stores/authStore';
import { Avatar } from '@components/ui/Avatar';
import { Button } from '@components/ui/Button';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import type { Message } from '@/types/app.types';

const formatMessageDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Hoy';
  if (isYesterday(date)) return 'Ayer';
  return format(date, "d 'de' MMMM", { locale: es });
};

const formatMessageTime = (dateStr: string): string =>
  format(new Date(dateStr), 'HH:mm');

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const { profile } = useAuthStore();
  const [text, setText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const { data: messages, isLoading } = useMessages(conversationId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { data: conversation } = useConversationById(conversationId);
  const { mutate: respondToRequest, isPending: isResponding } = useRespondToRequest();
  const { mutate: confirmMeeting, isPending: isConfirming } = useConfirmMeeting();
  const otherUser = conversation?.other_user;
  const tradeStatus = conversation?.trade_request?.status;
  const tradeRequestId = conversation?.trade_request_id;
  const listingTitle = conversation?.listing?.title ?? null;
  const listingImage = conversation?.listing?.images?.[0]?.url ?? null;
  const isRequester = conversation?.trade_request?.requester_id === profile?.id;
  const myConfirmed = isRequester
    ? conversation?.trade_request?.requester_confirmed
    : conversation?.trade_request?.owner_confirmed;
  const otherConfirmed = isRequester
    ? conversation?.trade_request?.owner_confirmed
    : conversation?.trade_request?.requester_confirmed;
  const { data: hasReviewed } = useHasReviewed(tradeStatus === 'completed' ? tradeRequestId : null);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages?.length]);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    sendMessage({ conversationId, content: text.trim(), type: 'text' });
    setText('');
  }, [text, conversationId, sendMessage]);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Sin permiso', text2: 'Necesitamos acceso a tu galería' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      sendMessage({ conversationId, imageUri: result.assets[0].uri, type: 'image' });
    }
  };

  const handleCamera = async () => {
    if (Platform.OS === 'web') {
      Toast.show({ type: 'info', text1: 'Solo en móvil', text2: 'La cámara solo está disponible en la app móvil' });
      return;
    }
    try {
      const r = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!r.canceled && r.assets[0]) {
        sendMessage({ conversationId, imageUri: r.assets[0].uri, type: 'image' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error de cámara', text2: 'No se pudo acceder a la cámara' });
    }
  };

  const handleLongPress = (messageId: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelectedMessageId(messageId);
    if (Platform.OS === 'web') {
      window.alert('Mantén presionado para opciones');
      setSelectedMessageId(null);
    } else {
      Alert.alert('Mensaje', 'Opciones', [
        { text: 'Copiar', onPress: () => setSelectedMessageId(null) },
        { text: 'Cancelar', style: 'cancel', onPress: () => setSelectedMessageId(null) },
      ]);
    }
  };

  const handleConfirmMeeting = () => {
    if (!tradeRequestId) return;
    confirmMeeting(
      { requestId: tradeRequestId, isRequester },
      { onSuccess: () => { /* conversation will refetch via cache invalidation */ } }
    );
  };

  const groupedMessages = (messages ?? []).reduce(
    (acc: { date: string; messages: Message[] }[], msg: Message) => {
      const dateLabel = formatMessageDate(msg.created_at);
      const group = acc.find((g) => g.date === dateLabel);
      if (group) {
        group.messages.push(msg);
      } else {
        acc.push({ date: dateLabel, messages: [msg] });
      }
      return acc;
    },
    []
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === profile?.id;
    const isSelected = selectedMessageId === item.id;

    if (item.type === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Text style={[styles.systemMessageText, { color: theme.textSecondary }]}>
            {item.content}
          </Text>
        </View>
      );
    }

    if (item.type === 'trade_proposal') {
      return (
        <View style={[styles.tradeProposal, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}>
          <Text style={[styles.tradeProposalTitle, { color: COLORS.primaryDark }]}>
            🤝 Propuesta de trueque
          </Text>
          {item.content ? (
            <Text style={[styles.tradeProposalText, { color: COLORS.primaryDark }]}>
              {item.content}
            </Text>
          ) : null}
          {!isMe && tradeStatus === 'pending' && tradeRequestId && (
            <View style={styles.tradeProposalActions}>
              <Button
                label="Aceptar"
                variant="primary"
                size="sm"
                isLoading={isResponding}
                onPress={() => respondToRequest({ requestId: tradeRequestId, action: 'accept' })}
              />
              <Button
                label="Rechazar"
                variant="danger"
                size="sm"
                isLoading={isResponding}
                onPress={() => respondToRequest({ requestId: tradeRequestId, action: 'reject' })}
              />
            </View>
          )}
          {tradeStatus && tradeStatus !== 'pending' && (
            <Text style={{ color: tradeStatus === 'accepted' ? COLORS.success : COLORS.error, fontWeight: '600', marginTop: 4 }}>
              {tradeStatus === 'accepted' ? '✅ Aceptado' : tradeStatus === 'rejected' ? '❌ Rechazado' : `Estado: ${tradeStatus}`}
            </Text>
          )}
        </View>
      );
    }

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item.id)}
        activeOpacity={0.8}
        style={[styles.messageRow, isMe && styles.messageRowMe, isSelected && styles.messageSelected]}
      >
        {!isMe && (
          <Avatar
            uri={item.sender?.avatar_url ?? null}
            name={item.sender?.full_name ?? ''}
            size="xs"
            isDark={isDark}
          />
        )}
        <View
          style={[
            styles.bubble,
            isMe
              ? [styles.bubbleMe, { backgroundColor: COLORS.primary }]
              : [styles.bubbleThem, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }],
          ]}
        >
          {item.type === 'image' && item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.messageImage} />
          ) : (
            <Text style={[styles.bubbleText, { color: isMe ? '#fff' : theme.text }]}>
              {item.content}
            </Text>
          )}
          <View style={styles.bubbleFooter}>
            <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : theme.textTertiary }]}>
              {formatMessageTime(item.created_at)}
            </Text>
            {isMe && (
              item.is_read
                ? <CheckCircle size={12} color="rgba(255,255,255,0.9)" strokeWidth={1.75} />
                : <Check size={12} color="rgba(255,255,255,0.6)" strokeWidth={1.75} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerInfo}
          activeOpacity={0.7}
          onPress={() => otherUser?.id && router.push(`/user/${otherUser.id}`)}
        >
          <Avatar
            uri={otherUser?.avatar_url ?? null}
            name={otherUser?.full_name ?? 'Usuario'}
            size="sm"
            isDark={isDark}
          />
          <View>
            <Text style={[styles.headerName, { color: theme.text }]}>
              {otherUser?.full_name ?? 'Conversación'}
            </Text>
            {listingTitle && !tradeStatus && (
              <Text style={[styles.onlineStatus, { color: COLORS.primary }]} numberOfLines={1}>
                📦 {listingTitle}
              </Text>
            )}
            {tradeStatus && (
              <Text style={[styles.onlineStatus, {
                color: tradeStatus === 'pending' ? COLORS.warning
                  : tradeStatus === 'accepted' ? COLORS.success
                  : COLORS.error
              }]}>
                {tradeStatus === 'pending' ? '⏳ Pendiente'
                  : tradeStatus === 'accepted' ? '✅ Aceptado'
                  : tradeStatus === 'rejected' ? '❌ Rechazado'
                  : tradeStatus === 'completed' ? '🎉 Completado'
                  : ''}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <EllipsisVertical size={22} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* Confirm meeting banner */}
      {tradeStatus === 'accepted' && (
        <View style={[styles.confirmBanner, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0', borderColor: COLORS.primary + '40' }]}>
          <Text style={[styles.confirmBannerTitle, { color: COLORS.primaryDark }]}>
            🤝 ¿Realizaron el encuentro?
          </Text>
          <Text style={[styles.confirmBannerSub, { color: COLORS.primary }]}>
            Ambos deben confirmar para completar el trueque
          </Text>
          <View style={styles.confirmStatus}>
            <View style={styles.confirmStatusItem}>
              <Text style={{ fontSize: 18 }}>{myConfirmed ? '✅' : '⏳'}</Text>
              <Text style={[styles.confirmStatusLabel, { color: theme.textSecondary }]}>
                {myConfirmed ? 'Tú confirmaste' : 'Tú: pendiente'}
              </Text>
            </View>
            <View style={styles.confirmStatusItem}>
              <Text style={{ fontSize: 18 }}>{otherConfirmed ? '✅' : '⏳'}</Text>
              <Text style={[styles.confirmStatusLabel, { color: theme.textSecondary }]}>
                {otherConfirmed ? 'El otro confirmó' : 'El otro: pendiente'}
              </Text>
            </View>
          </View>
          {!myConfirmed && (
            <Button
              label="Confirmar que se realizó el encuentro"
              variant="primary"
              size="sm"
              fullWidth
              isLoading={isConfirming}
              onPress={handleConfirmMeeting}
            />
          )}
        </View>
      )}

      {/* Review banner */}
      {tradeStatus === 'completed' && (
        <View style={[styles.reviewBanner, {
          backgroundColor: hasReviewed
            ? isDark ? '#0F2D24' : '#E8F5F0'
            : isDark ? '#1A1500' : '#FFFBEA',
          borderColor: hasReviewed ? COLORS.primary + '60' : '#FFC107' + '60',
        }]}>
          <Text style={[styles.reviewBannerTitle, {
            color: hasReviewed
              ? COLORS.primary
              : isDark ? '#FFC107' : '#B8860B',
          }]}>
            {hasReviewed ? '✅ Reseña enviada' : '⭐ ¡Trueque completado!'}
          </Text>
          <Text style={[styles.reviewBannerSub, { color: theme.textSecondary }]}>
            {hasReviewed
              ? `Ya calificaste a ${otherUser?.full_name ?? 'esta persona'}`
              : `Califica a ${otherUser?.full_name ?? 'tu compañero'} para ayudar a la comunidad`}
          </Text>
          {!hasReviewed && (
            <Button
              label="Dejar reseña"
              variant="outline"
              size="sm"
              fullWidth
              onPress={() =>
                router.push({
                  pathname: '/review-modal',
                  params: {
                    tradeRequestId: tradeRequestId ?? '',
                    reviewedUserId: otherUser?.id ?? '',
                    reviewedUserName: otherUser?.full_name ?? 'Usuario',
                    reviewedUserAvatar: otherUser?.avatar_url ?? '',
                  },
                })
              }
            />
          )}
        </View>
      )}

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={groupedMessages}
        keyExtractor={(item) => item.date}
        renderItem={({ item: group }) => (
          <View>
            {/* Separador de fecha */}
            <View style={styles.dateSeparator}>
              <View style={[styles.dateLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dateLabel, { color: theme.textTertiary }]}>{group.date}</Text>
              <View style={[styles.dateLine, { backgroundColor: theme.border }]} />
            </View>
            {group.messages.map((msg: Message) => (
              <View key={msg.id}>{renderMessage({ item: msg })}</View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          { backgroundColor: theme.surface, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <TouchableOpacity onPress={handleImagePick} style={styles.inputAction}>
          <ImageIcon size={22} color={theme.textSecondary} strokeWidth={1.75} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCamera} style={styles.inputAction}>
          <Camera size={22} color={theme.textSecondary} strokeWidth={1.75} />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: isDark ? '#252523' : '#F0F2F5', color: theme.text },
          ]}
          placeholder="Mensaje..."
          placeholderTextColor={theme.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || isSending}
          style={[
            styles.sendBtn,
            { backgroundColor: text.trim() ? COLORS.primary : theme.border },
          ]}
        >
          <Send size={18} color="#fff" strokeWidth={1.75} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerName: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  onlineStatus: { fontSize: TYPOGRAPHY.size.xs },
  messagesList: { padding: SPACING.base, gap: SPACING.sm },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dateLine: { flex: 1, height: 1 },
  dateLabel: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.medium },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, marginBottom: SPACING.xs },
  messageRowMe: { flexDirection: 'row-reverse' },
  messageSelected: { opacity: 0.7 },
  bubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: 4,
  },
  bubbleMe: { borderBottomRightRadius: RADIUS.xs },
  bubbleThem: { borderBottomLeftRadius: RADIUS.xs },
  bubbleText: { fontSize: TYPOGRAPHY.size.base, lineHeight: 22 },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  timeText: { fontSize: 10 },
  messageImage: { width: 200, height: 200, borderRadius: RADIUS.md },
  systemMessage: { alignItems: 'center', marginVertical: SPACING.sm },
  systemMessageText: { fontSize: TYPOGRAPHY.size.xs, fontStyle: 'italic' },
  tradeProposal: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  tradeProposalTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  tradeProposalText: { fontSize: TYPOGRAPHY.size.sm },
  tradeProposalActions: { flexDirection: 'row', gap: SPACING.sm },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inputAction: { padding: SPACING.xs, paddingBottom: 10 },
  textInput: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.size.base,
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  confirmBanner: {
    margin: SPACING.base,
    marginBottom: 0,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  confirmBannerTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  confirmBannerSub: { fontSize: TYPOGRAPHY.size.sm },
  confirmStatus: { flexDirection: 'row', gap: SPACING.base },
  confirmStatusItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  confirmStatusLabel: { fontSize: TYPOGRAPHY.size.xs, flex: 1 },
  reviewBanner: {
    margin: SPACING.base,
    marginBottom: 0,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.base,
    gap: SPACING.sm,
  },
  reviewBannerTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  reviewBannerSub: { fontSize: TYPOGRAPHY.size.sm },
});
