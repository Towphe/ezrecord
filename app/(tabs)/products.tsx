import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function ProductsScreen() {
  return (
    <ParallaxScrollView title="Products">
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Products</ThemedText>
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
