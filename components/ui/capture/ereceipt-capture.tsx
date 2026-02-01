import { CaptureStackParamList } from "@/app/(tabs)/capture";
import { CameraScreen } from "@/components/camera-screen";
import { extractText, locatePaymentFields } from "@/utils/photoProcessor";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { RouteProp } from "@react-navigation/native";
import { useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { useTensorflowModel } from "react-native-fast-tflite";
import ImageResizer from "react-native-image-resizer";
import { PhotoFile } from "react-native-vision-camera";

const YOLO_MODEL = require("../../../assets/models/yolo.tflite");

async function hasAndroidPermission() {
  const permission =
    parseInt(Platform.Version as string) >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) return true;

  const status = await PermissionsAndroid.request(permission);
  return status === "granted";
}

async function saveToGallery(tag: string) {
  // 'tag' is the local URI of the cropped image
  if (Platform.OS === "android" && !(await hasAndroidPermission())) {
    return;
  }

  try {
    await CameraRoll.save(tag, { type: "photo" });
    console.log("Success! Image is in the gallery.");
  } catch (error) {
    console.error("Save failed:", error);
  }
}

export default function EReceiptCapture({
  route,
}: {
  route: RouteProp<CaptureStackParamList, "EReceiptCapture">;
}) {
  const { selectedProducts } = route.params;
  const { totalAmount } = route.params;
  const [hasPermission, setHasPermission] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile | null>(null);

  const plugin = useTensorflowModel(YOLO_MODEL, "android-gpu");
  const model = plugin.model;

  const processPhoto = async (photo: PhotoFile) => {
    try {
      if (!model) {
        console.error("Model not loaded");
        return;
      }

      console.log("Starting detection...");

      // 1. Resize photo to exactly 640x640 using ImageResizer (resize plugin works with Frames, not PhotoFiles)
      const resizedPhoto = await ImageResizer.createResizedImage(
        `file://${photo.path}`,
        640,
        640,
        "JPEG",
        100,
        0,
        undefined,
        false,
        { mode: "contain", onlyScaleDown: false },
      );

      const detectedObjects = await locatePaymentFields(
        resizedPhoto.uri,
        model,
        resizedPhoto.width,
        resizedPhoto.height,
      );

      for (const obj of detectedObjects) {
        const text = await extractText(obj.croppedPath);

        console.log(text);
      }
    } catch (err) {
      console.error("Error during model inference:", err);
    }
  };

  return (
    <CameraScreen
      hasPermission={hasPermission}
      setHasPermission={setHasPermission}
      capturedPhoto={capturedPhoto}
      setCapturedPhoto={setCapturedPhoto}
      processPhoto={processPhoto}
    ></CameraScreen>
  );
}
