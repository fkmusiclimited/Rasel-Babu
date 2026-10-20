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

/**
 * Creates a clean 1:1 square centered crop for Favicon and circular avatars.
 * Supports file objects or image data URL strings.
 */
export const createSquareCrop = (
  source: File | string,
  targetDimension = 256
): Promise<string> => {
  return new Promise((resolve) => {
    const processImage = (src: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const { naturalWidth: width, naturalHeight: height } = img;
          const minDim = Math.min(width, height);
          const sx = (width - minDim) / 2;
          const sy = (height - minDim) / 2;

          const canvas = document.createElement('canvas');
          canvas.width = targetDimension;
          canvas.height = targetDimension;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(src);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Center-crop 1:1 onto square canvas
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetDimension, targetDimension);

          // Export as PNG for clean sharp favicon rendering
          const squareDataUrl = canvas.toDataURL('image/png');
          resolve(squareDataUrl);
        } catch (err) {
          console.warn('Square crop fallback:', err);
          resolve(src);
        }
      };

      img.onerror = () => resolve(src);
      img.src = src;
    };

    if (typeof source === 'string') {
      processImage(source);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          processImage(result);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(source);
    }
  });
};

/**
 * Dynamically updates the browser favicon element in document <head>
 */
export const updateWebsiteFavicon = (iconUrl: string) => {
  if (!iconUrl || typeof document === 'undefined') return;

  try {
    const isPng = iconUrl.startsWith('data:image/png') || iconUrl.endsWith('.png');
    const mimeType = isPng ? 'image/png' : 'image/jpeg';
    const selectors = [
      "link[rel~='icon']",
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']",
      '#app-favicon',
    ];

    let updatedAny = false;
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        const link = el as HTMLLinkElement;
        link.type = mimeType;
        link.href = iconUrl;
        updatedAny = true;
      });
    });

    if (!updatedAny) {
      const link = document.createElement('link');
      link.id = 'app-favicon';
      link.rel = 'icon';
      link.type = mimeType;
      link.href = iconUrl;
      document.head.appendChild(link);
    }
  } catch (e) {
    console.warn('Failed to update favicon:', e);
  }
};
