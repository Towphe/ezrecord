import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

type Props = {
  date: Date | null;
  defaultDate?: Date | null;
  onChange: (date: Date) => void;
};

export function DateInput({ date, defaultDate = null, onChange }: Props) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  return (
    <>
      <ThemedView style={styles.modal}>
        <ThemedView style={styles.picker}>
          <ThemedText style={styles.dateField}>
            {date ? date.toLocaleDateString() : "No date selected"}
          </ThemedText>
          <Pressable
            onPress={() => setDatePickerVisibility(true)}
            style={styles.calendarButton}
          >
            <IconSymbol name="calendar" size={20} color="#333" />
          </Pressable>
        </ThemedView>
      </ThemedView>
      <DateTimePickerModal
        date={defaultDate || date || new Date()}
        maximumDate={new Date()}
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDatePickerVisibility(false);
          onChange(date);
        }}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: "auto",
    width: "100%",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#3333330",
  },
  picker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateField: {
    paddingVertical: 8,
    fontSize: 20,
    textAlign: "center",
    width: "auto",
    flexGrow: 1,
  },
  calendarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "teal",
    height: "100%",
  },
});
