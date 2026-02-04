import { CaptureStackParamList } from "@/app/(tabs)/capture";
import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
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

  const redirectToScan = () => {
    navigation.navigate({
      name: "EReceiptCapture",
      params: {
        selectedProducts: selectedProducts,
        totalAmount: totalAmount,
      },
    } as never);
  };

  const confirmPayment = () => {
    // TODO: create transaction and update inventory

    navigation.navigate("CaptureHome" as never);
  };

  const {
    control,
    handleSubmit,
    reset,
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
          placeholder="Amount"
          disabled={!isEditing}
        />
        {errors.amount && <ThemedText>{errors.amount.message}</ThemedText>}
        <InputField
          fieldName="referenceNumber"
          label="Reference Number"
          control={control}
          placeholder="Reference Number"
          defaultValue={paymentDetails.referenceNumber ?? undefined}
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
        <Button title="Rescan" color="teal" onPress={redirectToScan} />
      </KeyboardAvoidingView>
    </ParallaxScrollView>
  );

  // return (
  //   <ParallaxScrollView title="Capture">
  //     <ThemedView style={styles.page}>
  //       {/* <ThemedView style={styles.productsContainer}>
  //         {selectedProducts.map((product) => (
  //           <ProductItem key={product.productId} {...product} />
  //         ))}
  //       </ThemedView> */}
  //       <ThemedView>
  //         {/* <ThemedText>Name: {paymentDetails.name}</ThemedText> */}
  //         {paymentDetails.name && (
  //           <ThemedText>Name: {paymentDetails.name}</ThemedText>
  //         )}
  //         <ThemedText>Amount: {paymentDetails.amount}</ThemedText>
  //         <ThemedText>
  //           Reference Number: {paymentDetails.referenceNumber}
  //         </ThemedText>
  //       </ThemedView>
  //       <ThemedView style={styles.actionContainer}>
  // <Button title="Rescan" color="teal" onPress={redirectToScan} />
  // <Button
  //   title="Confirm Payment"
  //   color="green"
  //   onPress={confirmPayment}
  // />
  //       </ThemedView>
  //     </ThemedView>
  //   </ParallaxScrollView>
  // );
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
