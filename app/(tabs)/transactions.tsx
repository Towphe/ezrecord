import { EditTransaction } from "@/components/ui/transactions/edit-transaction";
import TransactionsHome from "@/components/ui/transactions/transaction-home";
import TransactionView from "@/components/ui/transactions/transaction-view";
import { Transaction } from "@/types/transaction";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type TransactionsStackParamList = {
  TransactionsHome: undefined;
  TransactionView: { transactionId: string };
  EditTransaction: { transaction: Transaction };
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
        name="EditTransaction"
        component={EditTransaction}
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
