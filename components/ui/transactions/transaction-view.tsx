import { TransactionsStackParamList } from "@/app/(tabs)/transactions";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTransaction } from "@/hooks/use-transaction";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { ProductItem } from "../capture/item-card";

function TransactionType({ type }: { type?: string }) {
  switch (type) {
    case "epayment":
      return (
        <ThemedView>
          <ThemedText style={{ ...styles.mediumFont, opacity: 0.6 }}>
            E-Payment
          </ThemedText>
        </ThemedView>
      );
    default:
      return (
        <ThemedView>
          <ThemedText style={{ ...styles.mediumFont, opacity: 0.6 }}>
            Cash
          </ThemedText>
        </ThemedView>
      );
  }
}

export default function TransactionView({
  route,
}: {
  route: RouteProp<TransactionsStackParamList, "TransactionView">;
}) {
  const navigation = useNavigation();
  const { transactionId } = route.params;
  const {
    transaction,
    products,
    loading: transactionLoading,
  } = useTransaction(transactionId);

  useEffect(() => {
    if (!transaction && !transactionLoading) {
      navigation.goBack();
    }
  }, [transaction, transactionLoading, navigation]);

  if (transactionLoading) {
    return (
      <ParallaxScrollView title="Transactions">
        <ThemedText>Loading...</ThemedText>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView title="Transactions">
      <ThemedView style={styles.page}>
        <ThemedView style={styles.productsContainer}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title}>
              Transaction ID #{transactionId.substring(0, 8)}
            </ThemedText>
            <ThemedText style={styles.date}>
              {transaction?.createdAt.toLocaleDateString()}
            </ThemedText>
          </ThemedView>
          <ScrollView style={styles.products}>
            {products.map((product, idx) => (
              <ProductItem key={idx} {...product} />
            ))}
          </ScrollView>
        </ThemedView>
        <ThemedView style={styles.paymentDetails}>
          <ThemedView style={styles.paymentDetailsRow}>
            <ThemedText style={styles.mediumFont}>Total:</ThemedText>
            <ThemedText style={styles.mediumFont}>
              ₱ {transaction?.totalAmount.toFixed(2)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.paymentDetailsRow}>
            <ThemedText style={{ ...styles.mediumFont, opacity: 0.6 }}>
              Payment Method:
            </ThemedText>
            <TransactionType type={transaction?.paymentMethod} />
          </ThemedView>
          <ThemedView style={styles.paymentDetailsRow}>
            <ThemedText style={{ ...styles.mediumFont, opacity: 0.6 }}>
              Ref. No.:
            </ThemedText>
            <ThemedText style={{ ...styles.mediumFont, opacity: 0.6 }}>
              {transaction?.referenceNumber || "N/A"}
            </ThemedText>
          </ThemedView>
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
  },
  largeFont: {
    fontSize: 24,
  },
  mediumFont: {
    fontSize: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: "auto",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomColor: "#33333330",
    borderBottomWidth: 1.5,
  },
  title: {
    fontSize: 18,
  },
  date: {
    fontSize: 16,
    color: "gray",
  },
  productsContainer: {
    width: "100%",
  },
  products: {
    width: "100%",
    paddingVertical: 4,
  },
  paymentDetails: {
    width: "100%",
    gap: 2,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopColor: "#33333330",
    borderTopWidth: 1,
  },
  paymentDetailsRow: {
    width: "95%",
    marginHorizontal: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
