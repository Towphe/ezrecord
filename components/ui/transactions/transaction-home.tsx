import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTransactions } from "@/hooks/use-transactions";
import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";
import { SearchTransaction } from "./search-transaction";
import { TransactionCard } from "./transaction-card";

export default function TransactionsHome() {
  const [transactionId, setTransactionId] = useState("");

  const {
    transactions,
    loading: transactionsLoading,
    refetch: refetchTransactions,
  } = useTransactions();

  const handleSearch = (transactionId: string) => {
    setTransactionId(transactionId);
    refetchTransactions({ transactionId });
  };

  if (transactionsLoading) {
    return (
      <ParallaxScrollView title="Transactions">
        <ThemedText>Loading...</ThemedText>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView title="Transactions">
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
  transactionsContainer: {
    height: "auto",
    width: "100%",
    flexDirection: "column",
    marginTop: 16,
    marginBottom: 16,
  },
});
