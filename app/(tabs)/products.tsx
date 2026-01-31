import { CreateProduct } from "@/components/ui/product/create-product";
import { EditProduct } from "@/components/ui/product/edit-product";
import { ProductsHome } from "@/components/ui/product/product-home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type ProductStackParamList = {
  ProductsHome: undefined;
  CreateProduct: undefined;
  EditProduct: { productId: string };
};

const ProductScreenStack = createNativeStackNavigator<ProductStackParamList>();

export default function ProductsScreen() {
  return (
    <ProductScreenStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductScreenStack.Screen
        name="ProductsHome"
        component={ProductsHome}
        options={{ animation: "none" }}
      />
      <ProductScreenStack.Screen
        name="CreateProduct"
        component={CreateProduct}
        options={{ animation: "none" }}
      />
      <ProductScreenStack.Screen
        name="EditProduct"
        component={EditProduct}
        options={{ animation: "none" }}
      />
    </ProductScreenStack.Navigator>
  );
}
