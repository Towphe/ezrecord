import { DropdownField } from "@/components/dropdown";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import zodResolver from "@/utils/zodResolver";
import { useForm } from "react-hook-form";
import { Modal, Pressable, StyleSheet } from "react-native";
import * as z from "zod";
import { Button } from "../generic/button";
import { IconSymbol } from "../icon-symbol";

const sortOptions = [
  { label: "Name", value: "name" },
  { label: "Date Added", value: "dateAdded" },
];

const orderOptions = [
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
];

const stockOptions = [
  { label: "In Stock", value: "instock" },
  { label: "Out of Stock", value: "outofstock" },
  { label: "All", value: "all" },
];

const schema = z.object({
  sortBy: z
    .enum(sortOptions.map((option) => option.value))
    .optional()
    .default("name"),
  sortOrder: z
    .enum(orderOptions.map((option) => option.value))
    .optional()
    .default("asc"),
  hasStock: z
    .enum(stockOptions.map((option) => option.value))
    .optional()
    .default("all"),
});

type ProductFilterModalProps = {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  setFilters: (filters: {
    sortBy: "name" | "dateAdded";
    sortOrder: "asc" | "desc";
    hasStock: "instock" | "outofstock" | "all";
  }) => void;
};

export function ProductFilterModal({
  modalOpen,
  setModalOpen,
  setFilters,
}: ProductFilterModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      sortBy: "name",
      sortOrder: "asc",
      hasStock: "all",
    },
  });

  const applyFilter = async (data: z.infer<typeof schema>) => {
    setFilters({
      sortBy: data.sortBy as "dateAdded" | "name",
      sortOrder: data.sortOrder as "asc" | "desc",
      hasStock: data.hasStock as "instock" | "outofstock" | "all",
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
              <ThemedText style={{ fontSize: 20 }}>Filter Products</ThemedText>
              <Pressable onPress={() => setModalOpen(false)}>
                <IconSymbol name="stop" size={28} color="#3333333" />
              </Pressable>
            </ThemedView>
            <ThemedView style={{ width: "100%", gap: 12 }}>
              <DropdownField
                fieldName="sortBy"
                label="Sort By"
                control={control}
                defaultValue={{}}
                items={sortOptions}
                containerStyle={styles.dropdownField}
                labelStyle={styles.dropdownLabel}
                inputStyle={{
                  inputAndroid: styles.dropdownInput,
                }}
              />
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
                fieldName="hasStock"
                label="Stock"
                control={control}
                defaultValue={{}}
                items={stockOptions}
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
                backgroundColor={Colors.teal}
                buttonStyles={styles.buttonStyle}
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
  buttonStyle: {
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
  },
});
