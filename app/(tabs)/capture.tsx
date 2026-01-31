import CaptureHome from "@/components/ui/capture/capture-home";
import ReviewOrder from "@/components/ui/capture/review-order";
import { SelectedProduct } from "@/types/product-selection";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type CaptureStackParamList = {
  CaptureHome: { selectedProducts?: SelectedProduct[] | null };
  ReviewOrder: { selectedProducts: SelectedProduct[] };
};

const CaptureScreenStack = createNativeStackNavigator<CaptureStackParamList>();

export default function CaptureScreen() {
  return (
    <CaptureScreenStack.Navigator screenOptions={{ headerShown: false }}>
      <CaptureScreenStack.Screen
        name="CaptureHome"
        component={CaptureHome}
        options={{ animation: "none" }}
      />
      <CaptureScreenStack.Screen
        name="ReviewOrder"
        component={ReviewOrder}
        options={{ animation: "none" }}
      />
    </CaptureScreenStack.Navigator>
  );
}
