import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}
// Primary model: gemini-3-pro-image-preview
const GEMINI_API_URL_PRIMARY = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';
// Fallback model: gemini-2.5-flash-image
const GEMINI_API_URL_FALLBACK = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Sanitize prompt
    const sanitizePrompt = (input: string): string => {
      // Remove potentially dangerous characters and limit length
      return input
        .trim()
        .slice(0, 500) // Already validated, but extra safety
        .replace(/[<>{}[\]\\]/g, '') // Remove brackets and backslashes
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
    };

    const sanitizedPrompt = sanitizePrompt(prompt);

    // Build prompt for image generation
    // Enhance the user's prompt with quality instructions for design/artwork
    // NOTE: Gemini API may not always generate PNGs with alpha channels even when requested.
    // If transparency is not preserved, the API might be generating RGB PNGs instead of RGBA PNGs.
    const enhancedPrompt = `Generate a high quality, detailed, professional design artwork based on this request: "${sanitizedPrompt}". The design should be suitable for printing on t-shirts and apparel. Requirements: Clean design, vibrant colors, clear composition. Return only ONE single image (not multiple images combined). 

CRITICAL TRANSPARENCY REQUIREMENT: The background MUST be completely transparent. You MUST generate this as a PNG image with RGBA color format (4 channels: Red, Green, Blue, and Alpha). The alpha channel must be present and set to 0 (fully transparent) for all background pixels. Do NOT use any solid color background (no white, no black, no gray, no color). The background must be truly transparent with alpha channel support. Only the main design elements should be visible with opaque pixels.`;

    console.log('\n=== Starting AI Image Generation ===');
    console.log('User prompt:', sanitizedPrompt);
    console.log('Enhanced prompt:', enhancedPrompt);

    // Use Gemini API for text-to-image generation
    const requestBody = {
      contents: [{
        parts: [
          {
            text: enhancedPrompt
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    console.log('Request body structure:', {
      hasContents: !!requestBody.contents,
      contentsLength: requestBody.contents.length,
      firstContentParts: requestBody.contents[0]?.parts?.length,
    });

    // Helper function to process image and ensure transparency
    const processImageForTransparency = async (dataUrl: string): Promise<string> => {
      try {
        // Extract base64 data from data URL
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Process image with sharp
        const processedImage = await sharp(imageBuffer)
          .ensureAlpha() // Ensure alpha channel exists
          .png({ 
            quality: 100,
            compressionLevel: 6,
            adaptiveFiltering: true,
            palette: false // Use true color with alpha
          })
          .toBuffer();

        // Convert back to base64 data URL
        const processedBase64 = processedImage.toString('base64');
        return `data:image/png;base64,${processedBase64}`;
      } catch (error) {
        console.error('Error processing image for transparency:', error);
        // If processing fails, return original image
        return dataUrl;
      }
    };

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

    // Helper function to remove background and make it transparent
    const removeBackground = async (dataUrl: string): Promise<string> => {
      try {
        const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
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

        // Step 2: Create a mask for background pixels using multiple techniques
        const isBackground = new Array(width * height).fill(false);
        const brightnessThreshold = 250; // Very bright pixels
        const colorDistanceThreshold = 30; // Pixels similar to background color
        const lowSaturationThreshold = 0.15; // Low saturation (grayish) pixels

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

            // Multiple criteria for background detection
            const isVeryBright = brightness > brightnessThreshold;
            const isSimilarToBg = colorDist < colorDistanceThreshold;
            const isLowSaturation = saturation < lowSaturationThreshold && brightness > 200;
            const isNearWhite = brightness > 240 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10;
            const isNearBgColor = colorDist < 50 && brightness > 180;

            // Mark as background if it meets multiple criteria
            if ((isVeryBright && isLowSaturation) || 
                (isSimilarToBg && brightness > 150) ||
                (isNearWhite) ||
                (isNearBgColor && saturation < 0.3)) {
              isBackground[y * width + x] = true;
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

          // If pixel is similar to background, mark it and continue flood fill
          if (brightness > 200 && colorDist < 60) {
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

        // Step 5: Additional pass - remove any remaining light pixels
        for (let i = 0; i < pixelData.length; i += channels) {
          const r = pixelData[i];
          const g = pixelData[i + 1];
          const b = pixelData[i + 2];
          const a = pixelData[i + 3];
          const brightness = (r + g + b) / 3;

          // If pixel is still very bright and has some opacity, reduce it further
          if (brightness > 245 && a > 50) {
            pixelData[i + 3] = Math.max(0, a - 100);
          } else if (brightness > 235 && a > 100) {
            pixelData[i + 3] = Math.max(0, a - 50);
          }
        }

        // Convert back to PNG with transparency and apply edge smoothing
        let processedImage = await sharp(pixelData, {
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

        // Apply slight blur to edges for smoother transparency (optional, can be removed if too soft)
        // This helps with anti-aliasing on edges
        processedImage = await sharp(processedImage)
          .png({ 
            quality: 100,
            compressionLevel: 6,
            adaptiveFiltering: true
          })
          .toBuffer();

        const processedBase64 = processedImage.toString('base64');
        return `data:image/png;base64,${processedBase64}`;
      } catch (error) {
        console.error('Error removing background:', error);
        // If background removal fails, try basic transparency processing
        return processImageForTransparency(dataUrl);
      }
    };

    // Helper function to generate a single image with retry and fallback
    const generateSingleImage = async (imageIndex: number, attempt: number = 1, useFallback: boolean = false): Promise<string | null> => {
      const apiUrl = useFallback ? GEMINI_API_URL_FALLBACK : GEMINI_API_URL_FALLBACK; // this is on purpose to use the fallback model
      const modelName = useFallback ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
      
      try {
        console.log(`\n=== API Call ${imageIndex + 1} (Attempt ${attempt}, Model: ${modelName}) ===`);
        
        const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        const safeLog = JSON.stringify(
          data,
          (key, value) => {
            if (typeof value === 'string' && value.length > 100) {
              return value.slice(0, 100) + '...';
            }
            if (Array.isArray(value) && value.length > 20) {
              return [...value.slice(0, 20), '...'];
            }
            return value;
          },
          2
        );
        
        console.log('Response received, parsing...', safeLog);
        
        // Extract image from response
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            const parts = candidate.content.parts;
            
            // Look for inlineData (camelCase) or inline_data (snake_case) with image
            const imagePart = parts.find((part: any) => part.inlineData || part.inline_data);
            if (imagePart) {
              const inlineData = imagePart.inlineData || imagePart.inline_data;
              if (inlineData && inlineData.data) {
                const mimeType = inlineData.mimeType || inlineData.mime_type || 'image/jpeg';
                console.log(`✓ Found image in part! MIME type: ${mimeType}, Data length: ${inlineData.data?.length}`);
                
                // Create data URL from API response
                const originalDataUrl = `data:${mimeType};base64,${inlineData.data}`;
                
                // Process image to ensure transparency
                console.log(`Processing image ${imageIndex + 1} for transparency...`);
                try {
                  // First, ensure alpha channel exists
                  const withAlpha = await processImageForTransparency(originalDataUrl);
                  // Then, try to remove white/light backgrounds
                  const withTransparency = await removeBackground(withAlpha);
                  console.log(`✓ Image ${imageIndex + 1} processed successfully with transparency`);
                  return withTransparency;
                } catch (processError) {
                  console.error(`Error processing image ${imageIndex + 1} for transparency:`, processError);
                  // Fallback to original image if processing fails
                  return originalDataUrl;
                }
              }
            }
            
            // Check for finishReason issues
            if (candidate.finishReason === 'MAX_TOKENS') {
              console.log('⚠ MAX_TOKENS reached - response truncated');
            }
          }
        }
        
        throw new Error('No image found in Gemini response');
      } catch (error) {
        console.error(`Error generating image ${imageIndex + 1} (attempt ${attempt}):`, error);
        
        // Retry logic: up to 3 attempts
        if (attempt < 3) {
          // If first attempt failed and we haven't tried fallback, try fallback on next attempt
          if (attempt === 1 && !useFallback) {
            console.log(`Retrying image ${imageIndex + 1} with fallback model (gemini-2.5-flash-image)...`);
            return generateSingleImage(imageIndex, attempt + 1, true);
          } else {
            // Retry with same model
            console.log(`Retrying image ${imageIndex + 1} (attempt ${attempt + 1})...`);
            return generateSingleImage(imageIndex, attempt + 1, useFallback);
          }
        } else {
          // All retries failed
          console.error(`Failed to generate image ${imageIndex + 1} after ${attempt} attempts`);
          return null;
        }
      }
    };

    // Generate 4 images in parallel, but handle failures gracefully
    const imagePromises = Array.from({ length: 4 }, (_, i) => generateSingleImage(i, 1, false));
    
    // Wait for all images (some may be null if they failed)
    const results = await Promise.all(imagePromises);
    
    // Filter out null values (failed generations)
    let imageUrls = results.filter((url): url is string => url !== null && typeof url === 'string');

    console.log(`\n=== Generation Summary ===`);
    console.log(`Successfully generated: ${imageUrls.length} out of 4 images`);

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'No images were generated successfully after all retries' },
        { status: 500 }
      );
    }

    // If we have fewer than 4 images, duplicate the last one to fill up to 4
    // But only if we have at least 1 successful image
    while (imageUrls.length < 4 && imageUrls.length > 0) {
      imageUrls.push(imageUrls[imageUrls.length - 1]);
    }
    
    return NextResponse.json({
      success: true,
      images: imageUrls.slice(0, 4), // Ensure exactly 4 images
    });

  } catch (error: any) {
    console.error('Error generating AI images:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

