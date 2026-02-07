import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Product } from "@/types/products";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "../icon-symbol";

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
  onSubtract: (product: Product) => void;
};

export function ProductCard({ product, onAdd, onSubtract }: Props) {
  const {
    productId,
    name,
    description,
    quantity,
    price,
    isDeleted,
    createdAt,
    updatedAt,
  }: Product = product;
  const [selected, setSelected] = useState<number>(0);

  const increment = () => {
    setSelected((prev) => prev + 1);
    onAdd(product);
  };
  const decrement = () => {
    setSelected((prev) => (prev > 0 ? prev - 1 : prev));
    onSubtract(product);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.productName}>{name}</ThemedText>
        <ThemedView style={styles.actionButtonGroup}>
          <Pressable onPress={decrement}>
            <IconSymbol name="minus.circle" size={26} color="#333" />
          </Pressable>
          <ThemedText style={styles.price}>{selected}</ThemedText>
          <Pressable onPress={increment}>
            <IconSymbol name="plus.circle" size={26} color="#333" />
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ThemedView>
        <ThemedText style={styles.quantity}>Quantity: {quantity}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: "#33333330",
    borderBottomWidth: 0.5,
  },
  header: {
    // flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 20,
    width: "100%",
  },
  productName: {
    fontSize: 20,
    paddingBottom: 4,
    fontWeight: "400",
  },
  price: {
    fontSize: 20,
  },
  actionButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  quantity: {
    opacity: 0.5,
  },
  actionsModal: {
    flexDirection: "column",
    justifyContent: "flex-end",
    position: "absolute",
    backgroundColor: "#33333331",
    bottom: 0,
    paddingBottom: 80,
    height: "100%",
    width: "100%",
    alignItems: "center",
    gap: 6,
  },
  actionButton: {
    width: "95%",
    backgroundColor: "#F2F2F2",
    marginHorizontal: "auto",
    padding: 8,
    textAlign: "center",
    fontSize: 18,
    // color: "red",
    borderRadius: 6,
    borderColor: "#898989ff",
    borderWidth: 0.5,
  },
});
