import { ActionButton } from "@/components/action-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useDeleteProduct } from "@/hooks/delete-product";
import { Product } from "@/types/products";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { CancelModal } from "../generic/cancel-modal";

type ProductCardProps = Product & { onDeleted?: () => void };

export function ProductCard({
  productId,
  name,
  quantity,
  price,
  onDeleted,
}: ProductCardProps) {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { deleteProduct } = useDeleteProduct(productId);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleEditPress = () => {
    navigation.navigate({
      name: "EditProduct",
      params: { productId: productId },
    } as never);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleDeleteTransaction = () => {
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteProduct();
    setDeleteConfirmationOpen(false);
    setModalVisible(false);
    onDeleted?.();
  };

  return (
    <Pressable onPress={() => setModalVisible(true)} style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.productName}>{name}</ThemedText>
        <ThemedView style={styles.actionButtonGroup}>
          <ThemedText style={styles.price}>₱ {price.toFixed(2)}</ThemedText>
          <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <Pressable style={{ flex: 1 }} onPress={handleCancel}>
              <ThemedView style={styles.actionsModal}>
                <ActionButton title="Edit Product" onPress={handleEditPress} />
                <ActionButton
                  title="Delete Product"
                  color="red"
                  onPress={handleDeleteTransaction}
                />
              </ThemedView>
            </Pressable>
          </Modal>
        </ThemedView>
      </ThemedView>
      <ThemedView>
        <ThemedText style={styles.quantity}>Quantity: {quantity}</ThemedText>
      </ThemedView>
      <CancelModal
        title="Delete Product"
        subTitle="This action cannot be undone. Transactions with this product will not be deleted."
        cancelModalOpen={deleteConfirmationOpen}
        setCancelModalOpen={() => setDeleteConfirmationOpen(false)}
        onConfirmCancel={handleConfirmDelete}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomColor: "#33333330",
    borderBottomWidth: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 20,
    width: "100%",
  },
  productName: {
    fontSize: 20,
    paddingBottom: 4,
    fontWeight: "400",
  },
  price: {
    fontSize: 20,
  },
  actionButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  quantity: {
    opacity: 0.5,
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
  actionButton: {
    width: "95%",
    backgroundColor: "#F2F2F2",
    marginHorizontal: "auto",
    padding: 8,
    textAlign: "center",
    fontSize: 18,
    // color: "red",
    borderRadius: 6,
    borderColor: "#898989ff",
    borderWidth: 0.5,
  },
});
