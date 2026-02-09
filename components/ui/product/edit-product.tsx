import { ProductStackParamList } from "@/app/(tabs)/products";
import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ReturnButton } from "@/components/return-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useEditProduct } from "@/hooks/edit-product";
import { useProduct } from "@/hooks/use-product";
import zodResolver from "@/utils/zodResolver";
import { RouteProp } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import * as z from "zod";
import { Button } from "../generic/button";
import { CancelModal } from "../generic/cancel-modal";

const schema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  quantity: z.coerce.number().optional(),
});

type Props = {
  productId: string;
};

export function EditProduct({
  route,
}: {
  route: RouteProp<ProductStackParamList, "EditProduct">;
}) {
  const navigation = useNavigation();
  const { productId } = route.params;
  const { product, loading: productLoading } = useProduct(productId);
  const { editProduct } = useEditProduct(productId);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const navigateToHome = () =>
    navigation.navigate({
      name: "ProductsHome",
    } as never);

  const handleCancel = () => {
    setIsCancelModalOpen(true);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
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
      name: product?.name,
      description: product?.description ?? undefined,
      price: product?.price ?? undefined,
      quantity: product?.quantity ?? undefined,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name ?? undefined,
        description: product.description ?? undefined,
        price: product.price ?? undefined,
        quantity: product.quantity ?? undefined,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await editProduct(data);
    } catch (err) {
      console.error("Failed to edit product", err);
    }

    navigateToHome();
  };

  if (productLoading) {
    return (
      <ParallaxScrollView title="Edit Product">
        <ThemedText>Loading...</ThemedText>
      </ParallaxScrollView>
    );
  }

  if (!productLoading && !product) {
    return (
      <ParallaxScrollView title="Edit Product">
        <ThemedText>Product not found.</ThemedText>
        <Button title="Return to Products" onPress={handleCancel} />
      </ParallaxScrollView>
    );
  }

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
            defaultValue={product?.name ?? undefined}
            inputStyle={styles.input}
          />
          {errors.name && <ThemedText>{errors.name.message}</ThemedText>}
          <InputField
            fieldName="description"
            label="Description"
            control={control}
            placeholder="Product Description"
            defaultValue={product?.description ?? undefined}
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
            defaultValue={product?.price ?? undefined}
            inputStyle={styles.input}
          />
          {errors.price && <ThemedText>{errors.price.message}</ThemedText>}
          <InputField
            fieldName="quantity"
            label="Quantity"
            control={control}
            placeholder="Product Quantity"
            fieldType="number"
            defaultValue={product?.quantity ?? undefined}
            inputStyle={styles.input}
          />
          {errors.quantity && (
            <ThemedText>{errors.quantity.message}</ThemedText>
          )}
        </KeyboardAvoidingView>
        <ThemedView style={styles.actionButtons}>
          <Button
            title="Edit Product"
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
        onConfirmCancel={() => navigation.navigate("ProductsHome" as never)}
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
});
