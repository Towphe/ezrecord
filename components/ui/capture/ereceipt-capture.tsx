import { CaptureStackParamList } from "@/app/(tabs)/capture";
import { CameraScreen } from "@/components/camera-screen";
import { Payment, UntreatedPayment } from "@/types/payment";
import { extractText, locatePaymentFields } from "@/utils/photoProcessor";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useTensorflowModel } from "react-native-fast-tflite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PhotoFile } from "react-native-vision-camera";
import { ProcessingScreen } from "./processing-screen";

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
  } catch (error) {
    console.error("Save failed:", error);
  }
}

export default function EReceiptCapture({
  route,
}: {
  route: RouteProp<CaptureStackParamList, "EReceiptCapture">;
}) {
  const navigation = useNavigation();
  const { selectedProducts } = route.params;
  const { totalAmount } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // get device height and width
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile | null>(null);

  const plugin = useTensorflowModel(YOLO_MODEL, "android-gpu");
  const model = plugin.model;

  const processPhoto = async (photo: PhotoFile) => {
    try {
      if (!model) {
        console.error("Model not loaded");
        return;
      }

      const paymentDetails: UntreatedPayment = {
        name: null,
        date: null,
        accountNumber: "",
        amount: "",
        referenceNumber: "",
      };

      const { detectedObjects, transactionId, receiptImageUri } =
        await locatePaymentFields(`file://${photo.path}`, model);

      for (const obj of detectedObjects) {
        const text = await extractText(obj.croppedPath);

        switch (obj.classId) {
          case 0:
            paymentDetails.accountNumber = text;
            break;
          case 1:
            paymentDetails.name = text;
            break;
          case 2:
            paymentDetails.referenceNumber = text;
            break;
          case 3:
            paymentDetails.amount = text;
            break;
          case 4:
            paymentDetails.date = text;
            break;
        }
      }

      if (
        paymentDetails.amount === "" ||
        paymentDetails.referenceNumber === ""
      ) {
        throw new Error("Essential payment details missing");
      }

      const treatedPayment: Payment = {
        name: paymentDetails.name,
        accountNumber: paymentDetails.accountNumber
          ? paymentDetails.accountNumber
          : null,
        amount: parseFloat(paymentDetails.amount.replace(/[^0-9.-]+/g, "")),
        referenceNumber: paymentDetails.referenceNumber,
      };

      // Processing complete, show results or next steps
      navigation.navigate({
        name: "ReviewPayment",
        params: {
          transactionId,
          selectedProducts: selectedProducts,
          totalAmount: totalAmount,
          paymentDetails: treatedPayment,
          receiptImageUri,
        },
      } as never);
    } catch {
      navigation.navigate({
        name: "ErrorScanning",
        params: {
          message: "Error scanning e-receipt. Please try again.",
          selectedProducts,
          totalAmount,
        },
      } as never);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });

    // hide any parent tab bars (handles nested tab navigators)
    const parents = [] as any[];
    let p = navigation.getParent?.();
    while (p) {
      parents.push(p);
      p = p.getParent?.();
    }
    parents.forEach((par) =>
      par.setOptions?.({ tabBarStyle: { display: "none", height: 0 } }),
    );

    return () => {
      // restore header and tab bar style
      navigation.setOptions?.({ headerShown: undefined });
      parents.forEach((par) => par.setOptions?.({ tabBarStyle: undefined }));
    };
  }, [navigation]);

  if (capturedPhoto && isProcessing) {
    return <ProcessingScreen />;
  }

  return (
    <View style={[styles.container, { marginBottom: -insets.bottom }]}>
      <CameraScreen
        hasPermission={hasPermission}
        setHasPermission={setHasPermission}
        capturedPhoto={capturedPhoto}
        setCapturedPhoto={setCapturedPhoto}
        processPhoto={processPhoto}
        setIsProcessing={setIsProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: "black",
  },
});
