import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/cn';

import { AppText } from './app-text';
import type { IconName } from './icon';
import { Icon } from './icon';

type TextFieldProps = TextInputProps & {
  label: string;
  icon?: IconName;
  error?: string;
  hint?: string;
  secure?: boolean;
  className?: string;
  inputClassName?: string;
};

export function TextField({
  label,
  icon,
  error,
  hint,
  secure = false,
  className,
  inputClassName,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View className={cn('gap-2', className)}>
      <AppText variant="label" tone={focused ? 'primary' : 'default'}>
        {label}
      </AppText>

      <View
        className={cn(
          'flex-row items-center gap-3 rounded-2xl border bg-surface/80 px-4',
          focused && 'border-primary bg-surface',
          !focused && error && 'border-danger',
          !focused && !error && 'border-border',
        )}
      >
        {icon ? <Icon name={icon} size={18} tone={focused ? 'primary' : 'muted'} /> : null}

        <TextInput
          className={cn('min-h-14 flex-1 py-4 font-sans text-base text-foreground', inputClassName)}
          placeholderTextColorClassName="accent-slate-400"
          selectionColorClassName="accent-blue-500"
          cursorColorClassName="accent-blue-500"
          secureTextEntry={secure && !visible}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />

        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setVisible((current) => !current)}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-elevated"
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} size={19} tone="muted" />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View className="flex-row items-center gap-1.5">
          <Icon name="alert" size={14} tone="danger" />
          <AppText variant="caption" tone="danger" className="flex-1">
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" tone="muted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}
