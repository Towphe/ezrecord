import { ActionButton } from "@/components/action-button";
import { ThemedView } from "@/components/themed-view";
import { useDeleteProduct } from "@/hooks/delete-product";
import { Modal, Pressable, StyleSheet } from "react-native";

type Props = {
  productId: string;
  setModalVisible: (visible: boolean) => void;
  deletedModalVisible: boolean;
  setDeletedModalVisible: (visible: boolean) => void;
};

export function DeleteProductModal({
  productId,
  setModalVisible,
  deletedModalVisible,
  setDeletedModalVisible,
}: Props) {
  const { deleteProduct } = useDeleteProduct(productId);

  const handleCancel = () => {
    setDeletedModalVisible(false);
  };

  const handleDelete = async () => {
    await deleteProduct();
    setDeletedModalVisible(false);
    setModalVisible(false);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={deletedModalVisible}
      onRequestClose={() => {
        setDeletedModalVisible(!deletedModalVisible);
      }}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setDeletedModalVisible(false)}
      >
        <ThemedView style={styles.actionsModal}>
          <ActionButton
            title="Confirm Deletion"
            color="red"
            onPress={handleDelete}
          />
          <ActionButton title="Cancel" onPress={handleCancel} />
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
