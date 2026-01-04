import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadImageToR2, getR2Url } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email },
      include: { store: true }
    });

    if (!user || !user.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Upload to R2 in theme-images folder
    const r2Key = await uploadImageToR2(dataUrl, 'theme-images');
    const publicUrl = await getR2Url(r2Key);

    return NextResponse.json({ 
      success: true, 
      key: r2Key,
      url: publicUrl 
    });
  } catch (error: any) {
    console.error('Error uploading theme image:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}

