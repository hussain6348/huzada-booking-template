// @ts-nocheck
interface Env { BUCKET?: R2Bucket; ADMIN_PASSWORD?: string; R2_PUBLIC_URL?: string; }
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return new Response(JSON.stringify({ success: false, error: 'No file.' }), { status: 400 });
    
    const fileKey = `services/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${file.name.split('.').pop() || 'jpg'}`;
    if (env.BUCKET) {
      await env.BUCKET.put(fileKey, file.stream(), { httpMetadata: { contentType: file.type || 'image/jpeg' } });
      const publicBase = env.R2_PUBLIC_URL || 'https://pub-huzada-uploads.r2.dev';
      return new Response(JSON.stringify({ success: true, imageUrl: `${publicBase.replace(/\/$/, '')}/${fileKey}` }));
    }
    return new Response(JSON.stringify({ success: false, error: 'R2 Bucket not bound' }), { status: 500 });
  } catch (err: any) { return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 }); }
};

