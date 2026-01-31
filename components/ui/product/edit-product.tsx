import { ProductStackParamList } from "@/app/(tabs)/products";
import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useEditProduct } from "@/hooks/edit-product";
import { useProduct } from "@/hooks/use-product";
import zodResolver from "@/utils/zodResolver";
import { RouteProp } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, KeyboardAvoidingView, StyleSheet } from "react-native";
import * as z from "zod";

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

  const navigateToHome = () =>
    navigation.navigate({
      name: "ProductsHome",
    } as never);

  const handleCancel = () => {
    navigateToHome();
  };

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
      const updated = await editProduct(data);
      console.log("Edited Product", updated ?? data);
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
    <ParallaxScrollView title="Products">
      <KeyboardAvoidingView style={styles.form} behavior="height">
        <InputField
          fieldName="name"
          label="Name"
          control={control}
          placeholder="Product Name"
          defaultValue={product?.name ?? undefined}
        />
        {errors.name && <ThemedText>{errors.name.message}</ThemedText>}
        <InputField
          fieldName="description"
          label="Description"
          control={control}
          placeholder="Product Description"
          defaultValue={product?.description ?? undefined}
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
        />
        {errors.price && <ThemedText>{errors.price.message}</ThemedText>}
        <InputField
          fieldName="quantity"
          label="Quantity"
          control={control}
          placeholder="Product Quantity"
          fieldType="number"
          defaultValue={product?.quantity ?? undefined}
        />
        {errors.quantity && <ThemedText>{errors.quantity.message}</ThemedText>}
        <Button
          title="Edit Product"
          onPress={handleSubmit(onSubmit)}
          color={Colors.yellow}
        />
        <Button
          title="Cancel"
          onPress={handleCancel}
          color={Colors.dark.background}
        />
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
