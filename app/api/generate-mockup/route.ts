import { NextRequest, NextResponse } from 'next/server';

const NANO_BANANA_API_KEY = 'AIzaSyDOz1X0L9gPVkiELnH1OYVpn_1yqXieho4';
const NANO_BANANA_API_URL = 'https://gateway.nanobananapro.site/api/v1/images/generate';

type GenderOption = {
  id: string;
  label: string;
  prompt: string;
};

const GENDER_PROMPTS: Record<string, string> = {
  homme: 'a professional male model wearing',
  femme: 'a professional female model wearing',
  enfant: 'a child model wearing',
  groupe: 'a diverse group of people wearing',
  famille: 'a happy family (parents and children) wearing',
  couple: 'a couple wearing matching',
  unisexe: 'a unisex model wearing',
  sport: 'athletes or sports team members wearing',
  corporate: 'professional business people wearing',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designImageBase64, gender } = body;

    if (!designImageBase64) {
      return NextResponse.json(
        { error: 'Design image is required' },
        { status: 400 }
      );
    }

    if (!gender || !GENDER_PROMPTS[gender]) {
      return NextResponse.json(
        { error: 'Valid gender option is required' },
        { status: 400 }
      );
    }

    // Clean base64 string
    const base64Data = designImageBase64.includes(',')
      ? designImageBase64.split(',')[1]
      : designImageBase64;

    // Build prompt
    const prompt = `${GENDER_PROMPTS[gender]} a t-shirt with the custom design shown on both front and back. High quality product photography, professional lighting, clean background, realistic fabric texture, detailed mockup. The design should be clearly visible and well-integrated into the garment.`;

    // Try JSON format first (most common for image generation APIs)
    const requestBody = {
      model: 'nano-banana-pro-v3',
      prompt: prompt,
      image_input: designImageBase64, // Send full data URL
      resolution: '2K',
      aspect_ratio: '1:1',
      num_images: 4,
    };

    // Call Nano Banana Pro API
    let response;
    try {
      response = await fetch(NANO_BANANA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      // If JSON fails, try FormData format
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: 'image/png' });
      formData.append('image_input', blob, 'design.png');
      formData.append('model', 'nano-banana-pro-v3');
      formData.append('prompt', prompt);
      formData.append('resolution', '2K');
      formData.append('aspect_ratio', '1:1');
      formData.append('num_images', '4');

      response = await fetch(NANO_BANANA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
        },
        body: formData,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nano Banana API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate mockups', details: errorText },
        { status: response.status }
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      console.error('Failed to parse API response:', text);
      return NextResponse.json(
        { error: 'Invalid response from API', details: text },
        { status: 500 }
      );
    }

    // Extract image URLs from response
    // The API response structure may vary, so we'll handle different formats
    let imageUrls: string[] = [];
    
    if (data.images && Array.isArray(data.images)) {
      imageUrls = data.images.filter((url: any) => url && typeof url === 'string');
    } else if (data.data && Array.isArray(data.data)) {
      imageUrls = data.data
        .map((item: any) => item.url || item.image || item)
        .filter((url: any) => url && typeof url === 'string');
    } else if (data.url && typeof data.url === 'string') {
      imageUrls = [data.url];
    } else if (Array.isArray(data)) {
      imageUrls = data.filter((item: any) => {
        if (typeof item === 'string') return item;
        return item.url || item.image;
      }).map((item: any) => typeof item === 'string' ? item : (item.url || item.image));
    } else if (typeof data === 'string') {
      imageUrls = [data];
    }
    
    console.log('Extracted image URLs:', imageUrls.length);

    // If we don't get 4 images, try to generate more or duplicate
    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'No images returned from API', response: data },
        { status: 500 }
      );
    }

    // If we have fewer than 4 images, duplicate the last one to fill up to 4
    while (imageUrls.length < 4 && imageUrls.length > 0) {
      imageUrls.push(imageUrls[imageUrls.length - 1]);
    }

    return NextResponse.json({
      success: true,
      images: imageUrls.slice(0, 4), // Ensure exactly 4 images
    });
  } catch (error: any) {
    console.error('Error generating mockups:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

