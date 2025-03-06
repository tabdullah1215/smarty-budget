// src/utils/imageCompression.js
export const compressImage = async (file) => {
    return new Promise((resolve, reject) => {
        try {
            // Track original file size
            const originalSize = file.size;

            // Create file reader to read the file
            const reader = new FileReader();

            reader.onload = (event) => {
                // Create an image to get dimensions
                const img = new Image();

                img.onload = () => {
                    // Calculate new dimensions while maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;

                    // Define max dimensions - adjust these based on your app's needs
                    const maxWidth = 1200;
                    const maxHeight = 1200;

                    // Resize if needed
                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            // Landscape image
                            if (width > maxWidth) {
                                height = Math.round(height * (maxWidth / width));
                                width = maxWidth;
                            }
                        } else {
                            // Portrait image
                            if (height > maxHeight) {
                                width = Math.round(width * (maxHeight / height));
                                height = maxHeight;
                            }
                        }
                    }

                    // Create a canvas to draw and compress the image
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    // Draw image on canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Determine appropriate format and quality based on file size
                    let quality = 0.7; // Default quality
                    let format = 'jpeg';

                    // For larger files, use more aggressive compression
                    if (originalSize > 5 * 1024 * 1024) { // > 5MB
                        quality = 0.6;
                    } else if (originalSize > 2 * 1024 * 1024) { // > 2MB
                        quality = 0.65;
                    } else if (originalSize < 200 * 1024) { // < 200KB
                        quality = 0.8; // Higher quality for already small images
                    }

                    // Try WebP if supported (better compression)
                    const supportsWebP = !!canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
                    if (supportsWebP) {
                        format = 'webp';
                    }

                    // Get compressed image as Data URL
                    const fileType = `image/${format}`;
                    const dataUrl = canvas.toDataURL(fileType, quality);
                    const compressedBase64 = dataUrl.split(',')[1];

                    // Calculate compressed size
                    const base64Length = compressedBase64.length;
                    const compressedSize = Math.round(base64Length * 0.75);

                    // Calculate compression ratio for toast message
                    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

                    resolve({
                        data: compressedBase64,
                        fileType,
                        originalSize,
                        compressedSize,
                        compressionRatio
                    });
                };

                img.onerror = (error) => {
                    reject(new Error('Failed to load image for compression: ' + error));
                };

                // Set the image source to the file data
                img.src = event.target.result;
            };

            reader.onerror = (error) => {
                reject(new Error('Failed to read image file: ' + error));
            };

            // Read the file as a data URL
            reader.readAsDataURL(file);
        } catch (error) {
            reject(error);
        }
    });
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};