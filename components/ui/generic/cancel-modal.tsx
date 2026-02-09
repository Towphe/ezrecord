import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Modal, Pressable, StyleSheet } from "react-native";
import { Button } from "../generic/button";

type CancelModalProps = {
  title?: string;
  subTitle?: string;
  cancelModalOpen: boolean;
  setCancelModalOpen: (open: boolean) => void;
  onConfirmCancel: () => void;
};

export function CancelModal({
  title = "Confirm Action",
  subTitle,
  cancelModalOpen,
  setCancelModalOpen,
  onConfirmCancel,
}: CancelModalProps) {
  const handleCancel = () => {
    setCancelModalOpen(false);
    onConfirmCancel();
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={cancelModalOpen}
      onRequestClose={() => {
        setCancelModalOpen(false);
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={() => setCancelModalOpen(false)}>
        <ThemedView style={styles.modal}>
          <ThemedView style={styles.modalContent}>
            <ThemedView>
              <ThemedText
                style={{ ...styles.label, fontWeight: "bold", color: "red" }}
              >
                {title}
              </ThemedText>
              {subTitle && (
                <ThemedText style={styles.label}>{subTitle}</ThemedText>
              )}
            </ThemedView>
            <ThemedView style={styles.actionButtons}>
              <Button
                title="Confirm Cancellation"
                onPress={handleCancel}
                backgroundColor="#FF3B30"
                color="white"
                buttonStyles={styles.buttonStyle}
              />
              <Button
                title="Cancel"
                onPress={() => setCancelModalOpen(false)}
                backgroundColor="white"
                color="black"
                buttonStyles={{
                  ...styles.buttonStyle,
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  dateInput: {
    width: "90%",
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 16,
    textAlign: "center",
  },
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
    gap: 8,
  },
  modalContent: {
    width: "80%",
    alignItems: "center",
    gap: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtons: {
    gap: 6,
    width: "100%",
  },
  buttonStyle: {
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
});
