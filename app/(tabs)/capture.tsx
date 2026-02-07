import CaptureHome from "@/components/ui/capture/capture-home";
import EReceiptCapture from "@/components/ui/capture/ereceipt-capture";
import ErrorScanning from "@/components/ui/capture/error-scanning";
import ReviewOrder from "@/components/ui/capture/review-order";
import ReviewPayment from "@/components/ui/capture/review-payment";
import { Payment } from "@/types/payment";
import { SelectedProduct } from "@/types/product-selection";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type CaptureStackParamList = {
  CaptureHome: { selectedProducts?: SelectedProduct[] | null };
  ReviewOrder: { selectedProducts: SelectedProduct[] };
  EReceiptCapture: { selectedProducts: SelectedProduct[]; totalAmount: number };
  ReviewPayment: {
    selectedProducts: SelectedProduct[];
    totalAmount: number;
    paymentDetails: Payment;
  };
  ErrorScanning: {
    selectedProducts: SelectedProduct[];
    totalAmount: number;
    message: string;
  };
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
      <CaptureScreenStack.Screen
        name="EReceiptCapture"
        component={EReceiptCapture}
        options={{ animation: "none" }}
      />
      <CaptureScreenStack.Screen
        name="ReviewPayment"
        component={ReviewPayment}
        options={{ animation: "none" }}
      />
      <CaptureScreenStack.Screen
        name="ErrorScanning"
        component={ErrorScanning}
        options={{ animation: "none" }}
      />
    </CaptureScreenStack.Navigator>
  );
}
