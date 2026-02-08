import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTransactions } from "@/hooks/use-transactions";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { IconSymbol } from "../icon-symbol";
import { ExportModal } from "./export-modal";
import { TransactionFilterModal } from "./filter-modal";
import { SearchTransaction } from "./search-transaction";
import { TransactionCard } from "./transaction-card";

function FilterButton({ toggleFilter }: { toggleFilter: () => void }) {
  return (
    <Pressable style={{ marginTop: 36 }} onPress={toggleFilter}>
      <IconSymbol name="fuel.filter.water" size={24} color="#F2F2F2" />
    </Pressable>
  );
}

function DownloadButton({ onDownloadPress }: { onDownloadPress: () => void }) {
  return (
    <Pressable style={{ marginTop: 36 }} onPress={onDownloadPress}>
      <IconSymbol name="square.and.arrow.down" size={24} color="#F2F2F2" />
    </Pressable>
  );
}

type TransactionFilters = {
  sortOrder: "asc" | "desc";
  paymentMethod: "cash" | "gcash" | "maya" | "bpi" | "all";
};

export default function TransactionsHome() {
  const [transactionId, setTransactionId] = useState("");
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    sortOrder: "asc",
    paymentMethod: "all",
  });

  const {
    transactions,
    loading: transactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions();

  const handleSearch = (transactionId: string) => {
    setTransactionId(transactionId);
    refetchTransactions({ transactionId, ...filters });
  };

  // Refetch when the screen comes into focus so newly created transactions appear
  useFocusEffect(
    useCallback(() => {
      refetchTransactions({ transactionId, ...filters });
    }, [refetchTransactions, transactionId, filters]),
  );

  if (transactionsLoading) {
    return (
      <ParallaxScrollView title="Transactions">
        <ThemedText>Loading...</ThemedText>
      </ParallaxScrollView>
    );
  }

  if (!transactionsLoading && transactions.length === 0) {
    return (
      <ParallaxScrollView
        leftSibling={
          <FilterButton toggleFilter={() => setIsFilterVisible(true)} />
        }
        title="Transactions"
        rightSibling={
          <DownloadButton onDownloadPress={() => setDownloadModalOpen(true)} />
        }
      >
        <ThemedView style={styles.page}>
          <ThemedText style={{ marginTop: 32 }}>
            No transactions found.
          </ThemedText>
          <SearchTransaction onSearch={handleSearch} />
          <TransactionFilterModal
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
        <FilterButton toggleFilter={() => setIsFilterVisible(true)} />
      }
      title="Transactions"
      rightSibling={
        <DownloadButton onDownloadPress={() => setDownloadModalOpen(true)} />
      }
    >
      <ThemedView style={styles.page}>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.transactionId}
          renderItem={({ item }) => <TransactionCard {...item} />}
          onEndReached={() => {
            const lastTransaction = transactions[transactions.length - 1];

            if (lastTransaction) {
              refetchTransactions({
                transactionId,
                after: lastTransaction.createdAt,
              });
            }
          }}
          style={styles.transactionsContainer}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() =>
            transactionsLoading ? <ActivityIndicator size="small" /> : null
          }
        />
        <SearchTransaction onSearch={handleSearch} />
        <TransactionFilterModal
          modalOpen={isFilterVisible}
          setModalOpen={setIsFilterVisible}
          setFilters={setFilters}
        />
      </ThemedView>
      <ExportModal
        setDownloadModalOpen={setDownloadModalOpen}
        downloadModalOpen={downloadModalOpen}
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
  transactionsContainer: {
    height: "auto",
    width: "100%",
    flexDirection: "column",
    marginTop: 16,
    marginBottom: 16,
  },
});
