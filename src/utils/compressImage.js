/**
 * Shrink a photograph before it is uploaded.
 *
 * The vault accepts files up to 10MB, and a passport photographed on a modern
 * phone is routinely 4-12MB of that — a 4000px image carrying EXIF, saved at
 * a quality nobody needs to read a document number. On hotel wifi that is the
 * whole of the wait: the three API calls around it are a few hundred
 * milliseconds together, while the bytes are tens of seconds.
 *
 * Re-encoding at 2000px and quality 0.82 keeps a passport, a visa page or a
 * ticket comfortably legible — the text is still sharp enough to read and to
 * zoom into — while typically cutting the file by twenty times or more.
 *
 * Deliberately conservative about when it applies:
 *
 *   - PDFs are passed through untouched. They are usually already small, and
 *     rasterising a document to a JPEG would lose its selectable text.
 *   - Files already under `skipUnder` are left alone; re-encoding a 200KB
 *     scan can easily make it bigger.
 *   - If the result comes out no smaller than the original, the original is
 *     returned. This happens with screenshots and flat graphics, where PNG
 *     beats JPEG.
 *   - Any failure — a format the browser cannot decode, a canvas that is
 *     tainted, no createImageBitmap — resolves to the original file rather
 *     than rejecting. Compression is an optimisation, and must never be the
 *     reason a document cannot be stored.
 *
 * @param {File} file
 * @param {object} [options]
 * @param {number} [options.maxEdge]    longest side, in pixels
 * @param {number} [options.quality]    JPEG quality, 0-1
 * @param {number} [options.skipUnder]  bytes below which nothing is done
 * @returns {Promise<File>} the smaller file, or the original
 */
export async function compressImage(
  file,
  { maxEdge = 2000, quality = 0.82, skipUnder = 600 * 1024 } = {}
) {
  if (!file || !file.type?.startsWith('image/')) return file;
  /* An animated GIF would come back as a single frame, so leave it alone. */
  if (file.type === 'image/gif') return file;
  if (file.size <= skipUnder) return file;

  try {
    const bitmap = await loadBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    /* Downscaling in one step is blurry on large ratios; the browser's own
       smoothing at high quality is good enough here and far cheaper than a
       manual pyramid. */
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], toJpegName(file.name), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

/** `createImageBitmap` where it exists, an <img> everywhere else. */
async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    /* Honours the EXIF orientation flag, so a portrait photo taken sideways
       is not stored on its side. */
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* Safari has shipped versions that reject the options argument. */
      return await createImageBitmap(file);
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('decode failed'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

const toJpegName = (name) =>
  `${String(name || 'document').replace(/\.[^.]+$/, '')}.jpg`;

/** For the "3.4 MB → 210 KB" line the upload panel shows. */
export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
