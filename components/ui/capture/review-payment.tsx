import { CaptureStackParamList } from "@/app/(tabs)/capture";
import { DropdownField } from "@/components/dropdown";
import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ReturnButton } from "@/components/return-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useCreateTransaction } from "@/hooks/create-transaction";
import { useFindTransactionByReference } from "@/hooks/find-transaction-by-ref";
import zodResolver from "@/utils/zodResolver";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import Toast from "react-native-toast-message";
import * as z from "zod";
import { Button } from "../generic/button";
import { CancelModal } from "../generic/cancel-modal";
import { IconSymbol } from "../icon-symbol";

const paymentTypes = [
  { label: "GCash", value: "gcash" },
  { label: "Maya", value: "maya" },
  { label: "BPI Vybe", value: "bpi-vybe" },
];

const schema = z.object({
  amount: z.number(),
  referenceNumber: z.string(),
  paymentType: z.enum(["gcash", "maya", "bpi-vybe"]),
});

function EditButton({
  isEditing,
  setIsEditing,
}: {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (isEditing) {
    return (
      <Pressable style={{ marginTop: 36 }} onPress={() => setIsEditing(false)}>
        <Text>
          <IconSymbol name="stop" size={20} color="#F2F2F2" />
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={{ marginTop: 36 }} onPress={() => setIsEditing(true)}>
      <Text>
        <IconSymbol name="pencil" size={20} color="#F2F2F2" />;
      </Text>
    </Pressable>
  );
}

export default function ReviewPayment({
  route,
}: {
  route: RouteProp<CaptureStackParamList, "ReviewPayment">;
}) {
  const navigation = useNavigation();
  const { createTransaction } = useCreateTransaction();

  const {
    selectedProducts,
    totalAmount,
    paymentDetails,
    transactionId,
    receiptImageUri,
  } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState(
    paymentDetails.referenceNumber || undefined,
  );
  const [cameraLoading, setCameraLoading] = useState(false);
  const { transaction: existingTransaction } =
    useFindTransactionByReference(referenceNumber);

  useLayoutEffect(() => {
    // restore any parent tab bars hidden by the capture flow
    const parents = [] as any[];
    let p = navigation.getParent?.();
    while (p) {
      parents.push(p);
      p = p.getParent?.();
    }
    parents.forEach((par) => par.setOptions?.({ tabBarStyle: undefined }));

    return () => {};
  }, [navigation]);

  const redirectToScan = async () => {
    navigation.navigate({
      name: "EReceiptCapture",
      params: {
        selectedProducts: selectedProducts,
        totalAmount: totalAmount,
      },
    } as never);
  };

  const navigateHome = () => navigation.navigate("CaptureHome" as never);

  const confirmPayment = async (data: z.infer<typeof schema>) => {
    if (data.amount === null || data.amount < totalAmount) {
      Toast.show({
        type: "error",
        text1: "Amount Mismatch",
        text2: `The entered amount does not match the total amount of the products.`,
      });
      return;
    }

    try {
      await createTransaction({
        transactionId: transactionId,
        selectedProducts: selectedProducts,
        totalAmount: totalAmount,
        paymentMethod: data.paymentType,
        paymentInfo: {
          name: null,
          accountNumber: null,
          referenceNumber: data.referenceNumber,
          amount: data.amount,
        },
        receiptImageUri: receiptImageUri,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Transaction Failed",
        text2: `An error occurred while creating the transaction.`,
      });
      return;
    }

    navigateHome();
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: paymentDetails.amount,
      referenceNumber: paymentDetails.referenceNumber,
      paymentType: "gcash" as const,
    },
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();

      setIsCancelModalOpen(true);
    });

    return unsubscribe;
  }, [navigation]);

  const handleCameraRedirect = () => {
    setCameraLoading(true);

    setTimeout(() => {
      navigation.navigate({
        name: "EReceiptCapture",
        params: {
          selectedProducts: selectedProducts,
          totalAmount: totalAmount,
        },
      } as never);
    }, 10);
  };

  useFocusEffect(() => {
    setCameraLoading(false);
  });

  return (
    <ParallaxScrollView
      leftSibling={<ReturnButton onPress={navigateHome} />}
      title="Products"
      rightSibling={
        <EditButton isEditing={isEditing} setIsEditing={setIsEditing} />
      }
    >
      <ThemedView style={{ flex: 1, justifyContent: "space-between" }}>
        <KeyboardAvoidingView style={styles.form} behavior="height">
          <InputField
            fieldName="amount"
            label="Amount"
            fieldType="number"
            control={control}
            defaultValue={paymentDetails.amount}
            placeholder="Amount"
            disabled={!isEditing}
            inputStyle={styles.input}
          />
          {errors.amount && <ThemedText>{errors.amount.message}</ThemedText>}
          <ThemedView>
            <InputField
              fieldName="referenceNumber"
              label="Reference Number"
              control={control}
              placeholder="Reference Number"
              defaultValue={paymentDetails.referenceNumber}
              disabled={!isEditing}
              inputStyle={styles.input}
              onValueChange={setReferenceNumber}
            />
            {errors.referenceNumber && (
              <ThemedText>{errors.referenceNumber.message}</ThemedText>
            )}
            {existingTransaction !== null && (
              <ThemedText style={{ color: Colors.yellow }}>
                Warning: Reference number already exists.
              </ThemedText>
            )}
          </ThemedView>
          <DropdownField
            fieldName="paymentType"
            label="Payment Type (not automatically detected)"
            control={control}
            defaultValue={{}}
            items={paymentTypes}
            disabled={!isEditing}
            containerStyle={styles.dropdownField}
            labelStyle={styles.dropdownLabel}
            inputStyle={{
              inputAndroid: styles.dropdownInput,
            }}
          />
        </KeyboardAvoidingView>
        <ThemedView style={styles.actionButtons}>
          <Button
            title="Confirm Payment"
            backgroundColor="green"
            buttonStyles={styles.buttonStyle}
            onPress={handleSubmit(confirmPayment)}
          />
          <Button
            title="Rescan"
            backgroundColor={Colors.teal}
            buttonStyles={styles.buttonStyle}
            onPress={handleCameraRedirect}
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
      <CancelModal
        title="Confirm Cancellation"
        subTitle="This action cannot be undone."
        cancelModalOpen={isCancelModalOpen}
        setCancelModalOpen={setIsCancelModalOpen}
        onConfirmCancel={() => navigation.navigate("CaptureHome" as never)}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 20,
    marginHorizontal: "auto",
    flex: 1,
    flexDirection: "column",
    gap: 15,
    width: "95%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginTop: 2,
    fontSize: 16,
    paddingHorizontal: 12,
  },
  actionButtons: {
    gap: 6,
    marginHorizontal: "auto",
    width: "95%",
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
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
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
