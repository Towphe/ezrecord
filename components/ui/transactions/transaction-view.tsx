import { TransactionsStackParamList } from "@/app/(tabs)/transactions";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ReturnButton } from "@/components/return-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useDeleteTransaction } from "@/hooks/delete-transaction";
import { useTransaction } from "@/hooks/use-transaction";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import { ProductItem } from "../capture/item-card";
import { Button } from "../generic/button";
import { CancelModal } from "../generic/cancel-modal";
import { IconSymbol } from "../icon-symbol";

const transactionTypeMap: Record<string, string> = {
  cash: "Cash",
  gcash: "GCash",
  maya: "Maya",
  "bpi-vybe": "BPI Vybe",
};

function TransactionType({ type }: { type?: string }) {
  return (
    <ThemedView>
      <ThemedText style={{ ...styles.mediumFont, opacity: 0.6 }}>
        {type ? transactionTypeMap[type] || type : "N/A"}
      </ThemedText>
    </ThemedView>
  );
}

type ExitImageViewButtonProps = {
  setImageViewOpen: (open: boolean) => void;
};

function ExitImageViewButton({ setImageViewOpen }: ExitImageViewButtonProps) {
  return (
    <Pressable
      style={{
        position: "absolute",
        top: 60,
        right: 15,
        zIndex: 10,
      }}
      onPress={() => setImageViewOpen(false)}
    >
      <IconSymbol name="stop" size={36} color="#F2F2F2" />
    </Pressable>
  );
}

function MoreActionsButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={{ marginTop: 36 }} onPress={onPress}>
      <IconSymbol name="ellipsis" size={28} color="#F2F2F2" />
    </Pressable>
  );
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
  const { deleteTransaction } = useDeleteTransaction(transactionId);
  const [imageViewOpen, setImageViewOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

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

  const handleDeleteTransaction = () => {
    setDeleteConfirmationOpen(true);
  };

  const handleEditTransaction = () => {
    navigation.navigate({
      name: "EditTransaction",
      params: { transaction: transaction! },
    } as never);
  };

  const navigateHome = () => navigation.navigate("TransactionsHome" as never);

  const handleConfirmDeleteTransaction = async () => {
    await deleteTransaction();
    setDeleteConfirmationOpen(false);
    navigateHome();
  };

  return (
    <ParallaxScrollView
      leftSibling={<ReturnButton onPress={navigateHome} />}
      title="Transactions"
      rightSibling={
        <MoreActionsButton onPress={() => setMoreActionsOpen(true)} />
      }
    >
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
          <ThemedView
            style={{
              ...styles.paymentDetailsRow,
              display: transaction?.receiptImageUri ? "flex" : "none",
            }}
          >
            <ThemedText style={{ ...styles.mediumFont, opacity: 0.6 }}>
              Ref. No.:
            </ThemedText>
            <Pressable
              onPress={() => setImageViewOpen(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              disabled={!transaction?.receiptImageUri}
            >
              <ThemedText
                style={{
                  ...styles.mediumFont,
                  color: "#33333388",
                  fontStyle: "italic",
                }}
              >
                {transaction?.referenceNumber || "N/A"}
              </ThemedText>
              <IconSymbol
                name="eye"
                size={18}
                color="#33333388"
                style={{ marginLeft: 4 }}
              />
            </Pressable>

            <Modal
              animationType="none"
              transparent={true}
              visible={imageViewOpen}
              onRequestClose={() => setImageViewOpen(false)}
            >
              <ExitImageViewButton setImageViewOpen={setImageViewOpen} />
              <Image
                src={transaction?.receiptImageUri!}
                style={{
                  flex: 1,
                  width: "100%",
                }}
              />
            </Modal>
          </ThemedView>
        </ThemedView>
        <Modal
          animationType="none"
          transparent={true}
          visible={moreActionsOpen}
          onRequestClose={() => {
            setMoreActionsOpen(!moreActionsOpen);
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setMoreActionsOpen(false)}
          >
            <ThemedView style={styles.actionsModal}>
              <Button
                title="Edit Transaction"
                color="#333"
                backgroundColor="white"
                buttonStyles={styles.buttonStyle}
                onPress={handleEditTransaction}
              />
              <Button
                title="Delete Transaction"
                color="red"
                backgroundColor="white"
                buttonStyles={styles.buttonStyle}
                onPress={handleDeleteTransaction}
              />
              <CancelModal
                title="Delete Transaction"
                subTitle="This action cannot be undone. Stocks will not be reverted."
                cancelModalOpen={deleteConfirmationOpen}
                setCancelModalOpen={() => setDeleteConfirmationOpen(false)}
                onConfirmCancel={handleConfirmDeleteTransaction}
              />
            </ThemedView>
          </Pressable>
        </Modal>
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
  buttonStyle: {
    padding: 12,
    width: "85%",
    borderRadius: 4,
    alignItems: "center",
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2.5,
  },
});
