import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useProducts } from "@/hooks/use-products";
import { useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { IconSymbol } from "../icon-symbol";
import { ProductFilterModal } from "./filter-modal";
import { ProductCard } from "./product-card";
import { SearchProduct } from "./search-product";

type ProductFilters = {
  sortBy: "name" | "dateAdded";
  sortOrder: "asc" | "desc";
  hasStock: "instock" | "outofstock" | "all";
};

function FilterButton({ toggleFilter }: { toggleFilter: () => void }) {
  return (
    <Pressable style={{ marginTop: 36 }} onPress={toggleFilter}>
      <IconSymbol name="fuel.filter.water" size={24} color="#F2F2F2" />
    </Pressable>
  );
}

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
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: "name",
    sortOrder: "asc",
    hasStock: "all",
  });

  const handleCreatePress = () => {
    navigation.navigate({ name: "CreateProduct" } as never);
  };

  const handleSearch = (name: string) => {
    setName(name);
    refetch({ name });
  };

  useFocusEffect(
    useCallback(() => {
      refetch({ name, ...filters });
    }, [name, filters, refetch]),
  );

  if (productLoading) {
    return (
      <ParallaxScrollView title="Products">
        <ThemedText>Loading...</ThemedText>
      </ParallaxScrollView>
    );
  }

  if (!productLoading && products.length === 0) {
    return (
      <ParallaxScrollView
        leftSibling={
          <FilterButton
            toggleFilter={() => setIsFilterVisible(!isFilterVisible)}
          />
        }
        title="Products"
        rightSibling={<CreateButton handleCreatePress={handleCreatePress} />}
      >
        <ThemedView style={styles.page}>
          <ThemedText style={{ marginTop: 32 }}>No products found.</ThemedText>
          <SearchProduct onSearch={handleSearch} />
          <ProductFilterModal
            modalOpen={isFilterVisible}
            setModalOpen={setIsFilterVisible}
            setFilters={setFilters}
          />
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      leftSibling={
        <FilterButton
          toggleFilter={() => setIsFilterVisible(!isFilterVisible)}
        />
      }
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

            if (!lastProduct) return;

            // Only perform cursor-based pagination when sorting by dateAdded.
            // When sorting by name we don't currently support cursor pagination,
            // so avoid re-fetching the same items repeatedly.
            if (filters.sortBy === "dateAdded") {
              refetch({
                name,
                limit: 10,
                after: lastProduct.createdAt,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                hasStock: filters.hasStock,
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
      <ProductFilterModal
        modalOpen={isFilterVisible}
        setModalOpen={setIsFilterVisible}
        setFilters={setFilters}
      />
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
