
/**
 * Get image orientation
 *
 * @async
 * @param {Blob} blob - image blob object
 */
export const getOrientation = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.addEventListener('load', () => {
    const view = new DataView(reader.result);

    if (view.getUint16(0, false) !== 0xFFD8) {
      return resolve(-2);
    }

    const length = view.byteLength;
    let offset = 2;

    while (offset < length) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xFFE1) {
        offset += 2;

        if (view.getUint32(offset, false) !== 0x45786966) {
          return resolve(-1);
        }

        const little = view.getUint16(offset += 6, false) === 0x4949;
        offset += view.getUint32(offset + 4, little);

        const tags = view.getUint16(offset, little);
        offset += 2;

        for (let i = 0; i < tags; i += 1) {
          if (view.getUint16(offset + (i * 12), little) === 0x0112) {
            return resolve(view.getUint16(offset + (i * 12) + 8, little));
          }
        }
      } else {
        // eslint-disable-next-line no-bitwise
        if ((marker & 0xFF00) !== 0xFF00) {
          return resolve(-1);
        }

        offset += view.getUint16(offset, false);
      }
    }

    return resolve(-1);
  });

  reader.addEventListener('error', (e) => reject(e));

  reader.readAsArrayBuffer(blob);
});


/**
 * Get image base64 and fix its orientation (if needed)
 *
 * @param {*} blob - file blob
 * @param {*} orientation - image orientation
 */
export const fixOrientation = (blob, orientation) => new Promise((resolve, reject) => {
  const fileReader = new FileReader();

  fileReader.addEventListener('load', () => {
    if (!orientation || orientation <= 1) {
      return resolve(fileReader.result);
    }

    const image = new Image();
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const { width, height } = image;
      canvas.width = width;
      canvas.height = height;

      // eslint-disable-next-line default-case
      switch (orientation) {
        case 2:
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
          break;
        case 3:
          ctx.translate(width, height);
          ctx.rotate(180 / 180 * Math.PI);
          break;
        case 4:
          ctx.translate(0, height);
          ctx.scale(1, -1);
          break;
        case 5:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(90 / 180 * Math.PI);
          ctx.scale(1, -1);
          break;
        case 6:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(90 / 180 * Math.PI);
          ctx.translate(0, -height);
          break;
        case 7:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(270 / 180 * Math.PI);
          ctx.translate(-width, height);
          ctx.scale(1, -1);
          break;
        case 8:
          canvas.width = height;
          canvas.height = width;
          ctx.translate(0, width);
          ctx.rotate(270 / 180 * Math.PI);
          break;
      }

      ctx.drawImage(image, 0, 0, width, height);
      resolve(
        canvas.toDataURL('image/jpeg', 0.95),
      );
    });

    image.src = fileReader.result;

    return null;
  });

  fileReader.addEventListener('error', (e) => {
    reject(e);
  });

  fileReader.readAsDataURL(blob);
});

/**
 * Check if current browser is Samsung Browser
 */
export const isSamsungBrowser = () => /SamsungBrowser\/(?!([1-9][1-9]|[2-9][0-9]))/i.test(navigator.userAgent);

/**
 * Photos from camera to base64
 */
export const imgToBase64 = (file) => new Promise((resolve, reject) => {
  const fileReader = new FileReader();

  fileReader.onload = () => resolve(fileReader.result);

  fileReader.onerror = () => (e) => reject(e);

  fileReader.readAsDataURL(file);
});

/**
 * Detect chrome version
 */
export const getChromeVersion = () => {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

  return raw ? parseInt(raw[2], 10) : false;
};
