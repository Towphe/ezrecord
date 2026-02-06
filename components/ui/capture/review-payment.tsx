import { CaptureStackParamList } from "@/app/(tabs)/capture";
import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { useCreateTransaction } from "@/hooks/create-transaction";
import zodResolver from "@/utils/zodResolver";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, KeyboardAvoidingView, StyleSheet } from "react-native";
import * as z from "zod";

const schema = z.object({
  amount: z.coerce.number(),
  referenceNumber: z.string(),
});

function parseAmount(amount: string): number {
  // remove all non-numeric characters except for the decimal point
  const cleanedAmount = amount.replace(/[^0-9.]/g, "");
  return parseFloat(cleanedAmount);
}

export default function ReviewPayment({
  route,
}: {
  route: RouteProp<CaptureStackParamList, "ReviewPayment">;
}) {
  const navigation = useNavigation();
  const { createTransaction } = useCreateTransaction();

  const { selectedProducts, totalAmount, paymentDetails } = route.params;
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
      // TODO: apply error handling (disable confirm button and show error message)
      console.log(
        `Amount ${data.amount} does not match total amount ${totalAmount}`,
      );
      return;
    }

    await createTransaction({
      selectedProducts: selectedProducts,
      totalAmount: totalAmount,
      paymentMethod: "epayment",
      paymentInfo: data,
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
      amount: parseAmount(paymentDetails.amount),
      referenceNumber: paymentDetails.referenceNumber,
    },
  });

  return (
    <ParallaxScrollView title="Products">
      <KeyboardAvoidingView style={styles.form} behavior="height">
        <InputField
          fieldName="amount"
          label="Amount"
          control={control}
          defaultValue={paymentDetails.amount}
          placeholder="Amount"
          disabled={!isEditing}
        />
        {errors.amount && <ThemedText>{errors.amount.message}</ThemedText>}
        <InputField
          fieldName="referenceNumber"
          label="Reference Number"
          control={control}
          placeholder="Reference Number"
          defaultValue={paymentDetails.referenceNumber}
          disabled={!isEditing}
        />
        {errors.referenceNumber && (
          <ThemedText>{errors.referenceNumber.message}</ThemedText>
        )}
        <Button
          title="Confirm Payment"
          color="green"
          onPress={handleSubmit(confirmPayment)}
        />
        <Button title="Rescan" color="teal" onPress={() => redirectToScan()} />
      </KeyboardAvoidingView>
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
});
