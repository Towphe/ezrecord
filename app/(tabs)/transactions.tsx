import TransactionsHome from "@/components/ui/transactions/transaction-home";
import TransactionView from "@/components/ui/transactions/transaction-view";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type TransactionsStackParamList = {
  TransactionsHome: undefined;
  TransactionView: { transactionId: string };
};

const TransactionScreenStack =
  createNativeStackNavigator<TransactionsStackParamList>();

export default function TransactionScreen() {
  return (
    <TransactionScreenStack.Navigator screenOptions={{ headerShown: false }}>
      <TransactionScreenStack.Screen
        name="TransactionsHome"
        component={TransactionsHome}
        options={{ animation: "none" }}
      />
      <TransactionScreenStack.Screen
        name="TransactionView"
        component={TransactionView}
        options={{ animation: "none" }}
      />
    </TransactionScreenStack.Navigator>
  );
}
