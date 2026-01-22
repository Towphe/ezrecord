import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Camera,
  PhotoFile,
  useCameraDevice,
  useCameraFormat,
} from "react-native-vision-camera";

export function CameraScreen() {
  const device = useCameraDevice("back");
  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile | null>(null);

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

  const onCapture = async () => {};
  if (!device) return <Text>Loading Device...</Text>;

  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: `file://${capturedPhoto.path}` }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setCapturedPhoto(null)}
        >
          <Text style={styles.text}>Retake</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!hasPermission)
    return <Text style={styles.text}>No Camera Permission</Text>;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        format={format}
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    height: "100%",
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
