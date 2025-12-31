import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    
    // Check if directory exists
    if (!fs.existsSync(fontsDir)) {
      return NextResponse.json({ fonts: [] });
    }

    const files = await fs.promises.readdir(fontsDir);

    // Filter for font files (ttf, otf, woff, woff2)
    const fonts = files.filter(file => 
      /\.(ttf|otf|woff|woff2)$/i.test(file)
    ).map(file => ({
      name: file.split('.')[0], // Simple name from filename
      file: file,
      url: `/fonts/${file}`
    }));

    return NextResponse.json({ fonts });
  } catch (error) {
    console.error('Error reading fonts directory:', error);
    return NextResponse.json({ error: 'Failed to load fonts' }, { status: 500 });
  }
}
