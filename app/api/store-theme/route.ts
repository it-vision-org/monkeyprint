import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const theme = formData.get('theme') as string;
    const storeId = formData.get('storeId') as string;

    if (!theme || !storeId) {
      return NextResponse.json({ error: 'Theme and Store ID required' }, { status: 400 });
    }

    // Validate theme value
    const validThemes = ['theme-1', 'theme-2', 'theme-3'];
    if (!validThemes.includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    // Verify user owns the store
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true }
    });

    if (!user || !user.store || user.store.id !== storeId) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Update Store Theme
    await prisma.store.update({
      where: { id: storeId },
      data: { theme }
    });

    revalidatePath('/dashboard/theme');
    revalidatePath('/dashboard/compte');
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (store) {
      revalidatePath(`/shop/${store.slug}`);
    }

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error('Error updating store theme:', error);
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}

