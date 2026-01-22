import { CameraScreen } from "@/components/camera-screen";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { StyleSheet } from "react-native";

export default function CaptureScreen() {
  return (
    <ParallaxScrollView title="Capture">
      {/* <ThemedView style={styles.absoluteFill}></ThemedView> */}
      <CameraScreen />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    flex: 1,
  },
});
