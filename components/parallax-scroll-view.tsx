import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

const HEADER_HEIGHT = 100;
const HEADER_BACKGROUND_COLOR = "#1D9BB2";

type Props = PropsWithChildren<{
  title: string;
  leftSibling?: React.ReactElement;
  rightSibling?: React.ReactElement;
}>;

export default function ParallaxScrollView({
  children,
  title,
  leftSibling,
  rightSibling,
}: Props) {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <View
      style={{
        backgroundColor,
        height: "100%",
      }}
    >
      <View
        style={[styles.header, { backgroundColor: HEADER_BACKGROUND_COLOR }]}
      >
        {leftSibling ? leftSibling : <ThemedView style={{ width: 10 }} />}
        <ThemedText style={[styles.title]}>{title}</ThemedText>
        {rightSibling ? rightSibling : <ThemedView style={{ width: 10 }} />}
      </View>

      <ThemedView style={styles.content}>{children}</ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 40,
    color: "white",
    fontSize: 18,
  },
  content: {
    height: "85%",
  },
});
