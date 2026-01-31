import { CaptureStackParamList } from "@/app/(tabs)/capture";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { RouteProp } from "@react-navigation/native";
import { Button, StyleSheet } from "react-native";
import { ProductItem } from "./item-card";

export default function ReviewOrder({
  route,
}: {
  route: RouteProp<CaptureStackParamList, "ReviewOrder">;
}) {
  const { selectedProducts } = route.params;
  const total = selectedProducts.reduce(
    (sum, product) => sum + product.quantity * product.unitPrice,
    0,
  );

  return (
    <ParallaxScrollView title="Capture">
      <ThemedView style={styles.page}>
        <ThemedView style={styles.productsContainer}>
          {selectedProducts.map((product) => (
            <ProductItem key={product.productId} {...product} />
          ))}
        </ThemedView>
        <ThemedView style={styles.actionContainer}>
          <ThemedText style={styles.total}>
            Total: P {total.toFixed(2)}
          </ThemedText>
          <Button title="E-Payment" color="teal" onPress={() => {}} />
          <Button title="Cash" color="green" onPress={() => {}} />
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginHorizontal: "auto",
    height: "50%",
  },
  productsContainer: {
    overflowY: "scroll",
    width: "100%",
    flexDirection: "column",
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  total: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  actionContainer: {
    width: "95%",
    marginHorizontal: "auto",
    gap: 8,
  },
});
