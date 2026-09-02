/**
 * SafarX Music Proxy — JioSaavn Song Search & Stream
 * Decrypts 320kbps AAC/MP4 audio streams with authentic vocals and lyrics.
 */
const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');

const JIOSAAVN_KEY = '38346591';

function decryptMediaUrl(encryptedUrl) {
  try {
    const key = CryptoJS.enc.Utf8.parse(JIOSAAVN_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    let url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url) return null;
    url = url.replace('_96.mp4', '_320.mp4');
    url = url.replace('_96.mp3', '_320.mp3');
    url = url.replace('http:', 'https:');
    return url;
  } catch (err) {
    console.error('Decryption failed:', err.message);
    return null;
  }
}

/**
 * GET /music/search?q=<query>&limit=<n>
 */
router.get('/search', async (req, res) => {
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 3;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Missing query parameter "q"' });
  }

  try {
    const searchUrl = `https://www.jiosaavn.com/api.php?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=wap6dot0&n=${limit}&__call=search.getResults`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const searchData = await searchRes.json();
    const results = searchData.results || [];

    if (!results.length) {
      return res.json({ success: true, results: [] });
    }

    // Get details & decrypted stream URL for the results
    const songs = await Promise.all(
      results.map(async (song) => {
        try {
          const detailUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0&_format=json&pids=${song.id}`;
          const detailRes = await fetch(detailUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          const detailData = await detailRes.json();
          const songData = detailData[song.id] || detailData.songs?.[0];
          const enc = songData?.encrypted_media_url;
          const streamUrl = enc ? decryptMediaUrl(enc) : null;

          return {
            id: song.id,
            title: song.title || song.song,
            artist: song.more_info?.singers || song.more_info?.artist || song.subtitle,
            album: song.more_info?.album || song.album,
            year: song.year,
            duration: parseInt(song.more_info?.duration || song.duration || 0),
            image: song.image ? song.image.replace('-150x150', '-500x500') : null,
            streamUrl
          };
        } catch (e) {
          return null;
        }
      })
    );

    const validSongs = songs.filter(s => s && s.streamUrl);

    res.json({
      success: true,
      results: validSongs
    });
  } catch (err) {
    console.error('Music search error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search songs.'
    });
  }
});

module.exports = router;
