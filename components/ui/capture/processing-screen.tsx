import { ThemedText } from "@/components/themed-text";
import { Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ProcessingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { marginBottom: -insets.bottom }]}>
      <Image source={require("@/assets/images/processing.png")} />
      <ThemedText style={styles.text}>Processing Payment</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 28,
  },
  text: {
    fontSize: 28,
  },
});
