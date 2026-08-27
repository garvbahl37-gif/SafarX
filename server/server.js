require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { clerkMiddleware } = require('@clerk/express');
const documentRoutes = require('./routes/documents');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// 👈 NUCLEAR CORS FIX: Allow ALL origins (dev only)
app.use(cors({ 
  origin: true,  // 👈 FIXED: true = allow all origins + credentials
  credentials: true 
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 👈 Clerk middleware (attaches req.auth)
app.use(clerkMiddleware());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 👈 Matches frontend calls exactly
app.use('/documents', documentRoutes);

app.get('/', (req, res) => res.json({ message: 'Document Wallet API running!' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend: http://localhost:${PORT}`));
