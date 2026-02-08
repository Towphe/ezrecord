import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useClearData } from "@/hooks/clear-data";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet } from "react-native";
import { RemoveDataModal } from "./remove-modal";

export default function SettingsHome() {
  const router = useRouter();
  const [deletedModalVisible, setDeletedModalVisible] = useState(false);
  const { clearData } = useClearData();

  const handleClearData = async () => {
    await clearData();
    setDeletedModalVisible(false);

    // go to statistics home found in separate screen stack to avoid issues with resetting the navigation state after clearing data
    // navigation.navigate({
    //   name: "StatisticsHome",
    // } as never);
    router.navigate("/");
  };

  return (
    <ParallaxScrollView title="Settings">
      <ThemedView style={styles.page}>
        <ThemedView style={styles.settingsRow}>
          <ThemedText style={{ fontSize: 20 }}>Clear all data</ThemedText>
          <Button
            title="Clear"
            onPress={() => setDeletedModalVisible(true)}
            color="red"
          />
          <RemoveDataModal
            removeDataModalVisible={deletedModalVisible}
            setRemoveDataModalVisible={setDeletedModalVisible}
            onConfirmDelete={handleClearData}
          />
        </ThemedView>
      </ThemedView>
      {/* <ThemedView style={styles.stepContainer}></ThemedView> */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    marginHorizontal: "auto",
    height: "100%",
    paddingVertical: 16,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
});
