import { DateInput } from "@/components/date-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useExportTransactions } from "@/hooks/export-transactions";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { Button } from "../generic/button";
import { IconSymbol } from "../icon-symbol";

type ExportModalProps = {
  downloadModalOpen: boolean;
  setDownloadModalOpen: (open: boolean) => void;
};

export function ExportModal({
  downloadModalOpen,
  setDownloadModalOpen,
}: ExportModalProps) {
  const { exportFile } = useExportTransactions();

  const currentDate = new Date();

  // Set default start date to 3 days ago
  const pastThreeDays = new Date(
    currentDate.getTime() - 3 * 24 * 60 * 60 * 1000,
  );

  const [startDate, setStartDate] = useState<Date>(pastThreeDays);
  const [endDate, setEndDate] = useState<Date>(currentDate);
  const [isDateRangeValid, setIsDateRangeValid] = useState(true);

  const handleExport = async () => {
    if (!startDate || !endDate) return;

    await exportFile(startDate, endDate);
    setDownloadModalOpen(false);
  };

  useEffect(() => {
    const validateDateRange = () => {
      if (!startDate || !endDate) return true;

      return startDate <= endDate;
    };

    setIsDateRangeValid(validateDateRange());
  }, [startDate, endDate]);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={downloadModalOpen}
      onRequestClose={() => {
        setDownloadModalOpen(false);
      }}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setDownloadModalOpen(false)}
      >
        <ThemedView style={styles.modal}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={{ fontSize: 20 }}>
                Export Transactions
              </ThemedText>
              <Pressable onPress={() => setDownloadModalOpen(false)}>
                <IconSymbol name="stop" size={28} color="#3333333" />
              </Pressable>
            </ThemedView>
            <ThemedView style={styles.dateInput}>
              <ThemedText style={styles.label}>Start Date</ThemedText>
              <DateInput
                date={startDate}
                defaultDate={pastThreeDays}
                onChange={setStartDate}
              />
            </ThemedView>
            <ThemedView style={styles.dateInput}>
              <ThemedText style={styles.label}>End Date</ThemedText>
              <DateInput
                date={endDate}
                defaultDate={new Date()}
                onChange={setEndDate}
              />
            </ThemedView>
            {!isDateRangeValid && (
              <ThemedText style={{ color: "red" }}>
                Start date must be before end date.
              </ThemedText>
            )}
            <ThemedView style={{ width: "90%" }}>
              <Button
                title="Export"
                onPress={handleExport}
                backgroundColor={Colors.green}
                buttonStyles={styles.buttonStyle}
                disabled={!isDateRangeValid}
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
    fontSize: 20,
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
    gap: 6,
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonStyle: {
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
  },
});
