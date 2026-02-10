import { CaptureStackParamList } from "@/app/(tabs)/capture";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ReturnButton } from "@/components/return-button";
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
import { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../generic/button";
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
  const isConfirmClickedRef = useRef(false);

  const navigateHome = (params?: any) => {
    if (params) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "CaptureHome",
            params: params,
          },
        ],
      } as never);
      return;
    } else {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "CaptureHome",
            params: { selectedProducts: [] },
          },
        ],
      } as never);
    }
  };

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

    isConfirmClickedRef.current = true;
    setConfirmCashPaymentModalOpen(false);
    navigateHome();
  };

  useFocusEffect(() => {
    setCameraLoading(false);
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      const actionType = e.data?.action?.type;

      if (isConfirmClickedRef.current === true) {
        isConfirmClickedRef.current = false;
        return;
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <ParallaxScrollView
      leftSibling={<ReturnButton onPress={() => navigateHome()} />}
      title="Capture"
    >
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
          <Button
            title="E-Payment"
            backgroundColor={Colors.teal}
            onPress={handleEPayment}
            buttonStyles={styles.buttonStyle}
          />
          <Button
            title="Cash"
            backgroundColor="green"
            onPress={handleCashPayment}
            buttonStyles={styles.buttonStyle}
          />
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
  buttonStyle: {
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
});
