import { Pressable } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

type ReturnButtonProps = {
  onPress: () => void;
};

export function ReturnButton({ onPress }: ReturnButtonProps) {
  return (
    <Pressable style={{ marginTop: 36 }} onPress={onPress}>
      <IconSymbol name="arrow.left" size={24} color="#F2F2F2" />
    </Pressable>
  );
}
