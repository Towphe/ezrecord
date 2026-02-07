import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SelectedProduct } from "@/types/product-selection";
import { StyleSheet } from "react-native";

export function ProductItem({ name, quantity, unitPrice }: SelectedProduct) {
  return (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.row}>
        <ThemedText style={styles.header}>{name}</ThemedText>
        <ThemedText style={styles.header}>
          ₱ {(quantity * unitPrice).toFixed(2)}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.row}>
        <ThemedText style={styles.subHeader}>Quantity: {quantity}</ThemedText>
        <ThemedText style={styles.subHeader}>
          ₱ {unitPrice.toFixed(2)} / pc
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 16,
    flexDirection: "column",
    gap: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 20,
    fontWeight: "400",
  },
  subHeader: {
    // fontSize: 16,
    opacity: 0.6,
  },
});
