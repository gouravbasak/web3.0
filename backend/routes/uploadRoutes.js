require('dotenv').config();
const express = require('express');
const multer = require('multer');
const ImageKit = require('imagekit');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

// Multer memory storage (keeps file buffer in RAM before uploading to ImageKit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

function getImageKitInstance() {
  require('dotenv').config(); // ensure env vars are fresh
  const publicKey = (process.env.IMAGEKIT_PUBLIC_KEY || '').trim();
  const privateKey = (process.env.IMAGEKIT_PRIVATE_KEY || '').trim();
  const urlEndpoint = (process.env.IMAGEKIT_URL_ENDPOINT || '').trim();

  if (!publicKey || !privateKey || !urlEndpoint) {
    return null;
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

// POST /api/admin/upload
router.post('/', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imagekit = getImageKitInstance();

    if (!imagekit) {
      return res.status(500).json({
        message:
          'ImageKit credentials are missing in backend/.env. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.',
      });
    }

    const result = await imagekit.upload({
      file: req.file.buffer, // file buffer
      fileName: `product_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`,
      folder: '/products',
    });

    res.json({
      message: 'Image uploaded successfully',
      url: result.url,
      fileId: result.fileId,
    });
  } catch (err) {
    console.error('ImageKit upload error:', err);
    res.status(500).json({ message: err.message || 'Image upload failed' });
  }
});

module.exports = router;
