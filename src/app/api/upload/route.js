import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';
    const base64Image = `data:${mimeType};base64,` + buffer.toString('base64');

    // Forward directly to Railway backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agro-fe-production.up.railway.app';
    const uploadRes = await fetch(`${backendUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Image,
        filename: file.name
      })
    });

    const uploadJson = await uploadRes.json();

    if (uploadRes.ok && uploadJson.success) {
      return NextResponse.json({ 
        success: true, 
        imageUrl: uploadJson.imageUrl 
      });
    } else {
      console.error('Backend upload error:', uploadJson);
      return NextResponse.json({ 
        success: false, 
        error: uploadJson.error || 'Failed to save image on server' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
