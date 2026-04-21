/**
 * compressImage.ts
 * Compresses a base64 image string to a target max size using canvas.
 * Returns the compressed base64 string (JPEG format).
 */
export async function compressImage(base64: string, maxKB = 150): Promise<string> {
    // If it's not a base64 data URL (it's an HTTP URL), return as-is
    if (!base64 || !base64.startsWith('data:')) return base64;

    // If already under limit, skip compression
    const currentSizeKB = Math.round(base64.length / 1024);
    if (currentSizeKB <= maxKB) return base64;

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            
            // Scale down dimensions proportionally to help hit size target
            let { width, height } = img;
            const maxDimension = 800; // max 800px on longest side
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(base64); return; }
            ctx.drawImage(img, 0, 0, width, height);

            // Try progressively lower quality until we hit the target size
            let quality = 0.8;
            let compressed = canvas.toDataURL('image/jpeg', quality);

            while (compressed.length / 1024 > maxKB && quality > 0.2) {
                quality -= 0.1;
                compressed = canvas.toDataURL('image/jpeg', quality);
            }

            console.log(
                `[compress] ${currentSizeKB}KB → ${Math.round(compressed.length / 1024)}KB (q=${quality.toFixed(1)})`
            );
            resolve(compressed);
        };

        img.onerror = () => resolve(base64); // fallback
        img.src = base64;
    });
}
