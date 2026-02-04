import { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";

type Props = {
  hasPermission: boolean;
  setHasPermission: (granted: boolean) => void;
  capturedPhoto: PhotoFile | null;
  setCapturedPhoto: (photo: PhotoFile | null) => void;
  processPhoto: (photo: PhotoFile) => Promise<void>;
  setIsProcessing: (processing: boolean) => void;
};

export function CameraScreen({
  hasPermission,
  setHasPermission,
  capturedPhoto,
  setCapturedPhoto,
  processPhoto,
  setIsProcessing,
}: Props) {
  const device = useCameraDevice("back");
  const camera = useRef<Camera>(null);

  // use parent sizing; let the camera fill its container

  const format = useCameraFormat(device, [
    { videoResolution: { width: 640, height: 480 } },
    { fps: 30 },
  ]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "granted");
    })();
  }, []);

  const onCapture = async () => {
    if (!camera.current) {
      // TODO: handle error; state camera not ready
      return;
    }

    const photo = await camera.current.takeSnapshot({ quality: 95 });

    setCapturedPhoto(photo);

    setIsProcessing(true);

    await processPhoto(photo);

    setIsProcessing(false);
  };

  if (!device) return <Text>Loading Device...</Text>;

  if (!hasPermission) {
    console.log("No camera permission");
    return <Text style={styles.text}>No Camera Permission</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFillObject}
        device={device}
        isActive={true}
        format={format ?? undefined}
        photo={true}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.captureButton]} onPress={onCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
  },
  button: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    alignSelf: "center",
    borderRadius: 10,
  },
  text: { color: "white", fontWeight: "bold" },
});
