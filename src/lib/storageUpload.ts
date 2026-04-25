/**
 * storageUpload.ts
 * Handles uploading images to Supabase Storage (product-images bucket).
 * Returns a public CDN URL instead of storing base64 in the database.
 */
import { supabase } from './supabase';

const BUCKET = 'product-images';

/**
 * Convert a base64 data URL to a Blob for upload.
 */
function base64ToBlob(base64: string): { blob: Blob; ext: string } {
    const [header, data] = base64.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/webp';
    const ext = mime.split('/')[1] || 'webp';
    const byteChars = atob(data);
    const byteArrays: Uint8Array[] = [];
    for (let i = 0; i < byteChars.length; i += 512) {
        const slice = byteChars.slice(i, i + 512);
        const byteNums = new Array(slice.length).fill(0).map((_, j) => slice.charCodeAt(j));
        byteArrays.push(new Uint8Array(byteNums));
    }
    return { blob: new Blob(byteArrays, { type: mime }), ext };
}

/**
 * Upload a base64 image to Supabase Storage.
 * If it's already an HTTP URL (already migrated), returns as-is.
 * Returns the public CDN URL.
 */
export async function uploadProductImage(
    base64OrUrl: string,
    productId: number | string
): Promise<string> {
    // Already a URL — skip upload
    if (!base64OrUrl || !base64OrUrl.startsWith('data:')) {
        return base64OrUrl;
    }

    const { blob, ext } = base64ToBlob(base64OrUrl);
    const path = `${productId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, {
            upsert: true,
            contentType: blob.type,
            cacheControl: '31536000', // 1 year browser cache
        });

    if (error) {
        console.error('[Storage] Upload failed:', error.message);
        // Fallback: return the base64 so product still saves
        return base64OrUrl;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    console.log(`[Storage] Uploaded product ${productId} image → ${data.publicUrl}`);
    return data.publicUrl;
}

/**
 * Delete a product's image from Supabase Storage by its public URL.
 * Safe to call with HTTP URLs only — ignores base64 strings.
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
    if (!imageUrl || imageUrl.startsWith('data:')) return;

    // Extract the storage path from the URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
    const marker = `/${BUCKET}/`;
    const idx = imageUrl.indexOf(marker);
    if (idx === -1) return;

    const path = imageUrl.slice(idx + marker.length);
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) console.warn('[Storage] Delete failed:', error.message);
}
