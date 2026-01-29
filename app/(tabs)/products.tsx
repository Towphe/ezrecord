import { CreateProduct } from "@/components/ui/product/create-product";
import { ProductsHome } from "@/components/ui/product/product-home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const ProductScreenStack = createNativeStackNavigator();

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
    </ProductScreenStack.Navigator>
  );
}
