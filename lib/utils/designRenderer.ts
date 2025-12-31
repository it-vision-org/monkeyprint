/**
 * Utility functions to render canvas designs to images
 */

export async function renderDesignToImage(
  designJson: string,
  width: number = 800,
  height: number = 1000
): Promise<string> {
  // Dynamically import fabric.js only on client side
  if (typeof window === 'undefined') {
    throw new Error('This function must be called on the client side');
  }

  const fabric = (await import('fabric')).fabric;

  return new Promise((resolve, reject) => {
    try {
      const canvas = new fabric.StaticCanvas(null, {
        width,
        height,
        backgroundColor: 'transparent',
      });

      const design = JSON.parse(designJson);
      const { objects = [], w = width, h = height } = design;

      if (!objects || objects.length === 0) {
        // Return transparent canvas if no objects
        const dataUrl = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1,
        });
        canvas.dispose();
        resolve(dataUrl);
        return;
      }

      // Scale objects to fit new canvas size
      const scaleX = width / w;
      const scaleY = height / h;

      fabric.util.enlivenObjects(objects).then((objs: any[]) => {
        objs.forEach((obj) => {
          obj.set({
            left: (obj.left || 0) * scaleX,
            top: (obj.top || 0) * scaleY,
            scaleX: (obj.scaleX || 1) * scaleX,
            scaleY: (obj.scaleY || 1) * scaleY,
          });
          canvas.add(obj);
        });

        canvas.renderAll();

        // Export as data URL
        const dataUrl = canvas.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1,
        });

        canvas.dispose();
        resolve(dataUrl);
      }).catch((error) => {
        canvas.dispose();
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function combineDesigns(
  frontDesign: string | null,
  backDesign: string | null,
  width: number = 800,
  height: number = 1000
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('This function must be called on the client side');
  }

  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // Side by side: front and back
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const promises: Promise<HTMLImageElement | null>[] = [];

      if (frontDesign && frontDesign.trim() !== '') {
        promises.push(
          renderDesignToImage(frontDesign, width, height)
            .then(loadImage)
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      if (backDesign && backDesign.trim() !== '') {
        promises.push(
          renderDesignToImage(backDesign, width, height)
            .then(loadImage)
            .catch(() => null)
        );
      } else {
        promises.push(Promise.resolve(null));
      }

      Promise.all(promises).then(([frontImg, backImg]) => {
        // Draw front design on the left
        if (frontImg) {
          ctx.drawImage(frontImg, 0, 0, width, height);
        } else {
          // Draw placeholder
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#999';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Front', width / 2, height / 2);
        }

        // Draw back design on the right
        if (backImg) {
          ctx.drawImage(backImg, width, 0, width, height);
        } else {
          // Draw placeholder
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(width, 0, width, height);
          ctx.fillStyle = '#999';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Back', width + width / 2, height / 2);
        }

        // Convert to base64
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

