import { DropdownField } from "@/components/dropdown";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import zodResolver from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import { Button, Modal, Pressable, StyleSheet } from "react-native";
import * as z from "zod";
import { IconSymbol } from "../icon-symbol";

const orderOptions = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
];

const paymentOptions = [
  { label: "Cash", value: "cash" },
  { label: "Gcash", value: "gcash" },
  { label: "Maya", value: "maya" },
  { label: "BPI Vybe", value: "bpi" },
  { label: "All", value: "all" },
];

const schema = z.object({
  sortOrder: z
    .enum(orderOptions.map((option) => option.value))
    .optional()
    .default("asc"),
  paymentMethod: z
    .enum(paymentOptions.map((option) => option.value))
    .optional()
    .default("all"),
});

type TransactionFilterModalProps = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  setFilters: (filters: {
    sortOrder: "asc" | "desc";
    paymentMethod: "cash" | "gcash" | "maya" | "bpi" | "all";
  }) => void;
};

export function TransactionFilterModal({
  modalOpen,
  setModalOpen,
  setFilters,
}: TransactionFilterModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      sortOrder: "asc",
      paymentMethod: "all",
    },
  });

  const applyFilter = async (data: z.infer<typeof schema>) => {
    setFilters({
      sortOrder: data.sortOrder as "asc" | "desc",
      paymentMethod: data.paymentMethod as
        | "cash"
        | "gcash"
        | "maya"
        | "bpi"
        | "all",
    });

    setModalOpen(false);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalOpen}
      onRequestClose={() => {
        setModalOpen(false);
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={() => setModalOpen(false)}>
        <ThemedView style={styles.modal}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText style={{ fontSize: 20 }}>
                Filter Transactions
              </ThemedText>
              <Pressable onPress={() => setModalOpen(false)}>
                <IconSymbol name="stop" size={28} color="#3333333" />
              </Pressable>
            </ThemedView>
            <ThemedView style={{ width: "100%", gap: 12 }}>
              <DropdownField
                fieldName="sortOrder"
                label="Sort Order"
                control={control}
                defaultValue={{}}
                items={orderOptions}
                containerStyle={styles.dropdownField}
                labelStyle={styles.dropdownLabel}
                inputStyle={{
                  inputAndroid: styles.dropdownInput,
                }}
              />
              <DropdownField
                fieldName="paymentMethod"
                label="Payment Method"
                control={control}
                defaultValue={{}}
                items={paymentOptions}
                containerStyle={styles.dropdownField}
                labelStyle={styles.dropdownLabel}
                inputStyle={{
                  inputAndroid: styles.dropdownInput,
                }}
              />
            </ThemedView>
            <ThemedView style={{ width: "100%" }}>
              <Button
                title="Filter"
                onPress={handleSubmit(applyFilter)}
                color={Colors.teal}
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
  dropdownLabel: {
    marginBottom: 4,
  },
  dropdownField: {
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 6,
    borderRadius: 8,
    marginTop: 2,
    width: "100%",
  },
  dropdownInput: {
    color: "#333",
  },
});
