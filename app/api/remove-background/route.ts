import { NextRequest, NextResponse } from 'next/server';

const REMBG_URL = process.env.REMBG_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageDataUrl } = body;

    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      return NextResponse.json(
        { error: 'imageDataUrl is required' },
        { status: 400 }
      );
    }

    // Decode base64 data URL to raw bytes
    const base64Data = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Send to FastAPI rembg service
    const formData = new FormData();
    formData.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'image.png');

    const response = await fetch(`${REMBG_URL}/remove-bg`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`rembg service error: ${errorText}`);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());
    const processedBase64 = resultBuffer.toString('base64');
    const processedDataUrl = `data:image/png;base64,${processedBase64}`;

    return NextResponse.json({
      success: true,
      imageDataUrl: processedDataUrl,
    });
  } catch (error: any) {
    console.error('Error removing background:', error);
    return NextResponse.json(
      { error: 'Failed to remove background', details: error.message },
      { status: 500 }
    );
  }
}
