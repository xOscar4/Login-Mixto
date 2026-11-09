import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import type { IconName } from '@/components/ui/icon';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';

type TabConfig = {
  name: string;
  label: string;
  icon: IconName;
};

// Fixed ordered list — always render all 3 regardless of state.routes ordering
const TABS: TabConfig[] = [
  { name: 'home', label: 'Inicio', icon: 'home' },
  { name: 'collections', label: 'Colecciones', icon: 'collections' },
  { name: 'settings', label: 'Ajustes', icon: 'settings' },
];

export function AppTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const activeName = state.routes[state.index]?.name;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.pill}>
        {TABS.map((tab) => {
          const isActive = tab.name === activeName;
          // Find the matching route from state (may not exist if tab not yet visited)
          const route = state.routes.find(
            (r) => r.name === tab.name || r.name.endsWith(`/${tab.name}`),
          );

          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              onPress={() => {
                if (!route) {
                  // Route not in state yet — navigate by name directly
                  navigation.navigate(tab.name);
                  return;
                }
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
              style={[
                styles.tabBase,
                isActive ? styles.tabActive : styles.tabInactive,
              ]}
            >
              <View style={styles.tabInner}>
                <Icon name={tab.icon} size={20} tone={isActive ? 'inverse' : 'muted'} />
                {isActive ? (
                  <AppText
                    variant="label"
                    tone="inverse"
                    numberOfLines={1}
                    className={cn('ml-1.5 text-[13px]')}
                  >
                    {tab.label}
                  </AppText>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15,20,40,0.97)',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBase: {
    borderRadius: 20,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabActive: {
    flex: 1.5,
    backgroundColor: '#6d28d9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    // Gradient fallback — a single violet/blue color; real gradient needs LinearGradient
  },
  tabInactive: {
    flex: 1,
    paddingVertical: 8,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
