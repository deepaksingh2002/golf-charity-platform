import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

const ensureConfigured = () => {
  if (isConfigured) {
    return true;
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  isConfigured = true;
  return true;
};

export { cloudinary };

export const uploadOnCloudinary = async (fileOrBuffer) => {
  if (!fileOrBuffer) return null;
  if (!ensureConfigured()) return null;

  try {
    if (typeof fileOrBuffer === 'string') {
      return await cloudinary.uploader.upload(fileOrBuffer, { resource_type: 'auto' });
    }

    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, response) => {
          if (error) reject(error);
          else resolve(response);
        }
      );

      uploadStream.end(fileOrBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return null;
  }
};

export const deleteFromCloudinary = async (publicId, options = {}) => {
  if (!publicId || !ensureConfigured()) return;

  try {
    await cloudinary.uploader.destroy(publicId, options);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export const extractPublicId = (url) => {
  if (!url) return null;

  const withoutQuery = url.split('?')[0];
  const parts = withoutQuery.split('/');
  const uploadIndex = parts.indexOf('upload');

  if (uploadIndex === -1) return null;

  const publicIdWithExt = parts.slice(uploadIndex + 1).join('/');
  const cleaned = publicIdWithExt.replace(/^v\d+\//, '');

  return cleaned.replace(/\.[^/.]+$/, '');
};
