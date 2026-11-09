import { Modal, Pressable, View } from 'react-native';

import { AppText } from './app-text';
import { Button } from './button';
import { Icon } from './icon';
import { LottiePlayer } from './lottie-player';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center bg-background/80 px-6">
        <Pressable
          accessibilityLabel="Cerrar"
          onPress={onCancel}
          className="absolute inset-0"
        />

        <View className="w-full max-w-sm gap-5 rounded-3xl border border-border bg-card p-6 card-shadow">
          <View
            className={
              tone === 'danger'
                ? 'h-16 w-16 items-center justify-center rounded-2xl border border-danger/30 bg-danger/15'
                : 'h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15'
            }
          >
            {tone === 'danger' ? (
              <LottiePlayer
                source={require('@/assets/animations/delete-x.json')}
                fallback="vinyl"
                className="h-12 w-12"
              />
            ) : (
              <Icon name="info" size={24} tone={tone} />
            )}
          </View>

          <View className="gap-2">
            <AppText variant="heading">{title}</AppText>
            <AppText variant="caption" tone="muted">
              {message}
            </AppText>
          </View>

          <View className="flex-row gap-3">
            <Button
              label={cancelLabel}
              variant="secondary"
              onPress={onCancel}
              className="flex-1"
            />
            <Button
              label={confirmLabel}
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onPress={onConfirm}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
