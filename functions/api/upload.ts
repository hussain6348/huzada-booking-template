// @ts-nocheck
export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file');
    
    if (!files || files.length === 0) return Response.json({ error: 'No files uploaded' }, { status: 400 });

    const imageUrls = [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const ext = file.name.split('.').pop() || 'png';
      const key = `service-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      
      await env.BUCKET.put(key, buffer, { httpMetadata: { contentType: file.type } });
      imageUrls.push(`/api/media/${key}`);
    }
    
    return Response.json({ imageUrls, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
