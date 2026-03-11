import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isSelected = props.accessibilityState?.selected;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isSelected ? 1.15 : 1, { damping: 12 }) },
        { translateY: withSpring(isSelected ? -4 : 0, { damping: 12 }) }
      ],
    };
  });

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    >
      <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
        {props.children as React.ReactNode}
      </Animated.View>
    </PlatformPressable>
  );
}
