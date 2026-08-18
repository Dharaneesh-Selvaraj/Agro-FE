import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Make file name unique to avoid overwriting
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Write to the public/uploads directory
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', uniqueName);
    
    await writeFile(uploadPath, buffer);

    return NextResponse.json({ 
      success: true, 
      imageUrl: `/uploads/${uniqueName}` 
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
