import { InputField } from "@/components/input-field";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useCreateProduct } from "@/hooks/create-product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "expo-router";
import { useForm } from "react-hook-form";
import { Button, KeyboardAvoidingView, StyleSheet } from "react-native";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
});

export function CreateProduct() {
  const navigation = useNavigation();
  const { createProduct } = useCreateProduct();

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", price: 0, quantity: 0 },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    createProduct(data);
    navigateToHome();
  };

  return (
    <ParallaxScrollView title="Products">
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
            color={Colors.green}
          />
          <Button
            title="Cancel"
            onPress={handleCancel}
            color={Colors.dark.background}
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
});
