import StatisticsHome from "@/components/ui/statistics/statistics-home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";

export type StatisticsStackParamList = {
  StatisticsHome: undefined;
};

const StatisticsScreenStack =
  createNativeStackNavigator<StatisticsStackParamList>();

export default function StatisticsScreen() {
  return (
    <StatisticsScreenStack.Navigator screenOptions={{ headerShown: false }}>
      <StatisticsScreenStack.Screen
        name="StatisticsHome"
        component={StatisticsHome}
      />
    </StatisticsScreenStack.Navigator>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
