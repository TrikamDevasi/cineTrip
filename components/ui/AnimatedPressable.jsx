import React, { useRef } from 'react';
import { Pressable, Animated, Platform, StyleSheet } from 'react-native';

/**
 * Animated Pressable Component
 * Adds subtle, smooth spring-scale feedback on press without excessive bounce.
 */
export default function AnimatedPressable({
  children,
  onPress,
  style,
  scaleValue = 0.97,
  disabled = false,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
  ...props
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      {...props}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
