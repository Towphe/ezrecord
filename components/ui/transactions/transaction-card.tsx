import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Transaction } from "@/types/transaction";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet } from "react-native";

export function TransactionCard({
  transactionId,
  totalAmount,
  createdAt,
}: Transaction) {
  const navigation = useNavigation();
  const truncatedTransactionId = transactionId.substring(0, 8);

  const handleViewPress = () =>
    navigation.navigate({
      name: "TransactionView",
      params: { transactionId },
    } as never);

  return (
    <Pressable style={styles.card} onPress={handleViewPress}>
      <ThemedView style={styles.cardRow}>
        <ThemedText style={styles.larger}>
          ID# {truncatedTransactionId}
        </ThemedText>
        <ThemedText style={styles.larger}>
          ₱ {totalAmount.toFixed(2)}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.cardRow}>
        <ThemedText>
          {createdAt.toDateString()},{" "}
          {createdAt.toLocaleTimeString().substring(0, 5)}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: "#33333330",
    borderBottomWidth: 0.5,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  larger: {
    fontSize: 22,
  },
});
