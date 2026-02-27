import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}
// Primary model: gemini-3-pro-image-preview
const GEMINI_API_URL_PRIMARY =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";
// Fallback model: gemini-3.1-flash-image-preview
const GEMINI_API_URL_FALLBACK =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

const GENDER_PROMPTS: Record<string, string> = {
  homme: "a professional male model wearing",
  femme: "a professional female model wearing",
  enfant: "a child model wearing",
  groupe: "a diverse group of people wearing",
  famille: "a happy family (parents and children) wearing",
  couple: "a couple wearing matching",
  unisexe: "a unisex model wearing",
  sport: "athletes or sports team members wearing",
  corporate: "professional business people wearing",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designImageBase64, gender, customPrompt } = body;

    if (!designImageBase64) {
      return NextResponse.json(
        { error: "Design image is required" },
        { status: 400 },
      );
    }

    if (!gender) {
      return NextResponse.json(
        { error: "Gender option is required" },
        { status: 400 },
      );
    }

    // Validate custom prompt if custom option is selected
    if (gender === "custom") {
      if (!customPrompt || customPrompt.trim().length === 0) {
        return NextResponse.json(
          { error: "Custom prompt is required when selecting custom option" },
          { status: 400 },
        );
      }
      if (customPrompt.length > 200) {
        return NextResponse.json(
          { error: "Custom prompt must be 200 characters or less" },
          { status: 400 },
        );
      }
    } else if (!GENDER_PROMPTS[gender]) {
      return NextResponse.json(
        { error: "Valid gender option is required" },
        { status: 400 },
      );
    }

    // Clean base64 string - remove data URL prefix if present
    const base64Data = designImageBase64.includes(",")
      ? designImageBase64.split(",")[1]
      : designImageBase64;

    // Sanitize custom prompt to prevent injection
    const sanitizePrompt = (input: string): string => {
      // Remove potentially dangerous characters and limit length
      return input
        .trim()
        .slice(0, 200) // Already validated, but extra safety
        .replace(/[<>{}[\]\\]/g, "") // Remove brackets and backslashes
        .replace(/\n/g, " ") // Replace newlines with spaces
        .replace(/\s+/g, " ") // Collapse multiple spaces
        .trim();
    };

    // Build prompt for image editing
    let prompt: string;

    if (gender === "custom" && customPrompt) {
      // Sanitize the custom prompt before using it
      const sanitizedPrompt = sanitizePrompt(customPrompt);
      prompt = `The user has asked for a custom design. Their request is: ${sanitizedPrompt}. The t-shirt should have the custom design shown on both front and back. High quality product photography, professional lighting, clean background, realistic fabric texture, detailed mockup. The design should be clearly visible and well-integrated into the garment. Generate a unique variation with different pose, angle, and setting. Use everything in the images. DO NOT REMOVE ANYTHING FROM THEM EVEN IF IT SEEMS LIKE A FAULT`;
    } else {
      // Use predefined prompt
      prompt = `${GENDER_PROMPTS[gender]} a t-shirt with the custom design shown on both front and back. High quality product photography, professional lighting, clean background, realistic fabric texture, detailed mockup. The design should be clearly visible and well-integrated into the garment. Generate a unique variation with different pose, angle, and setting. Use everything in the images. DO NOT REMOVE ANYTHING FROM THEM EVEN IF IT SEEMS LIKE A FAULT`;
    }

    console.log("\n=== Starting Mockup Generation ===");
    console.log("Gender:", gender);
    console.log("Prompt:", prompt);
    console.log("Base64 data length:", base64Data.length);
    console.log("Base64 preview:", base64Data.substring(0, 50) + "...");

    // Use Gemini API for image editing (text-and-image-to-image)
    // Format: contents with parts array containing text and inline_data
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: "image/png",
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    console.log("Request body structure:", {
      hasContents: !!requestBody.contents,
      contentsLength: requestBody.contents.length,
      firstContentParts: requestBody.contents[0]?.parts?.length,
      partsTypes: requestBody.contents[0]?.parts?.map((p: any) =>
        Object.keys(p),
      ),
    });

    // Helper function to generate a single image with retry and fallback
    const generateSingleImage = async (
      imageIndex: number,
      attempt: number = 1,
      useFallback: boolean = false,
    ): Promise<string | null> => {
      const apiUrl = useFallback
        ? GEMINI_API_URL_FALLBACK
        : GEMINI_API_URL_PRIMARY;
      const modelName = useFallback
        ? "gemini-3.1-flash-image-preview"
        : "gemini-3.1-flash-image-preview";

      try {
        console.log(
          `\n=== API Call ${imageIndex + 1} (Attempt ${attempt}, Model: ${modelName}) ===`,
        );

        const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log("Status:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(
            `Gemini API error (${response.status}): ${errorText}`,
          );
        }

        const data = await response.json();
        console.log("Response received, parsing...");

        // Extract image from response
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];

          if (
            candidate.content &&
            candidate.content.parts &&
            candidate.content.parts.length > 0
          ) {
            const parts = candidate.content.parts;

            // Look for inlineData (camelCase) or inline_data (snake_case) with image
            const imagePart = parts.find(
              (part: any) => part.inlineData || part.inline_data,
            );
            if (imagePart) {
              const inlineData = imagePart.inlineData || imagePart.inline_data;
              if (inlineData && inlineData.data) {
                const mimeType =
                  inlineData.mimeType || inlineData.mime_type || "image/jpeg";
                console.log(
                  `✓ Found image in part! MIME type: ${mimeType}, Data length: ${inlineData.data?.length}`,
                );
                return `data:${mimeType};base64,${inlineData.data}`;
              }
            }

            // Check for finishReason issues
            if (candidate.finishReason === "MAX_TOKENS") {
              console.log("⚠ MAX_TOKENS reached - response truncated");
            }
          }
        }

        throw new Error("No image found in Gemini response");
      } catch (error) {
        console.error(
          `Error generating image ${imageIndex + 1} (attempt ${attempt}):`,
          error,
        );

        // Retry logic: up to 3 attempts
        if (attempt < 3) {
          // If first attempt failed and we haven't tried fallback, try fallback on next attempt
          if (attempt === 1 && !useFallback) {
            console.log(
              `Retrying image ${imageIndex + 1} with fallback model (gemini-3.1-flash-image-preview)...`,
            );
            return generateSingleImage(imageIndex, attempt + 1, true);
          } else {
            // Retry with same model
            console.log(
              `Retrying image ${imageIndex + 1} (attempt ${attempt + 1})...`,
            );
            return generateSingleImage(imageIndex, attempt + 1, useFallback);
          }
        } else {
          // All retries failed
          console.error(
            `Failed to generate image ${imageIndex + 1} after ${attempt} attempts`,
          );
          return null;
        }
      }
    };

    // Generate 4 images in parallel, but handle failures gracefully
    const imagePromises = Array.from({ length: 4 }, (_, i) =>
      generateSingleImage(i, 1, false),
    );

    // Wait for all images (some may be null if they failed)
    const results = await Promise.all(imagePromises);

    // Filter out null values (failed generations)
    let imageUrls = results.filter(
      (url): url is string => url !== null && typeof url === "string",
    );

    console.log(`\n=== Generation Summary ===`);
    console.log(`Successfully generated: ${imageUrls.length} out of 4 images`);

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "No images were generated successfully after all retries" },
        { status: 500 },
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
    console.error("Error generating mockups:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
