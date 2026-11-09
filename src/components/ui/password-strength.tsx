import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { passwordChecks, passwordStrength } from '@/lib/validation';

import { AppText } from './app-text';
import { Icon } from './icon';

type PasswordStrengthProps = {
  value: string;
  className?: string;
};

const LABELS = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];
const BAR_COLORS = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-primary', 'bg-success'];
const TEXT_TONES = ['danger', 'danger', 'muted', 'primary', 'success'] as const;

const RULES = [
  { key: 'length', label: '8 caracteres o más' },
  { key: 'upper', label: 'Una mayúscula' },
  { key: 'lower', label: 'Una minúscula' },
  { key: 'number', label: 'Un número' },
  { key: 'symbol', label: 'Un símbolo' },
] as const;

export function PasswordStrength({ value, className }: PasswordStrengthProps) {
  const strength = passwordStrength(value);
  const checks = passwordChecks(value);
  const index = Math.max(0, strength - 1);

  return (
    <View className={cn('gap-3 rounded-2xl border border-border bg-surface/60 p-4', className)}>
      <View className="flex-row items-center justify-between">
        <AppText variant="caption" tone="muted">
          Seguridad de la contraseña
        </AppText>
        <AppText variant="caption" tone={value ? TEXT_TONES[index] : 'muted'}>
          {value ? LABELS[index] : 'Sin evaluar'}
        </AppText>
      </View>

      <View className="flex-row gap-1.5">
        {RULES.map((rule, ruleIndex) => (
          <View
            key={rule.key}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              value && ruleIndex < strength ? BAR_COLORS[index] : 'bg-border',
            )}
          />
        ))}
      </View>

      <View className="flex-row flex-wrap gap-x-4 gap-y-1.5">
        {RULES.map((rule) => {
          const passed = Boolean(checks[rule.key]);
          return (
            <View key={rule.key} className="flex-row items-center gap-1.5">
              <Icon name={passed ? 'check' : 'close'} size={12} tone={passed ? 'success' : 'muted'} />
              <AppText variant="caption" tone={passed ? 'success' : 'muted'}>
                {rule.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}
