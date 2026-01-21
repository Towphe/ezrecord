import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { ThemedText } from "./themed-text";

const HEADER_HEIGHT = 100;
const HEADER_BACKGROUND_COLOR = "#1D9BB2";

type Props = PropsWithChildren<{
  title: string;
}>;

export default function ParallaxScrollView({ children, title }: Props) {
  const backgroundColor = useThemeColor({}, "background");
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}
    >
      <Animated.View
        style={[styles.header, { backgroundColor: HEADER_BACKGROUND_COLOR }]}
      >
        <ThemedText style={[styles.title]}>{title}</ThemedText>
      </Animated.View>

      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 40,
    color: "white",
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
});
