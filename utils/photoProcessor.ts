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

export function letterboxImage(
  sourcePixels: Uint8Array,
  srcWidth: number, // Original Image Width
  srcHeight: number, // Original Image Height
  srcChannels: number = 4, // Default changed to 4 based on your debug findings
  modelSize: number = 640,
  // Cropping parameters
  cropY: number = 0, // Where to start slicing Y
  cropHeight: number | null = null, // How tall the slice is
): Float32Array {
  const actualCropHeight = cropHeight ?? srcHeight;

  // 1. Target Buffer (640x640 RGB)
  const float32Tensor = new Float32Array(modelSize * modelSize * 3);
  float32Tensor.fill(114.0 / 255.0); // Padding color (standard YOLO gray)

  // 2. Calculate Scale based on the CROP
  const scale = Math.min(modelSize / srcWidth, modelSize / actualCropHeight);

  const newW = Math.round(srcWidth * scale);
  const newH = Math.round(actualCropHeight * scale);

  const padX = Math.floor((modelSize - newW) / 2);
  const padY = Math.floor((modelSize - newH) / 2);

  // 3. Copy Pixels
  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      // MAPPING LOGIC:
      // Map target pixel (x,y) back to source pixel (srcX, srcY)
      const srcXraw = Math.floor(x / scale);
      const srcYraw = Math.floor(y / scale) + cropY;

      // SAFETY CHECK: Clamp coordinates to valid image bounds
      // This prevents "index out of range" errors if rounding is slightly off
      const safeX = Math.min(Math.max(srcXraw, 0), srcWidth - 1);
      const safeY = Math.min(Math.max(srcYraw, 0), srcHeight - 1);

      // Calculate index in the source array
      // We rely on srcChannels=4 here to step through the buffer correctly
      const srcIdx = (safeY * srcWidth + safeX) * srcChannels;
      const targetIdx = ((y + padY) * modelSize + (x + padX)) * 3;

      // READ RAW PIXELS
      const p1 = sourcePixels[srcIdx]; // Channel 1
      const p2 = sourcePixels[srcIdx + 1]; // Channel 2
      const p3 = sourcePixels[srcIdx + 2]; // Channel 3

      // --- THE FIX: ROBUST GRAYSCALE ---
      // We take the MAX of the channels.
      // - If background is Green (0, 255, 0), max is 255 (White).
      // - If background is White (255, 255, 255), max is 255 (White).
      // - If text is Black (30, 30, 30), max is 30 (Dark Gray).
      // This standardizes the input so the model sees black text on white background.
      const maxVal = Math.max(p1, p2, p3);
      const normalized = maxVal / 255.0;

      // Fill R, G, B with the same grayscale value
      float32Tensor[targetIdx] = normalized;
      float32Tensor[targetIdx + 1] = normalized;
      float32Tensor[targetIdx + 2] = normalized;
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
  confidence: number;
};

export async function locatePaymentFields(
  originalImagePath: string, // MUST be the high-res image (not 640x640)
  model: TensorflowModel,
  // remove currentWidth/Height args -> we should trust the decoder
): Promise<DetectedObject[]> {
  // 1. Get raw bytes from the High-Res image
  let pixels: Uint8Array;
  let srcWidth: number;
  let srcHeight: number;
  let srcChannels: number;

  try {
    const decoded = await getRawBytes(originalImagePath);
    pixels = decoded.pixels;
    srcWidth = decoded.width;
    srcHeight = decoded.height;
    srcChannels = decoded.channels || 3;
  } catch (err) {
    console.error("Image decoding failed", err);
    return [];
  }

  // Configuration: 20% Overlap between tiles
  const OVERLAP = 0.2;

  // Define Split Points
  // Tile 1 Height: 60% of image
  const topTileHeight = Math.floor(srcHeight * (0.5 + OVERLAP / 2));

  // Tile 2 Start Y: 40% of image
  const bottomTileY = Math.floor(srcHeight * (0.5 - OVERLAP / 2));
  const bottomTileHeight = srcHeight - bottomTileY;

  // PASS 1: TOP TILE (0 to ~60%)
  const tensorTop = letterboxImage(
    pixels,
    srcWidth,
    srcHeight,
    srcChannels,
    640,
    0, // cropY
    topTileHeight, // cropHeight
  );

  const outputTop = await model.run([tensorTop]);

  // tell the parser we processed an image of size [srcWidth x topTileHeight]
  const detsTop = getFinalCandidates(
    outputTop[0] as Float32Array,
    srcWidth,
    topTileHeight,
  );

  // PASS 2: BOTTOM TILE (~40% to 100%)
  const tensorBottom = letterboxImage(
    pixels,
    srcWidth,
    srcHeight,
    srcChannels,
    640,
    bottomTileY, // cropY
    bottomTileHeight, // cropHeight
  );

  const outputBottom = await model.run([tensorBottom]);

  const detsBottom = getFinalCandidates(
    outputBottom[0] as Float32Array,
    srcWidth,
    bottomTileHeight,
    0.4,
  );

  // 1. Adjust Bottom Detections
  // The model returned Y coords relative to the cut. Add the global offset.
  const detsBottomAdjusted = detsBottom.map((d) => ({
    ...d,
    box: {
      ...d.box,
      y: d.box.y + bottomTileY,
    },
  }));

  // 2. Combine
  const allCandidates = [...detsTop, ...detsBottomAdjusted];

  // 3. Final NMS (Removes duplicates in the overlap zone)
  // If "Amount" is detected in both tiles, the one with higher confidence wins.
  const finalDetections = nonMaxSuppression(allCandidates, 0.5);

  // ---------------------------------------------------------
  // CROP & OCR PREP
  // ---------------------------------------------------------
  const detectedObjects: DetectedObject[] = [];

  for (const det of finalDetections) {
    // Note: cropObject must handle the FULL High-Res image URI
    const croppedObject = await cropObject(
      "transaction_field",
      originalImagePath,
      det,
    );

    if (!croppedObject) continue;

    const finalPath = await processCropForOCR(
      croppedObject.normalizedCroppedUri,
      croppedObject.width,
      croppedObject.height,
    );

    const existingObject = detectedObjects.find(
      (obj) => obj.classId === det.classIndex,
    );

    // If we already have a detection for this class, only keep the one with higher confidence
    if (existingObject) {
      if (det.score > existingObject.confidence) {
        existingObject.croppedPath = finalPath;
        existingObject.confidence = det.score;
      }
      continue; // Skip adding a new entry since we already have one for this class
    }

    detectedObjects.push({
      classId: det.classIndex,
      croppedPath: finalPath,
      confidence: det.score,
    });
  }

  return detectedObjects;
}

export async function cropObject(
  transactionId: string,
  imagePath: string,
  detection: Detection,
) {
  const { box } = detection;

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

    // 5. Normalize URI
    const normalizedCroppedUri = croppedUri.startsWith("file://")
      ? croppedUri
      : `file://${croppedUri}`;

    return { normalizedCroppedUri, ...croppedResult };
  } catch (err) {
    return null;
  }
}
