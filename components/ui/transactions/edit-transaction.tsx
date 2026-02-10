import { TransactionsStackParamList } from "@/app/(tabs)/transactions";
import { DropdownField } from "@/components/dropdown";
import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ReturnButton } from "@/components/return-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { paymentTypes } from "@/constants/payment";
import { Colors } from "@/constants/theme";
import { useEditTransaction } from "@/hooks/edit-transaction";
import zodResolver from "@/utils/zodResolver";
import { RouteProp } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import * as z from "zod";
import { Button } from "../generic/button";
import { CancelModal } from "../generic/cancel-modal";

const schema = z.object({
  paymentMethod: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export function EditTransaction({
  route,
}: {
  route: RouteProp<TransactionsStackParamList, "EditTransaction">;
}) {
  const navigation = useNavigation();
  const { transaction } = route.params;
  const { editTransaction } = useEditTransaction(transaction.transactionId);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(
    transaction.paymentMethod,
  );
  const isConfirmClickedRef = useRef(false);

  const navigateToHome = () =>
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "TransactionView" as never,
          params: { transactionId: transaction.transactionId },
        },
      ],
    });

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isConfirmClickedRef.current === true) {
        isConfirmClickedRef.current = false;
        return;
      }

      e.preventDefault();

      handleCancel();
    });

    return unsubscribe;
  }, [navigation]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: transaction.paymentMethod,
      referenceNumber: transaction.referenceNumber ?? undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await editTransaction(data);
      isConfirmClickedRef.current = true;
    } catch (err) {
      isConfirmClickedRef.current = false;
      Toast.show({
        type: "error",
        text1: "Error editing transaction",
      });
      return;
    }

    navigateToHome();
  };

  return (
    <ParallaxScrollView
      leftSibling={<ReturnButton onPress={handleCancel} />}
      title="Transactions"
    >
      <ThemedView style={{ flex: 1, justifyContent: "space-between" }}>
        <KeyboardAvoidingView style={styles.form} behavior="height">
          <DropdownField
            fieldName="paymentType"
            label="Payment Type"
            control={control}
            defaultValue={{}}
            items={paymentTypes}
            containerStyle={styles.dropdownField}
            labelStyle={styles.dropdownLabel}
            inputStyle={{
              inputAndroid: styles.dropdownInput,
            }}
            onValueChange={setCurrentPaymentMethod}
          />
          {errors.paymentMethod && (
            <ThemedText>{errors.paymentMethod.message}</ThemedText>
          )}
          {currentPaymentMethod !== "cash" && (
            <>
              <InputField
                fieldName="referenceNumber"
                label="Reference Number"
                control={control}
                placeholder="Reference Number"
                fieldType="string"
                defaultValue={transaction?.referenceNumber ?? undefined}
                inputStyle={styles.input}
              />
              {errors.referenceNumber && (
                <ThemedText>{errors.referenceNumber.message}</ThemedText>
              )}
            </>
          )}
        </KeyboardAvoidingView>
        <ThemedView style={styles.actionButtons}>
          <Button
            title="Edit Transaction"
            onPress={handleSubmit(onSubmit)}
            backgroundColor={Colors.yellow}
            buttonStyles={styles.buttonStyle}
          />
          <Button
            title="Cancel"
            onPress={handleCancel}
            backgroundColor={Colors.dark.background}
            buttonStyles={styles.buttonStyle}
          />
        </ThemedView>
      </ThemedView>
      <CancelModal
        title="Confirm Cancellation"
        subTitle="This action cannot be undone."
        cancelModalOpen={isCancelModalOpen}
        setCancelModalOpen={setIsCancelModalOpen}
        onConfirmCancel={() => {
          isConfirmClickedRef.current = true;
          navigateToHome();
        }}
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
  },
  actionButtons: {
    gap: 6,
    marginHorizontal: "auto",
    width: "95%",
  },
  buttonStyle: {
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
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
