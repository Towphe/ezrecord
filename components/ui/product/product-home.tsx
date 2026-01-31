import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useProducts } from "@/hooks/use-products";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "../icon-symbol";
import { ProductCard } from "./product-card";
import { SearchProduct } from "./search-product";

function CreateButton({
  handleCreatePress,
}: {
  handleCreatePress: () => void;
}) {
  return (
    <Pressable style={{ marginTop: 36 }} onPress={handleCreatePress}>
      <IconSymbol name="plus" size={24} color="#F2F2F2" />
    </Pressable>
  );
}

export function ProductsHome() {
  const navigation = useNavigation();
  const { products, loading: productLoading, refetch } = useProducts();

  const handleCreatePress = () => {
    navigation.navigate({ name: "CreateProduct" } as never);
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (productLoading) {
    return (
      <ParallaxScrollView title="Products">
        <ThemedText>Loading...</ThemedText>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      title="Products"
      rightSibling={<CreateButton handleCreatePress={handleCreatePress} />}
    >
      <ThemedView style={styles.page}>
        <ThemedView style={styles.productsContainer}>
          {products.length === 0 && (
            <ThemedText style={{ textAlign: "center" }}>
              No products found.
            </ThemedText>
          )}
          {products.map((product) => (
            <ProductCard key={product.productId} {...product} />
          ))}
        </ThemedView>
        <SearchProduct onSearch={refetch} />
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
});
