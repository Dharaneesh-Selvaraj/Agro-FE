import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';
    const base64Pure = buffer.toString('base64');
    const base64DataUri = `data:${mimeType};base64,${base64Pure}`;

    const apiKey = process.env.IMGBB_API_KEY || '970ff5b1b7074e586c6c30edf1a0c9ce';

    // 1. Try ImgBB first (preferred storage for promotional images)
    if (apiKey) {
      try {
        const imgbbFormData = new FormData();
        imgbbFormData.append('image', base64Pure);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: imgbbFormData,
          signal: AbortSignal.timeout(8000), // 8s timeout
        });

        const imgbbData = await imgbbResponse.json();
        if (imgbbData && imgbbData.success && imgbbData.data) {
          const imageUrl = imgbbData.data.display_url || imgbbData.data.url;
          console.log('[Upload] Uploaded to ImgBB:', imageUrl);
          return NextResponse.json({ success: true, imageUrl });
        }
      } catch (imgbbErr) {
        console.warn('[Upload] ImgBB upload attempt failed, falling back to Railway storage:', imgbbErr.message);
      }
    }

    // 2. Resilient fallback to Railway backend self-hosted /uploads
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agro-fe-production.up.railway.app';
    const uploadRes = await fetch(`${backendUrl}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64DataUri,
        filename: file.name
      }),
      signal: AbortSignal.timeout(10000)
    });

    const uploadJson = await uploadRes.json();
    if (uploadRes.ok && uploadJson.success) {
      console.log('[Upload] Uploaded to backend fallback:', uploadJson.imageUrl);
      return NextResponse.json({ success: true, imageUrl: uploadJson.imageUrl });
    }

    return NextResponse.json({ 
      success: false, 
      error: uploadJson?.error || 'Failed to upload image' 
    }, { status: 500 });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
