import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ImageEditor from "@react-native-community/image-editor";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { decode } from "base64-arraybuffer";
import jpeg from "jpeg-js";
import { TensorflowModel } from "react-native-fast-tflite";
import RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";

export interface BoundingBox {
  x: number; // Top-Left X (in pixels)
  y: number; // Top-Left Y (in pixels)
  width: number; // Width (in pixels)
  height: number; // Height (in pixels)
}

export interface Detection {
  classIndex: number; // 0 to 4
  score: number; // 0.0 to 1.0
  box: BoundingBox;
}

/**
 * Calculates Intersection over Union (IoU) between two boxes.
 * Used to determine if two detections refer to the same object.
 */
function calculateIoU(boxA: BoundingBox, boxB: BoundingBox): number {
  const x1 = Math.max(boxA.x, boxB.x);
  const y1 = Math.max(boxA.y, boxB.y);
  const x2 = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const y2 = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const intersectionWidth = Math.max(0, x2 - x1);
  const intersectionHeight = Math.max(0, y2 - y1);
  const intersectionArea = intersectionWidth * intersectionHeight;

  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;

  const unionArea = boxAArea + boxBArea - intersectionArea;

  return unionArea === 0 ? 0 : intersectionArea / unionArea;
}

function nonMaxSuppression(
  detections: Detection[],
  iouThreshold: number,
): Detection[] {
  // 1. Sort by score (descending) so we start with the "best" candidates
  const sorted = detections.sort((a, b) => b.score - a.score);

  const results: Detection[] = [];
  const active = new Array(sorted.length).fill(true);

  for (let i = 0; i < sorted.length; i++) {
    if (!active[i]) continue;

    // Pick the current best box
    const best = sorted[i];
    results.push(best);

    // Compare it with all subsequent boxes
    for (let j = i + 1; j < sorted.length; j++) {
      if (!active[j]) continue;

      const other = sorted[j];
      const iou = calculateIoU(best.box, other.box);

      // If they overlap significantly, suppress the lower-score one
      if (iou > iouThreshold && best.classIndex === other.classIndex) {
        active[j] = false;
      }
    }
  }

  return results;
}

/**
 * Processes the raw YOLOv12 output buffer into final detections.
 * * @param data - The Float32Array of size 75600
 * @param imgWidth - The original image width (e.g. 307)
 * @param imgHeight - The original image height (e.g. 640)
 * @param confThreshold - Minimum score to consider a box (default 0.25)
 * @param iouThreshold - IoU threshold for NMS (default 0.45)
 */
export function getFinalCandidates(
  data: Float32Array,
  imgWidth: number,
  imgHeight: number,
  confThreshold: number = 0.25,
  iouThreshold: number = 0.45,
): Detection[] {
  const NUM_ANCHORS = 8400;
  // We know there are 5 classes because 9 channels - 4 coords = 5
  const NUM_CLASSES = 5;
  const MODEL_SIZE = 640;

  // Pre-calculate scaling factors for "Un-Letterboxing"
  // This maps the 640x640 model space back to your 307x640 image
  const scale = Math.min(MODEL_SIZE / imgWidth, MODEL_SIZE / imgHeight);
  const padX = (MODEL_SIZE - imgWidth * scale) / 2;
  const padY = (MODEL_SIZE - imgHeight * scale) / 2;

  const candidates: Detection[] = [];

  for (let i = 0; i < NUM_ANCHORS; i++) {
    // 1. Find the highest class score for this anchor
    // Class scores are at indices 4, 5, 6, 7, 8.
    // Stride is 8400.
    let maxScore = -Infinity;
    let classIndex = -1;

    for (let c = 0; c < NUM_CLASSES; c++) {
      // (Channel * Stride) + AnchorIndex
      const score = data[(4 + c) * NUM_ANCHORS + i];
      if (score > maxScore) {
        maxScore = score;
        classIndex = c;
      }
    }

    // 2. Threshold filter
    if (maxScore > confThreshold) {
      // 3. Extract Box Coordinates
      // Note: These are usually center-x, center-y, width, height
      const cx = data[0 * NUM_ANCHORS + i];
      const cy = data[1 * NUM_ANCHORS + i];
      const w = data[2 * NUM_ANCHORS + i];
      const h = data[3 * NUM_ANCHORS + i];

      // 4. Convert to Pixels (in 640x640 space)
      // If your model outputs 0-1 normalized coords, multiply by MODEL_SIZE.
      // (Most Ultralytics TFLite exports are normalized 0-1)
      const cxPx = cx * MODEL_SIZE;
      const cyPx = cy * MODEL_SIZE;
      const wPx = w * MODEL_SIZE;
      const hPx = h * MODEL_SIZE;

      // 5. Un-Letterbox: Map from 640x640 back to Source Image Coords
      // Subtract padding, then divide by scale
      const xTopLeft = (cxPx - wPx / 2 - padX) / scale;
      const yTopLeft = (cyPx - hPx / 2 - padY) / scale;
      const boxWidth = wPx / scale;
      const boxHeight = hPx / scale;

      candidates.push({
        classIndex,
        score: maxScore,
        box: {
          x: xTopLeft,
          y: yTopLeft,
          width: boxWidth,
          height: boxHeight,
        },
      });
    }
  }

  // 6. Perform NMS
  return nonMaxSuppression(candidates, iouThreshold);
}

export async function getRawBytes(fileUri: string): Promise<{
  pixels: Uint8Array;
  width: number;
  height: number;
  channels: number;
}> {
  const base64 = await RNFS.readFile(fileUri, "base64");
  const arrayBuffer = decode(base64);
  const uint8 = new Uint8Array(arrayBuffer);

  const decoded = jpeg.decode(uint8, {
    colorTransform: false,
    useTArray: true,
    formatAsRGBA: false,
  });

  const channels =
    (decoded &&
      decoded.data &&
      decoded.data.length / (decoded.width * decoded.height)) ||
    4;

  // if it's RGBA, keep as-is; we'll drop alpha later when forming model tensor
  return {
    pixels:
      decoded.data instanceof Uint8Array
        ? decoded.data
        : new Uint8Array(decoded.data),
    width: decoded.width,
    height: decoded.height,
    channels: channels,
  };
}

function letterboxImage(
  sourcePixels: Uint8Array, // Your decoded image data (RGB or RGBA)
  srcWidth: number,
  srcHeight: number,
  srcChannels: number = 3,
  modelSize: number = 640,
): Float32Array {
  // 1. Initialize the Target Buffer
  // Size: 640 * 640 * 3 channels (R, G, B)
  const float32Tensor = new Float32Array(modelSize * modelSize * 3);

  // 2. Fill the ENTIRE buffer with the "Grey" padding color first
  // YOLO typically uses 114/255.0 as the neutral padding color
  const paddingColor = 114.0 / 255.0;
  float32Tensor.fill(paddingColor);

  // 3. Calculate Padding Offsets
  // We want to center the 307x640 image inside the 640x640 box
  // Scale is usually 1 if you already resized it using 'contain'
  const scale = Math.min(modelSize / srcWidth, modelSize / srcHeight);

  const newW = Math.round(srcWidth * scale);
  const newH = Math.round(srcHeight * scale);

  // Calculate where the image should start (the "gap")
  const padX = Math.floor((modelSize - newW) / 2);
  const padY = Math.floor((modelSize - newH) / 2);

  // 4. Copy Pixels Row by Row
  // Validate source buffer length to prevent out-of-bounds reads which produce NaNs
  const expectedLen = srcWidth * srcHeight * srcChannels;
  if (sourcePixels.length < expectedLen) {
    throw new Error(
      `sourcePixels length ${sourcePixels.length} is smaller than expected ${expectedLen}`,
    );
  }

  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      // Calculate index in the SOURCE array (the 307x640 image)
      // (y * width + x) * 3 channels
      const srcIdx = (y * srcWidth + x) * srcChannels;

      // Calculate index in the TARGET tensor (the 640x640 box)
      // Note we add padY to y, and padX to x
      const targetIdx = ((y + padY) * modelSize + (x + padX)) * 3;

      // Normalize (0-255 -> 0.0-1.0) and Copy. Support RGBA by ignoring alpha.
      float32Tensor[targetIdx] = sourcePixels[srcIdx] / 255.0;
      float32Tensor[targetIdx + 1] = sourcePixels[srcIdx + 1] / 255.0;
      float32Tensor[targetIdx + 2] = sourcePixels[srcIdx + 2] / 255.0;
    }
  }

  return float32Tensor;
}

const processCropForOCR = async (
  imagePath: string,
  width: number,
  height: number,
) => {
  let finalPath = imagePath;

  // Check if image is too small for ML Kit
  if (width < 32 || height < 32) {
    try {
      // Calculate a scale factor to get both dimensions comfortably above 32
      const scaleFactor = Math.ceil(32 / Math.min(width, height)) * 2;
      const newWidth = width * scaleFactor;
      const newHeight = height * scaleFactor;

      const resizedImage = await ImageResizer.createResizedImage(
        imagePath,
        newWidth,
        newHeight,
        "JPEG",
        100, // quality
      );

      finalPath = resizedImage.uri;
    } catch (err) {
      console.error("Resizing failed", err);
    }
  }

  // Pass the (potentially upscaled) image to ML Kit
  return finalPath;
};

export async function extractText(imagePath: string): Promise<string> {
  const result = await TextRecognition.recognize(imagePath);

  return result.text;
}

type DetectedObject = {
  classId: number;
  croppedPath: string;
};

export async function locatePaymentFields(
  resizedImagePath: string,
  model: TensorflowModel,
  currentWidth: number,
  currentHeight: number,
): Promise<DetectedObject[]> {
  // save resized image for debugging
  await CameraRoll.saveAsset(resizedImagePath, { type: "photo" });

  // Image is already resized to 640x640 by resize plugin
  const resizedImageUri = resizedImagePath.startsWith("file://")
    ? resizedImagePath
    : `file://${resizedImagePath}`;

  // 1. Get raw bytes from resized image
  let float32: Float32Array;
  try {
    const decoded = await getRawBytes(resizedImageUri);
    const srcWidth = decoded.width || currentWidth;
    const srcHeight = decoded.height || currentHeight;
    const srcChannels = decoded.channels || 3;

    float32 = letterboxImage(decoded.pixels, srcWidth, srcHeight, srcChannels);
  } catch (err) {
    console.error("Preparing tensor failed; aborting inference", err);
    return [];
  }

  const outputs = await model.run([float32]);

  const data = outputs[0] as Float32Array;

  const detections = getFinalCandidates(data, 307, 640);

  const detectedObjects: DetectedObject[] = [];

  for (const det of detections) {
    const croppedObject = await cropObject(
      "transactionId",
      resizedImageUri,
      det,
    );

    if (!croppedObject) continue;

    const finalPath = await processCropForOCR(
      croppedObject.normalizedCroppedUri,
      croppedObject.width,
      croppedObject.height,
    );

    detectedObjects.push({
      classId: det.classIndex,
      croppedPath: finalPath,
    });
  }

  return detectedObjects;
}

export async function cropObject(
  transactionId: string,
  imagePath: string,
  detection: Detection,
) {
  const { box, classIndex, score } = detection;

  const cropData = {
    offset: {
      x: box.x,
      y: box.y,
    },
    size: {
      width: box.width,
      height: box.height,
    },
  };

  console.log(
    `Cropping box at [${cropData.offset.x}, ${cropData.offset.y}] with size [${cropData.size.width}x${cropData.size.height}]`,
  );

  try {
    // 2. Ensure a proper file URI
    const fileUri = imagePath.startsWith("file://")
      ? imagePath
      : `file://${imagePath}`;

    // 3. Perform the crop
    let croppedResult = await ImageEditor.cropImage(fileUri, cropData);

    // 4. Handle result (may be string or object depending on version)
    const croppedUri =
      typeof croppedResult === "string" ? croppedResult : croppedResult.uri;

    // 5. Normalize URI and save to gallery
    const normalizedCroppedUri = croppedUri.startsWith("file://")
      ? croppedUri
      : `file://${croppedUri}`;

    await CameraRoll.saveAsset(normalizedCroppedUri, { type: "photo" });

    console.log(
      `Saved cropped image (classId: ${classIndex}, conf: ${score.toFixed(3)})`,
    );

    return { normalizedCroppedUri, ...croppedResult };
  } catch (err) {
    console.error("Crop/Save failed", err);
    return null;
  }
}
