import { CaptureStackParamList } from "@/app/(tabs)/capture";
import { ThemedText } from "@/components/themed-text";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Button, Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ErrorScanning({
  route,
}: {
  route: RouteProp<CaptureStackParamList, "ErrorScanning">;
}) {
  const navigation = useNavigation();
  const { selectedProducts, totalAmount } = route.params;
  const insets = useSafeAreaInsets();

  const redirectToScan = () => {
    navigation.navigate({
      name: "EReceiptCapture",
      params: {
        selectedProducts: selectedProducts,
        totalAmount: totalAmount,
      },
    } as never);
  };

  const cancel = () => {
    navigation.navigate("CaptureHome" as never);
  };

  return (
    <View style={[styles.container, { marginBottom: -insets.bottom }]}>
      <View style={{ alignItems: "center", gap: 28 }}>
        <Image source={require("@/assets/images/sad.png")} />
        <ThemedText style={styles.text}>Error scanning</ThemedText>
      </View>
      <View style={styles.buttonGroup}>
        <Button title="Try Again" color="grey" onPress={redirectToScan} />
        <Button title="Cancel" color="maroon" onPress={cancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    gap: 28,
    backgroundColor: "red",
  },
  text: {
    fontSize: 28,
    color: "white",
  },
  buttonGroup: {
    position: "absolute",
    bottom: 50,
    width: "80%",
    gap: 12,
  },
});
