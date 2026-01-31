import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";
import "react-native-get-random-values";

export default function StatisticsScreen() {
  return (
    <ParallaxScrollView title="Statistics">
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Statistics</ThemedText>
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
