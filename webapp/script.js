function unsharpMask(context, width, height) {
  const src = context.getImageData(0, 0, width, height);
  const dst = context.createImageData(width, height);
  const kernel = [
    [1, 4, 6, 4, 1],
    [4,16,24,16,4],
    [6,24,36,24,6],
    [4,16,24,16,4],
    [1, 4, 6, 4, 1]
  ];
  const kernelSum = 256; // sum of gaussian kernel above
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const offset = (py * width + px) * 4;
          const weight = kernel[ky + 2][kx + 2];
          r += src.data[offset] * weight;
          g += src.data[offset + 1] * weight;
          b += src.data[offset + 2] * weight;
        }
      }
      const i = (y * width + x) * 4;
      dst.data[i] = clamp(src.data[i] * 1.5 - (r / kernelSum) * 0.5);
      dst.data[i + 1] = clamp(src.data[i + 1] * 1.5 - (g / kernelSum) * 0.5);
      dst.data[i + 2] = clamp(src.data[i + 2] * 1.5 - (b / kernelSum) * 0.5);
      dst.data[i + 3] = src.data[i + 3];
    }
  }
  context.putImageData(dst, 0, 0);
}

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

document.getElementById('upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const origCanvas = document.getElementById('origCanvas');
    const resCanvas = document.getElementById('resultCanvas');
    origCanvas.width = resCanvas.width = img.width;
    origCanvas.height = resCanvas.height = img.height;
    const origCtx = origCanvas.getContext('2d');
    const resCtx = resCanvas.getContext('2d');
    origCtx.drawImage(img, 0, 0);
    resCtx.drawImage(img, 0, 0);
    unsharpMask(resCtx, img.width, img.height);
    document.getElementById('download').disabled = false;
  };
  img.src = URL.createObjectURL(file);
});

document.getElementById('download').addEventListener('click', function () {
  const resCanvas = document.getElementById('resultCanvas');
  const link = document.createElement('a');
  link.download = 'deblurred.png';
  link.href = resCanvas.toDataURL();
  link.click();
});
