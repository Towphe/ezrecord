import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { METHOD_COLORS } from "@/constants/statistics";
import { useStatistics } from "@/hooks/use-statistics";
import { ScrollView, StyleSheet } from "react-native";
import PieChart from "react-native-pie-chart";

function PaymentLegend({ method, color }: { method: string; color: string }) {
  return (
    <ThemedView style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <ThemedView
        style={{ width: 20, height: 20, backgroundColor: color }}
      ></ThemedView>
      <ThemedText>{method}</ThemedText>
    </ThemedView>
  );
}

export default function StatisticsHome() {
  const { statistics, loading } = useStatistics();

  if (loading) {
    return (
      <ParallaxScrollView title="Statistics">
        <ThemedText>Loading...</ThemedText>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView title="Statistics">
      <ThemedView style={styles.page}>
        <ThemedView style={styles.totalPaymentsContainer}>
          <ThemedView>
            <ThemedText style={styles.mediumText}>Total Payments</ThemedText>
            <ThemedText style={{ opacity: 0.6 }}>
              In the last 30 days
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.largeText}>
            ₱ {statistics?.totalPayments.toFixed(2)}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.paymentDistributionContainer}>
          <ThemedView style={styles.paymentDistributionTitle}>
            <ThemedText style={styles.mediumText}>
              Payment Distribution
            </ThemedText>
          </ThemedView>
          <PieChart
            widthAndHeight={250}
            series={statistics?.paymentMethods ?? []}
          />
          <ThemedView style={styles.paymentDistributionLegends}>
            <PaymentLegend method="G-Cash" color={METHOD_COLORS.gcash} />
            <PaymentLegend method="Maya" color={METHOD_COLORS.maya} />
            <PaymentLegend method="BPI" color={METHOD_COLORS.bpi} />
            <PaymentLegend method="Other" color={METHOD_COLORS.other} />
          </ThemedView>
        </ThemedView>
        <ScrollView style={styles.topProductsContainer}>
          <ThemedText style={styles.mediumText}>Top Products</ThemedText>
          <ThemedView style={styles.topProducts}>
            {statistics?.topProducts.map((product, index) => (
              <ThemedView key={index} style={styles.productRow}>
                <ThemedView style={styles.productName}>
                  <ThemedText style={{ opacity: 0.6, ...styles.mediumText }}>
                    {index + 1}.
                  </ThemedText>
                  <ThemedText style={styles.mediumText}>
                    {product.name}
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.mediumText}>
                  {product.totalQuantity} sold
                </ThemedText>
                {/* <ThemedText>₱ {product.totalRevenue.toFixed(2)}</ThemedText> */}
              </ThemedView>
            ))}
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    gap: 32,
    width: "100%",
    marginHorizontal: "auto",
    height: "50%",
    paddingVertical: 20,
  },
  totalPaymentsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "95%",
    marginHorizontal: "auto",
  },
  paymentDistributionTitle: {
    marginHorizontal: "auto",
    marginBottom: 12,
    width: "100%",
  },
  paymentDistributionContainer: {
    width: "95%",
    alignItems: "center",
    justifyContent: "center",
  },
  topProductsContainer: {
    width: "95%",
  },
  paymentDistributionLegends: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
  },
  topProducts: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginHorizontal: "auto",
    marginTop: 12,
    gap: 6,
  },
  productRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productName: {
    flexDirection: "row",
    gap: 12,
  },
  mediumText: {
    fontSize: 20,
  },
  largeText: {
    fontSize: 28,
  },
});
