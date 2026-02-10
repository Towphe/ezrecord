import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ReturnButton } from "@/components/return-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useCreateProduct } from "@/hooks/create-product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import * as z from "zod";
import { Button } from "../generic/button";
import { CancelModal } from "../generic/cancel-modal";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
});

export function CreateProduct() {
  const navigation = useNavigation();
  const { createProduct } = useCreateProduct();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const isConfirmClickedRef = useRef(false);

  const navigateHome = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: "ProductsHome" as never }],
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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", price: 0, quantity: 0 },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await createProduct(data);
      isConfirmClickedRef.current = true;
    } catch {
      Toast.show({
        type: "error",
        text1: "Error creating product",
      });
      isConfirmClickedRef.current = false;
      return;
    }
    navigateHome();
  };

  return (
    <ParallaxScrollView
      leftSibling={<ReturnButton onPress={handleCancel} />}
      title="Products"
    >
      <ThemedView style={{ flex: 1, justifyContent: "space-between" }}>
        <KeyboardAvoidingView style={styles.form} behavior="height">
          <InputField
            fieldName="name"
            label="Name"
            control={control}
            placeholder="Product Name"
            inputStyle={styles.input}
          />
          {errors.name && <ThemedText>{errors.name.message}</ThemedText>}
          <InputField
            fieldName="description"
            label="Description"
            control={control}
            placeholder="Product Description"
            inputStyle={styles.input}
          />
          {errors.description && (
            <ThemedText>{errors.description.message}</ThemedText>
          )}
          <InputField
            fieldName="price"
            label="Price"
            control={control}
            placeholder="Product Price"
            fieldType="number"
            inputStyle={styles.input}
          />
          {errors.price && <ThemedText>{errors.price.message}</ThemedText>}
          <InputField
            fieldName="quantity"
            label="Quantity"
            control={control}
            placeholder="Product Quantity"
            fieldType="number"
            inputStyle={styles.input}
          />
          {errors.quantity && (
            <ThemedText>{errors.quantity.message}</ThemedText>
          )}
        </KeyboardAvoidingView>
        <ThemedView style={styles.actionButtons}>
          <Button
            title="Create Product"
            onPress={handleSubmit(onSubmit)}
            backgroundColor={Colors.green}
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
          setIsCancelModalOpen(false);
          navigateHome();
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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
});
