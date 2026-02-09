import { CaptureStackParamList } from "@/app/(tabs)/capture";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useCreateTransaction } from "@/hooks/create-transaction";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import { useState } from "react";
import { Button, Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "../icon-symbol";
import { ConfirmCashPaymentModal } from "./confirm-cash-payment-modal";
import { ProductItem } from "./item-card";

export default function ReviewOrder({
  route,
}: {
  route: RouteProp<CaptureStackParamList, "ReviewOrder">;
}) {
  const navigation = useNavigation();
  const { createTransaction } = useCreateTransaction();
  const { selectedProducts } = route.params;
  const total = selectedProducts.reduce(
    (sum, product) => sum + product.quantity * product.unitPrice,
    0,
  );
  const [confirmCashPaymentModalOpen, setConfirmCashPaymentModalOpen] =
    useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleEPayment = () => {
    setCameraLoading(true);

    setTimeout(() => {
      navigation.navigate({
        name: "EReceiptCapture",
        params: {
          selectedProducts: selectedProducts,
          totalAmount: total,
        },
      } as never);
    }, 10);
  };

  const handleCashPayment = () => {
    setConfirmCashPaymentModalOpen(true);
  };

  const confirmCashPayment = async () => {
    await createTransaction({
      transactionId: Crypto.randomUUID(),
      selectedProducts: selectedProducts,
      totalAmount: total,
      paymentMethod: "cash",
      paymentInfo: {
        name: null,
        accountNumber: null,
        referenceNumber: "N/A",
        amount: total,
      },
    });

    setConfirmCashPaymentModalOpen(false);
    navigation.navigate({
      name: "CaptureHome",
      params: {
        selectedProducts: selectedProducts,
        totalAmount: total,
      },
    } as never);
  };

  useFocusEffect(() => {
    setCameraLoading(false);
  });

  return (
    <ParallaxScrollView title="Capture">
      <ThemedView style={styles.page}>
        <ThemedView style={styles.productsContainer}>
          {selectedProducts.map((product) => (
            <ProductItem key={product.productId} {...product} />
          ))}
        </ThemedView>
        <ThemedView style={styles.actionContainer}>
          <ThemedText style={styles.total}>
            Total: P {total.toFixed(2)}
          </ThemedText>
          <Button title="E-Payment" color="teal" onPress={handleEPayment} />
          <Button title="Cash" color="green" onPress={handleCashPayment} />
          <ConfirmCashPaymentModal
            isOpen={confirmCashPaymentModalOpen}
            setIsOpen={setConfirmCashPaymentModalOpen}
            onConfirm={confirmCashPayment}
          />
        </ThemedView>
      </ThemedView>
      <Modal
        animationType="none"
        transparent={true}
        visible={cameraLoading}
        onRequestClose={() => {
          setCameraLoading(false);
        }}
      >
        <ThemedView style={styles.modal}>
          <IconSymbol name="camera" size={64} color={Colors.teal} />
          <ThemedText style={{ fontSize: 20 }}>Loading Camera...</ThemedText>
        </ThemedView>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginHorizontal: "auto",
    height: "50%",
  },
  productsContainer: {
    overflowY: "scroll",
    width: "100%",
    flexDirection: "column",
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  total: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  actionContainer: {
    width: "95%",
    marginHorizontal: "auto",
    gap: 8,
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#F2F2F2",
    bottom: 0,
    height: "100%",
    width: "100%",
    alignItems: "center",
    gap: 6,
  },
});
