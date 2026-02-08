import { CaptureStackParamList } from "@/app/(tabs)/capture";
import { DropdownField } from "@/components/dropdown";
import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useCreateTransaction } from "@/hooks/create-transaction";
import zodResolver from "@/utils/zodResolver";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import Toast from "react-native-toast-message";
import * as z from "zod";
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

  const confirmPayment = async (data: z.infer<typeof schema>) => {
    if (data.amount === null || data.amount < totalAmount) {
      Toast.show({
        type: "error",
        text1: "Amount Mismatch",
        text2: `The entered amount does not match the total amount of the products.`,
      });
      return;
    }

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

    navigation.navigate("CaptureHome" as never);
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
    },
  });

  return (
    <ParallaxScrollView
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
          <InputField
            fieldName="referenceNumber"
            label="Reference Number"
            control={control}
            placeholder="Reference Number"
            defaultValue={paymentDetails.referenceNumber}
            disabled={!isEditing}
            inputStyle={styles.input}
          />
          {errors.referenceNumber && (
            <ThemedText>{errors.referenceNumber.message}</ThemedText>
          )}
          <DropdownField
            fieldName="paymentType"
            label="Payment Type (not automatically detected)"
            control={control}
            defaultValue={"gcash"}
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
            color="green"
            onPress={handleSubmit(confirmPayment)}
          />
          <Button
            title="Rescan"
            color="teal"
            onPress={() => redirectToScan()}
          />
        </ThemedView>
      </ThemedView>
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
});
