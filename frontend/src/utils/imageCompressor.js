/**
 * Utility untuk kompresi gambar di sisi client (browser).
 * Mengubah foto kamera HP beresolusi tinggi (4-15MB) menjadi ~300-600KB dengan resolusi HD yang tetap tajam.
 * Berjalan sangat cepat menggunakan HTML5 Canvas native tanpa dependensi tambahan.
 *
 * @param {File} file - Berkas gambar asli dari input file
 * @param {Object} options - Konfigurasi kompresi
 * @param {number} options.maxWidth - Lebar maksimal gambar (default: 1600px)
 * @param {number} options.maxHeight - Tinggi maksimal gambar (default: 1600px)
 * @param {number} options.quality - Kualitas kompresi JPEG 0-1 (default: 0.8)
 * @param {number} options.minSizeToCompress - Ukuran minimum file (bytes) untuk dikompres (default: 500KB)
 * @returns {Promise<File>} File yang sudah terkompresi atau file asli jika bukan gambar/di bawah minSize
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    minSizeToCompress = 500 * 1024, // 500 KB
  } = options;

  // Jika bukan file gambar atau ukuran sudah kecil, kembalikan file asli
  if (!file || !file.type.startsWith('image/') || file.size < minSizeToCompress) {
    return file;
  }

  // Jika file adalah SVG atau GIF animasi, jangan diubah via canvas
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung aspect ratio agar proporsi gambar tetap terjaga
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export canvas ke format JPEG/WebP
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // Jika hasil kompresi malah lebih besar (jarang terjadi), gunakan file asli
              resolve(file);
              return;
            }

            // Ganti nama ekstensi jika perlu, pertahankan nama asli
            const newName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], newName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        // Jika gagal decode gambar, fallback ke file asli
        resolve(file);
      };
    };

    reader.onerror = () => {
      resolve(file);
    };
  });
}
