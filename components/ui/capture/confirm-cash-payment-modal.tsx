import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button, Modal, Pressable, StyleSheet } from "react-native";

type ConfirmCashPaymentModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: () => void;
};

export function ConfirmCashPaymentModal({
  isOpen,
  setIsOpen,
  onConfirm,
}: ConfirmCashPaymentModalProps) {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isOpen}
      onRequestClose={() => {
        setIsOpen(false);
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={() => setIsOpen(false)}>
        <ThemedView style={styles.modal}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={{ fontSize: 20 }}>
              Confirm Cash Payment?
            </ThemedText>
            <ThemedView style={styles.actionButtons}>
              <Button title="Confirm" color="green" onPress={onConfirm} />
              <Button
                title="Cancel"
                color="red"
                onPress={() => setIsOpen(false)}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flexDirection: "column",
    justifyContent: "center",
    position: "absolute",
    backgroundColor: "#33333360",
    bottom: 0,
    paddingBottom: 80,
    height: "100%",
    width: "100%",
    alignItems: "center",
    gap: 6,
  },
  modalContent: {
    padding: 20,
    width: "80%",
    gap: 12,
  },
  actionButtons: {
    gap: 6,
    width: "100%",
  },
});
