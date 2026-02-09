import { ThemedText } from "@/components/themed-text";
import { StyleSheet, TouchableOpacity } from "react-native";

export function Button({
  title,
  onPress,
  buttonStyles,
  backgroundColor = "blue",
  color = "white",
  textStyles,
  disabled,
}: {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  color?: string;
  disabled?: boolean;
  buttonStyles?: object;
  textStyles?: object;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        ...(buttonStyles || defaultStyles.button),
        backgroundColor: backgroundColor,
      }}
      disabled={disabled}
    >
      <ThemedText
        style={[{ color: color }, textStyles || defaultStyles.buttonText]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const defaultStyles = StyleSheet.create({
  button: {
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
