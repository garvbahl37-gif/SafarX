const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Document = require('../models/Document');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 👈 GET docs by userId
router.get('/', async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const docs = await Document.find({ userId }).sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error('GET docs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 👈 POST upload (PDF FIX)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { name, type } = req.body;
    if (!req.file || !name) return res.status(400).json({ error: 'Missing file or name' });

    console.log('📤 Upload:', { name, type, mimetype: req.file.mimetype });  // 👈 Debug

    // 👈 PDF/IMAGE FIX: Correct resource_type
    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 
                        (req.file.mimetype.startsWith('image/') ? 'image' : 'auto');
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: resourceType,
        format: req.file.mimetype === 'application/pdf' ? 'pdf' : null
      }, (error, result) => {
        if (error) {
         console.error('Cloudinary error:', error);
         reject(error);
        } else {
         resolve(result);
        }
      }).end(req.file.buffer);
    });

    console.log('☁️ Cloudinary result:', result.secure_url);  // 👈 Debug

    const doc = new Document({
      userId,
      name,
      type,
      url: result.secure_url,
      publicId: result.public_id,
      size: req.file.size,
      uploadedAt: new Date()
    });
    
    await doc.save();
    res.json({ success: true, document: doc });
  } catch (err) {
    console.error('💥 Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 👈 FIXED DELETE: Cloudinary raw + better error logging
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      console.log('❌ Delete auth fail:', { userId: req.auth });
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    console.log('🗑️ Delete attempt:', req.params.id);  // 👈 Debug
    
    const doc = await Document.findOne({ _id: req.params.id, userId });
    if (!doc) {
      console.log('❌ Delete not found:', { id: req.params.id, userId });
      return res.status(404).json({ error: 'Not found' });
    }
    
    console.log('📄 Deleting Cloudinary:', doc.publicId, 'type: raw');  // 👈 Debug
    
    // 👈 FIXED: Specify resource_type 'raw' for PDFs (your main issue!)
    await cloudinary.uploader.destroy(doc.publicId, { 
      resource_type: 'raw',
      invalidate: true 
    });
    
    await Document.deleteOne({ _id: doc._id });
    
    console.log('✅ Delete success:', doc.name);  // 👈 Debug
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('💥 Delete error:', {
      id: req.params.id,
      userId: req.auth?.userId,
      error: err.message,
      publicId: doc?.publicId  // 👈 Logs EXACT problem
    });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
