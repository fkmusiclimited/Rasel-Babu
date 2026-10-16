/**
 * Utility to compress image files before storing in browser state / localStorage
 * Reduces 5MB-10MB smartphone photos down to lightweight ~50KB-90KB JPEG data URLs.
 * Prevents LocalStorage QuotaExceeded errors, modal freezes, and memory crashes.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 1000,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve) => {
    // If not an image, resolve empty
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }

          // Draw with high quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.warn('Image canvas compression fallback:', err);
          resolve(result);
        }
      };

      img.onerror = () => {
        resolve(result);
      };

      img.src = result;
    };

    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};
