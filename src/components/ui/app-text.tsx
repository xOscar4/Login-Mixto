import { Text, type TextProps } from 'react-native';

export type AppTextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'overline';

export type AppTextTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'danger'
  | 'success'
  | 'inverse';

const VARIANT_CLASSES: Record<AppTextVariant, string> = {
  display: 'font-display text-4xl',
  title: 'font-display-semibold text-3xl',
  heading: 'font-display-semibold text-xl',
  subheading: 'font-display-medium text-lg',
  body: 'font-sans text-base',
  bodyStrong: 'font-sans-semibold text-base',
  label: 'font-sans-semibold text-sm',
  caption: 'font-sans text-sm',
  overline: 'font-sans-semibold text-xs uppercase tracking-widest',
};

const TONE_CLASSES: Record<AppTextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted',
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  danger: 'text-danger',
  success: 'text-success',
  inverse: 'text-white',
};

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
};

export function AppText({
  variant = 'body',
  tone = 'default',
  className = '',
  ...rest
}: AppTextProps) {
  return (
    <Text className={`${VARIANT_CLASSES[variant]} ${TONE_CLASSES[tone]} ${className}`} {...rest} />
  );
}
