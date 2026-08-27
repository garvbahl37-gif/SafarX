const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    required: true, 
    trim: true  // 👈 FIXED: Any text allowed, auto-trims
    // 👈 REMOVED: enum validation → Type ANYTHING!
  },
  url: { 
    type: String, 
    required: true 
  },
  publicId: { 
    type: String, 
    required: true 
  },
  size: { 
    type: Number,
    default: 0
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
