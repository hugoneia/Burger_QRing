import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

const FRAME_SIZE = 260;
const CORNER = 34;

/**
 * Viewfinder overlay for the camera scanner screen: four corner brackets
 * plus an animated scan line that sweeps top-to-bottom.
 */
export function ScannerFrame({ active }: { active: boolean }) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = 0;
      progress.value = withRepeat(
        withTiming(1, { duration: 1800, easing: Easing.linear }),
        -1,
        true,
      );
    } else {
      cancelAnimation(progress);
    }
    return () => cancelAnimation(progress);
  }, [active, progress]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * (FRAME_SIZE - 4) }],
    opacity: active ? 1 : 0,
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.frame}>
        <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
        <Animated.View
          /* style={[styles.scanLine, { backgroundColor: colors.primary, shadowColor: colors.primary }, lineStyle]} */
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 0,
    height: 3,
    borderRadius: 2,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});
