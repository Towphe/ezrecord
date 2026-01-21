import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function CaptureScreen() {
  return (
    <ParallaxScrollView title="Capture">
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Capture</ThemedText>
      </ThemedView>
      {/* <ThemedView style={styles.stepContainer}></ThemedView> */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
