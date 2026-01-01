import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

type Technique = 'conservative' | 'moderate' | 'aggressive';

interface TechniqueConfig {
  brightnessThreshold: number;
  colorDistanceThreshold: number;
  lowSaturationThreshold: number;
  nearWhiteBrightness: number;
  nearBgColorDistance: number;
  nearBgColorBrightness: number;
  floodFillBrightness: number;
  floodFillColorDistance: number;
  finalPassBrightness1: number;
  finalPassBrightness2: number;
  finalPassReduction1: number;
  finalPassReduction2: number;
}

const TECHNIQUE_CONFIGS: Record<Technique, TechniqueConfig> = {
  conservative: {
    brightnessThreshold: 252,        // Only very bright pixels
    colorDistanceThreshold: 20,       // Very close to background color
    lowSaturationThreshold: 0.1,      // Very low saturation
    nearWhiteBrightness: 250,         // Very near white
    nearBgColorDistance: 35,          // Close to background
    nearBgColorBrightness: 200,       // Higher brightness requirement
    floodFillBrightness: 220,          // Higher threshold for flood fill
    floodFillColorDistance: 40,       // Stricter color matching
    finalPassBrightness1: 250,        // Very bright for final pass
    finalPassBrightness2: 245,        // High brightness
    finalPassReduction1: 80,          // Less aggressive reduction
    finalPassReduction2: 40,           // Less aggressive
  },
  moderate: {
    brightnessThreshold: 250,
    colorDistanceThreshold: 30,
    lowSaturationThreshold: 0.15,
    nearWhiteBrightness: 240,
    nearBgColorDistance: 50,
    nearBgColorBrightness: 180,
    floodFillBrightness: 200,
    floodFillColorDistance: 60,
    finalPassBrightness1: 245,
    finalPassBrightness2: 235,
    finalPassReduction1: 100,
    finalPassReduction2: 50,
  },
  aggressive: {
    brightnessThreshold: 245,         // Lower threshold - catches more
    colorDistanceThreshold: 45,       // More lenient color matching
    lowSaturationThreshold: 0.2,      // Higher saturation threshold
    nearWhiteBrightness: 230,          // Lower brightness requirement
    nearBgColorDistance: 70,           // More lenient
    nearBgColorBrightness: 160,       // Lower brightness requirement
    floodFillBrightness: 180,          // Lower threshold
    floodFillColorDistance: 80,        // More lenient
    finalPassBrightness1: 240,        // Lower threshold
    finalPassBrightness2: 230,        // Lower threshold
    finalPassReduction1: 120,          // More aggressive reduction
    finalPassReduction2: 70,           // More aggressive
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageDataUrl, technique = 'moderate' } = body;

    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      return NextResponse.json(
        { error: 'imageDataUrl is required' },
        { status: 400 }
      );
    }

    const validTechnique: Technique = ['conservative', 'moderate', 'aggressive'].includes(technique) 
      ? technique as Technique 
      : 'moderate';
    
    const config = TECHNIQUE_CONFIGS[validTechnique];
    console.log(`Using ${validTechnique} technique for background removal`);

    // Helper function to calculate color distance (Euclidean distance in RGB space)
    const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number => {
      return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    };

    // Helper function to get pixel index
    const getPixelIndex = (x: number, y: number, width: number, channels: number): number => {
      return (y * width + x) * channels;
    };

    // Helper function to detect dominant background color from edges
    const detectBackgroundColor = (pixelData: Uint8ClampedArray, width: number, height: number, channels: number): { r: number; g: number; b: number } => {
      const edgePixels: Array<{ r: number; g: number; b: number }> = [];
      const sampleSize = Math.min(50, Math.floor(width * 0.1)); // Sample from edges

      // Sample from top and bottom edges
      for (let x = 0; x < width; x += Math.max(1, Math.floor(width / sampleSize))) {
        // Top edge
        const topIdx = getPixelIndex(x, 0, width, channels);
        edgePixels.push({
          r: pixelData[topIdx],
          g: pixelData[topIdx + 1],
          b: pixelData[topIdx + 2]
        });
        // Bottom edge
        const bottomIdx = getPixelIndex(x, height - 1, width, channels);
        edgePixels.push({
          r: pixelData[bottomIdx],
          g: pixelData[bottomIdx + 1],
          b: pixelData[bottomIdx + 2]
        });
      }

      // Sample from left and right edges
      for (let y = 0; y < height; y += Math.max(1, Math.floor(height / sampleSize))) {
        // Left edge
        const leftIdx = getPixelIndex(0, y, width, channels);
        edgePixels.push({
          r: pixelData[leftIdx],
          g: pixelData[leftIdx + 1],
          b: pixelData[leftIdx + 2]
        });
        // Right edge
        const rightIdx = getPixelIndex(width - 1, y, width, channels);
        edgePixels.push({
          r: pixelData[rightIdx],
          g: pixelData[rightIdx + 1],
          b: pixelData[rightIdx + 2]
        });
      }

      // Find the most common color (simple clustering)
      const colorCounts = new Map<string, number>();
      edgePixels.forEach(pixel => {
        // Round to nearest 10 to cluster similar colors
        const key = `${Math.floor(pixel.r / 10) * 10},${Math.floor(pixel.g / 10) * 10},${Math.floor(pixel.b / 10) * 10}`;
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
      });

      // Get the most common color
      let maxCount = 0;
      let dominantColor = { r: 255, g: 255, b: 255 }; // Default to white
      colorCounts.forEach((count, key) => {
        if (count > maxCount) {
          maxCount = count;
          const [r, g, b] = key.split(',').map(Number);
          dominantColor = { r, g, b };
        }
      });

      return dominantColor;
    };

    // Extract base64 data from data URL
    const base64Data = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      throw new Error('Invalid image dimensions');
    }

    // Get raw pixel data
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixelData = new Uint8ClampedArray(data);
    const channels = info.channels; // Should be 4 for RGBA after ensureAlpha

    // Step 1: Detect dominant background color from edges
    const bgColor = detectBackgroundColor(pixelData, width, height, channels);
    console.log(`Detected background color: RGB(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);

    // Step 2: Create a mask for background pixels using technique-specific thresholds
    const isBackground = new Array(width * height).fill(false);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = getPixelIndex(x, y, width, channels);
        const r = pixelData[idx];
        const g = pixelData[idx + 1];
        const b = pixelData[idx + 2];
        const a = pixelData[idx + 3] || 255;

        // Calculate various metrics
        const brightness = (r + g + b) / 3;
        const maxColor = Math.max(r, g, b);
        const minColor = Math.min(r, g, b);
        const saturation = maxColor === 0 ? 0 : (maxColor - minColor) / maxColor;
        const colorDist = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b);

        // Multiple criteria for background detection (using technique config)
        const isVeryBright = brightness > config.brightnessThreshold;
        const isSimilarToBg = colorDist < config.colorDistanceThreshold;
        const isLowSaturation = saturation < config.lowSaturationThreshold && brightness > 200;
        const isNearWhite = brightness > config.nearWhiteBrightness && Math.abs(r - g) < 10 && Math.abs(g - b) < 10;
        const isNearBgColor = colorDist < config.nearBgColorDistance && brightness > config.nearBgColorBrightness;

        // Mark as background if it meets criteria (technique-specific logic)
        if (validTechnique === 'conservative') {
          // Conservative: Requires multiple criteria to be true
          if ((isVeryBright && isLowSaturation && isSimilarToBg) || 
              (isNearWhite && isSimilarToBg) ||
              (isNearBgColor && saturation < 0.2 && isLowSaturation)) {
            isBackground[y * width + x] = true;
          }
        } else if (validTechnique === 'moderate') {
          // Moderate: Balanced approach
          if ((isVeryBright && isLowSaturation) || 
              (isSimilarToBg && brightness > 150) ||
              (isNearWhite) ||
              (isNearBgColor && saturation < 0.3)) {
            isBackground[y * width + x] = true;
          }
        } else {
          // Aggressive: More lenient criteria
          if (isVeryBright || 
              (isSimilarToBg && brightness > 140) ||
              (isNearWhite) ||
              (isNearBgColor && saturation < 0.4) ||
              (brightness > 200 && colorDist < config.nearBgColorDistance && saturation < 0.35)) {
            isBackground[y * width + x] = true;
          }
        }
      }
    }

    // Step 3: Flood fill from edges to catch connected background regions
    const visited = new Array(width * height).fill(false);
    const queue: Array<[number, number]> = [];

    // Add edge pixels to queue
    for (let x = 0; x < width; x++) {
      if (isBackground[x]) queue.push([x, 0]);
      if (isBackground[(height - 1) * width + x]) queue.push([x, height - 1]);
    }
    for (let y = 0; y < height; y++) {
      if (isBackground[y * width]) queue.push([0, y]);
      if (isBackground[y * width + width - 1]) queue.push([width - 1, y]);
    }

    // Flood fill
    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      const idx = y * width + x;
      
      if (visited[idx] || x < 0 || x >= width || y < 0 || y >= height) continue;
      visited[idx] = true;

      const pixelIdx = getPixelIndex(x, y, width, channels);
      const r = pixelData[pixelIdx];
      const g = pixelData[pixelIdx + 1];
      const b = pixelData[pixelIdx + 2];
      const brightness = (r + g + b) / 3;
      const colorDist = colorDistance(r, g, b, bgColor.r, bgColor.g, bgColor.b);

      // If pixel is similar to background, mark it and continue flood fill (using technique config)
      if (brightness > config.floodFillBrightness && colorDist < config.floodFillColorDistance) {
        isBackground[idx] = true;
        // Add neighbors to queue
        [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].forEach(([nx, ny]) => {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny * width + nx]) {
            queue.push([nx, ny]);
          }
        });
      }
    }

    // Step 4: Apply transparency with smooth edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = getPixelIndex(x, y, width, channels);
        const isBg = isBackground[y * width + x];

        if (isBg) {
          // Check neighbors for edge detection (anti-aliasing)
          let edgeNeighbors = 0;
          let totalNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                totalNeighbors++;
                if (!isBackground[ny * width + nx]) {
                  edgeNeighbors++;
                }
              }
            }
          }

          // If on edge, use partial transparency for smooth edges
          if (edgeNeighbors > 0) {
            const edgeRatio = edgeNeighbors / totalNeighbors;
            pixelData[idx + 3] = Math.floor((1 - edgeRatio) * 255);
          } else {
            // Fully transparent for solid background
            pixelData[idx + 3] = 0;
          }
        }
      }
    }

    // Step 5: Additional pass - remove any remaining light pixels (using technique config)
    for (let i = 0; i < pixelData.length; i += channels) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const a = pixelData[i + 3];
      const brightness = (r + g + b) / 3;

      // If pixel is still very bright and has some opacity, reduce it further
      if (brightness > config.finalPassBrightness1 && a > 50) {
        pixelData[i + 3] = Math.max(0, a - config.finalPassReduction1);
      } else if (brightness > config.finalPassBrightness2 && a > 100) {
        pixelData[i + 3] = Math.max(0, a - config.finalPassReduction2);
      }
    }

    // Convert back to PNG with transparency
    const processedImage = await sharp(pixelData, {
      raw: {
        width: width,
        height: height,
        channels: channels
      }
    })
      .png({ 
        quality: 100,
        compressionLevel: 6,
        adaptiveFiltering: true
      })
      .toBuffer();

    const processedBase64 = processedImage.toString('base64');
    const processedDataUrl = `data:image/png;base64,${processedBase64}`;

    return NextResponse.json({
      success: true,
      imageDataUrl: processedDataUrl
    });

  } catch (error: any) {
    console.error('Error removing background:', error);
    return NextResponse.json(
      { error: 'Failed to remove background', details: error.message },
      { status: 500 }
    );
  }
}

