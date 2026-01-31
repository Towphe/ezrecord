import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";

export type ActionButtonProps = {
  title: string;
  color?: string;
  onPress: () => void;
};

export function ActionButton({ title, color, onPress }: ActionButtonProps) {
  return (
    <Pressable
      style={{ width: "95%", marginHorizontal: "auto" }}
      onPress={onPress}
    >
      <ThemedText style={[styles.actionButton, color ? { color } : {}]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
