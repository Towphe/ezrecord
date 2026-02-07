import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useProducts } from "@/hooks/use-products";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { IconSymbol } from "../icon-symbol";
import { ProductCard } from "./product-card";
import { SearchProduct } from "./search-product";

type CreateButtonProps = {
  handleCreatePress: () => void;
};

function CreateButton({ handleCreatePress }: CreateButtonProps) {
  return (
    <Pressable style={{ marginTop: 36 }} onPress={handleCreatePress}>
      <IconSymbol name="plus.circle" size={24} color="#F2F2F2" />
    </Pressable>
  );
}

export function ProductsHome() {
  const navigation = useNavigation();
  const { products, loading: productLoading, refetch } = useProducts();
  const [name, setName] = useState("");

  const handleCreatePress = () => {
    navigation.navigate({ name: "CreateProduct" } as never);
  };

  const handleSearch = (name: string) => {
    setName(name);
    refetch({ name, limit: 10 });
  };

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
        <FlatList
          data={products}
          keyExtractor={(item) => item.productId}
          renderItem={({ item }) => <ProductCard {...item} />}
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
    width: "100%",
    marginTop: 16,
    marginBottom: 16,
  },
});
