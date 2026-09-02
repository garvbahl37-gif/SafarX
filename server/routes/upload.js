/**
 * SafarX Video Upload — Cloudinary Video Hosting
 * POST /upload/video — uploads video blob to Cloudinary, returns public URL.
 */
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Use memory storage so we get the buffer directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
});

/**
 * POST /upload/video
 * Accepts a video file via multipart form data
 * Uploads to Cloudinary and returns the public URL
 */
router.post('/video', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No video file provided' });
  }

  try {
    // Upload buffer to Cloudinary without blocking synchronous transformations
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'safarx-reels',
          public_id: `reel_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Apply Cloudinary dynamic on-the-fly URL transformation for fast, lightweight video delivery
    let optimizedUrl = result.secure_url;
    if (optimizedUrl && optimizedUrl.includes('/upload/')) {
      optimizedUrl = optimizedUrl.replace('/upload/', '/upload/q_auto:eco,w_720,c_limit,vc_auto/');
    }

    res.json({
      success: true,
      url: optimizedUrl,
      rawUrl: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      size: result.bytes,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to upload video. Please try again.',
    });
  }
});

module.exports = router;
