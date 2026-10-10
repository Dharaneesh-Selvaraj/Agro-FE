import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'IMGBB_API_KEY is not configured in .env.local' 
      }, { status: 500 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Send to ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64Image);

    const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const imgbbData = await imgbbResponse.json();

    if (imgbbData.success) {
      return NextResponse.json({ 
        success: true, 
        // This is the direct public URL to the uploaded image
        imageUrl: imgbbData.data.display_url 
      });
    } else {
      console.error('ImgBB Error:', imgbbData);
      return NextResponse.json({ success: false, error: 'Failed to upload image to ImgBB' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
