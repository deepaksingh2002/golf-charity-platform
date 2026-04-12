import multer from 'multer';
import { ApiError } from '../utils/apiError.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_SIZE_BYTES || 5 * 1024 * 1024),
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Only JPG, PNG, and PDF files are allowed'));
    }

    return cb(null, true);
  }
});

export default upload;
