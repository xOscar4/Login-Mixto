import { type PropsWithChildren } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

type RevealProps = PropsWithChildren<{
  delay?: number;
  className?: string;
}>;

/** Entrada suave reutilizable para secciones y tarjetas. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(420).delay(delay).springify().damping(18)}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
