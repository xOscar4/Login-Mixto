import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { useCSSVariable } from 'uniwind';

export type IconName =
  | 'home'
  | 'collections'
  | 'settings'
  | 'plus'
  | 'back'
  | 'forward'
  | 'up'
  | 'down'
  | 'edit'
  | 'trash'
  | 'mail'
  | 'lock'
  | 'key'
  | 'eye'
  | 'eyeOff'
  | 'user'
  | 'logout'
  | 'music'
  | 'shield'
  | 'check'
  | 'alert'
  | 'info'
  | 'sparkle'
  | 'equalizer'
  | 'album'
  | 'play'
  | 'close'
  | 'more'
  | 'heart'
  | 'search';

type IconTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'danger'
  | 'success'
  | 'inverse';

const SYMBOLS: Record<IconName, { ios: SFSymbol; android: AndroidSymbol }> = {
  home: { ios: 'house.fill', android: 'home' },
  collections: { ios: 'square.stack.fill', android: 'library_music' },
  settings: { ios: 'gearshape.fill', android: 'settings' },
  plus: { ios: 'plus', android: 'add' },
  back: { ios: 'chevron.left', android: 'arrow_back' },
  forward: { ios: 'chevron.right', android: 'chevron_right' },
  up: { ios: 'arrow.up', android: 'arrow_upward' },
  down: { ios: 'chevron.down', android: 'expand_more' },
  edit: { ios: 'pencil', android: 'edit' },
  trash: { ios: 'trash.fill', android: 'delete' },
  mail: { ios: 'envelope.fill', android: 'mail' },
  lock: { ios: 'lock.fill', android: 'lock' },
  key: { ios: 'key.fill', android: 'password' },
  eye: { ios: 'eye.fill', android: 'visibility' },
  eyeOff: { ios: 'eye.slash.fill', android: 'visibility_off' },
  user: { ios: 'person.fill', android: 'person' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },
  music: { ios: 'music.note', android: 'music_note' },
  shield: { ios: 'checkmark.shield.fill', android: 'shield' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle' },
  alert: { ios: 'exclamationmark.circle.fill', android: 'error' },
  info: { ios: 'info.circle.fill', android: 'info' },
  sparkle: { ios: 'sparkles', android: 'auto_awesome' },
  equalizer: { ios: 'waveform', android: 'graphic_eq' },
  album: { ios: 'opticaldisc.fill', android: 'album' },
  play: { ios: 'play.fill', android: 'play_arrow' },
  close: { ios: 'xmark', android: 'close' },
  more: { ios: 'ellipsis', android: 'more_vert' },
  heart: { ios: 'heart.fill', android: 'favorite' },
  search: { ios: 'magnifyingglass', android: 'search' },
};

const TONE_VARIABLES: Record<IconTone, string> = {
  default: '--color-foreground',
  muted: '--color-muted',
  primary: '--color-primary',
  secondary: '--color-secondary',
  accent: '--color-accent',
  danger: '--color-danger',
  success: '--color-success',
  inverse: '--color-foreground',
};

const FALLBACK_COLORS: Record<IconTone, string> = {
  default: '#f5f7ff',
  muted: '#9aa3c7',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#22d3ee',
  danger: '#fb7185',
  success: '#34d399',
  inverse: '#ffffff',
};

type IconProps = {
  name: IconName;
  size?: number;
  tone?: IconTone;
};

export function Icon({ name, size = 22, tone = 'default' }: IconProps) {
  const value = useCSSVariable(TONE_VARIABLES[tone]);
  const tintColor = (value as string | undefined) ?? FALLBACK_COLORS[tone];

  return (
    <SymbolView name={SYMBOLS[name]} size={size} tintColor={tintColor} />
  );
}
