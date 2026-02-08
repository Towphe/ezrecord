import { ActionButton } from "@/components/action-button";
import { ThemedView } from "@/components/themed-view";
import { Modal, Pressable, StyleSheet } from "react-native";

type Props = {
  removeDataModalVisible: boolean;
  setRemoveDataModalVisible: (visible: boolean) => void;
  onConfirmDelete: () => void;
};

export function RemoveDataModal({
  removeDataModalVisible,
  setRemoveDataModalVisible,
  onConfirmDelete,
}: Props) {
  const handleCancel = () => {
    setRemoveDataModalVisible(false);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={removeDataModalVisible}
      onRequestClose={() => {
        setRemoveDataModalVisible(!removeDataModalVisible);
      }}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setRemoveDataModalVisible(false)}
      >
        <ThemedView style={styles.actionsModal}>
          <ActionButton
            title="Confirm Deletion"
            color="red"
            onPress={onConfirmDelete}
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
