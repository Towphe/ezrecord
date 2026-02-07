import { CaptureStackParamList } from "@/app/(tabs)/capture";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useProducts } from "@/hooks/use-products";
import { SelectedProduct } from "@/types/product-selection";
import { Product } from "@/types/products";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { ProductCard } from "../capture/product-card";
import { IconSymbol } from "../icon-symbol";
import { SearchProduct } from "../product/search-product";

type CheckoutButtonProps = {
  selectedProducts: SelectedProduct[];
  onCheckoutPress: () => void;
};

function CheckoutButton({
  selectedProducts,
  onCheckoutPress,
}: CheckoutButtonProps) {
  return (
    <Pressable style={{ marginTop: 36 }} onPress={onCheckoutPress}>
      <IconSymbol name="doc.plaintext" size={24} color="#F2F2F2" />
    </Pressable>
  );
}

export default function CaptureHome({
  route,
}: {
  route: RouteProp<CaptureStackParamList, "CaptureHome">;
}) {
  const navigation = useNavigation();
  const { products, loading: productLoading, refetch } = useProducts();
  const [name, setName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    route?.params?.selectedProducts ?? [],
  );

  const addProduct = (product: Product) => {
    setSelectedProducts((previousProducts) => {
      const prevProduct = previousProducts.find(
        (p) => p.productId === product.productId,
      );

      if (prevProduct) {
        return previousProducts.map((p) =>
          p.productId === product.productId
            ? { ...p, quantity: p.quantity + 1 }
            : p,
        );
      }

      return [
        ...previousProducts,
        {
          productId: product.productId,
          quantity: 1,
          unitPrice: product.price,
          name: product.name,
        },
      ];
    });
  };

  const subtractProduct = (product: Product) => {
    setSelectedProducts((previousProducts) => {
      const prevProduct = previousProducts.find(
        (p) => p.productId === product.productId,
      );

      if (prevProduct) {
        if (prevProduct.quantity === 1) {
          return previousProducts.filter(
            (p) => p.productId !== product.productId,
          );
        }

        return previousProducts.map((p) =>
          p.productId === product.productId
            ? { ...p, quantity: p.quantity - 1 }
            : p,
        );
      }

      return previousProducts;
    });
  };

  const handleCheckout = () => {
    navigation.navigate({
      name: "ReviewOrder",
      params: { selectedProducts: selectedProducts },
    } as never);
  };

  const handleSearch = (name: string) => {
    setName(name);
    refetch({ name, limit: 10 });
  };

  if (productLoading) {
    // TODO: Replace with proper loading indicator
    return (
      <ParallaxScrollView title="Products">
        <ThemedText>Loading...</ThemedText>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      title="Capture"
      rightSibling={
        <CheckoutButton
          selectedProducts={selectedProducts}
          onCheckoutPress={handleCheckout}
        />
      }
    >
      <ThemedView style={styles.page}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onAdd={addProduct}
              onSubtract={subtractProduct}
            />
          )}
          onEndReached={() => {
            const lastProduct = products[products.length - 1];

            if (lastProduct) {
              refetch({
                name,
                limit: 10,
                after: lastProduct.createdAt,
              });
            }
          }}
          style={styles.productsContainer}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() =>
            productLoading ? <ActivityIndicator size="small" /> : null
          }
        />
        <SearchProduct onSearch={handleSearch} />
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
