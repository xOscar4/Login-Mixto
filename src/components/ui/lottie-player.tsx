import Constants from 'expo-constants';
import { Component, useEffect, useState, type ReactNode } from 'react';
import { Animated, View, type StyleProp, type ViewStyle } from 'react-native';

import { cn } from '@/lib/cn';

const IS_EXPO_GO = Constants.executionEnvironment === 'storeClient';

export type LottieFallbackType = 'equalizer' | 'vinyl' | 'loading' | 'success';

export type LottiePlayerSize = 'sm' | 'md' | 'lg' | number;

export type LottiePlayerProps = {
  // Metro resuelve el JSON local o remoto; la forma exacta la define lottie-react-native.
  source: unknown;
  fallback?: LottieFallbackType;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
  size?: LottiePlayerSize;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const BAR_COLORS = [
  'bg-primary',
  'bg-accent',
  'bg-secondary',
  'bg-primary',
  'bg-accent',
] as const;

const BAR_BASE_HEIGHT_FACTORS = [0.55, 0.85, 1.0, 0.7, 0.5];

const BAR_DURATIONS = [420, 520, 360, 470, 540];

const EQUALIZER_SIZES = {
  sm: { bar: 'w-0.5 rounded-full', gap: 'gap-0.5' },
  md: { bar: 'w-2 rounded-full', gap: 'gap-1.5' },
  lg: { bar: 'w-3.5 rounded-full', gap: 'gap-2.5' },
} as const;

function resolveEqualizerSize(size?: LottiePlayerSize): 'sm' | 'md' | 'lg' {
  if (typeof size === 'number') {
    if (size <= 24) return 'sm';
    if (size <= 60) return 'md';
    return 'lg';
  }
  if (size === 'sm' || size === 'md' || size === 'lg') {
    return size;
  }
  return 'lg';
}

function EqualizerFallback({ size }: { size?: LottiePlayerSize }) {
  const resolved = resolveEqualizerSize(size);
  const config = EQUALIZER_SIZES[resolved];
  const [values] = useState(() => BAR_DURATIONS.map(() => new Animated.Value(0.35)));

  useEffect(() => {
    const loops = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: BAR_DURATIONS[index],
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: BAR_DURATIONS[index] + 120,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());

    return () => loops.forEach((loop) => loop.stop());
  }, [values]);

  return (
    <View className={cn('h-full w-full flex-row items-center justify-center overflow-hidden', config.gap)}>
      {values.map((value, index) => (
        <Animated.View
          key={index}
          style={{
            height: `${Math.round(BAR_BASE_HEIGHT_FACTORS[index] * 100)}%`,
            transform: [{ scaleY: value }],
          }}
          className={cn(config.bar, BAR_COLORS[index])}
        />
      ))}
    </View>
  );
}

function VinylFallback() {
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      }),
    );

    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View className="h-full w-full items-center justify-center">
      <View className="absolute h-full w-full rounded-full border border-primary/25" />
      <View className="absolute h-4/5 w-4/5 rounded-full border border-secondary/30" />
      <Animated.View
        style={{ transform: [{ rotate: rotation }], width: '62%', height: '62%' }}
        className="items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-surface-elevated via-card to-background"
      >
        <View className="h-1/3 w-1/3 rounded-full bg-gradient-to-br from-primary to-secondary" />
      </Animated.View>
    </View>
  );
}

function LoadingFallback() {
  const [spin] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0.85));

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 550, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.85, duration: 550, useNativeDriver: true }),
      ]),
    );

    spinLoop.start();
    pulseLoop.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [pulse, spin]);

  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View className="h-full w-full items-center justify-center">
      <Animated.View
        style={{ transform: [{ rotate: rotation }, { scale: pulse }], width: '70%', height: '70%' }}
        className="rounded-full border-2 border-primary/20 border-t-primary border-r-accent"
      />
      <View className="absolute h-2 w-2 rounded-full bg-accent" />
    </View>
  );
}

function SuccessFallback() {
  const [scale] = useState(() => new Animated.Value(0.2));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View
      style={{ transform: [{ scale }], opacity, width: '75%', height: '75%' }}
      className="items-center justify-center rounded-full border-2 border-success/40 bg-success/15"
    >
      {/*
        Checkmark ✓ clásico de React Native:
        Un View con borderRightWidth + borderBottomWidth forma una L.
        Rotado 45 ° se convierte en un visto (✓).
        marginTop negativo desplaza el visto hacia arriba para centrarlo visualmente.
      */}
      <View
        style={{
          width: 14,
          height: 26,
          borderRightWidth: 3,
          borderBottomWidth: 3,
          borderColor: '#34d399',
          borderRadius: 2,
          transform: [{ rotate: '45deg' }],
          marginTop: -8,
        }}
      />
    </Animated.View>
  );
}

function RenderFallback({ fallback, size }: { fallback: LottieFallbackType; size?: LottiePlayerSize }) {
  switch (fallback) {
    case 'vinyl':
      return <VinylFallback />;
    case 'loading':
      return <LoadingFallback />;
    case 'success':
      return <SuccessFallback />;
    case 'equalizer':
    default:
      return <EqualizerFallback size={size} />;
  }
}

type ErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class LottieErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Si la inicialización nativa de Lottie falla, el límite de error activa el fallback visual.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function NativeLottieView({
  source,
  loop,
  autoPlay,
  speed,
  onFailure,
}: LottiePlayerProps & { onFailure: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const LottieView = require('lottie-react-native').default;

  return (
    <LottieView
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      onAnimationFailure={onFailure}
      resizeMode="contain"
      style={{ position: 'absolute', width: '100%', height: '100%' }}
    />
  );
}

/**
 * Lottie requiere un development build o entorno con binarios nativos (no está incluido en Expo Go).
 * En Expo Go mostramos una animación equivalente y fluida con Animated de React Native.
 */
function NativeLottie(props: LottiePlayerProps & { fallback: LottieFallbackType }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <RenderFallback fallback={props.fallback} size={props.size} />;
  }

  return (
    <LottieErrorBoundary fallback={<RenderFallback fallback={props.fallback} size={props.size} />}>
      <NativeLottieView {...props} onFailure={() => setFailed(true)} />
    </LottieErrorBoundary>
  );
}

export function LottiePlayer({
  source,
  fallback = 'equalizer',
  loop = true,
  autoPlay = true,
  speed = 1,
  size,
  className,
  style,
}: LottiePlayerProps) {
  const numericSize = typeof size === 'number' ? size : undefined;
  const sizeStyle: ViewStyle | undefined = numericSize ? { width: numericSize, height: numericSize } : undefined;

  return (
    <View
      style={[sizeStyle, style]}
      className={cn('items-center justify-center overflow-hidden', className)}
      accessibilityRole="image"
      accessible={false}
    >
      {IS_EXPO_GO ? (
        <RenderFallback fallback={fallback} size={size} />
      ) : (
        <NativeLottie
          source={source}
          loop={loop}
          autoPlay={autoPlay}
          speed={speed}
          size={size}
          fallback={fallback}
        />
      )}
    </View>
  );
}
