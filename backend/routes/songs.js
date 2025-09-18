// routes/songs.js
const express = require('express');
const router = express.Router();
const Song = require('../models/Song.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'file') {
    cb(null, file.mimetype.startsWith('audio/')); // accept audio
  } else if (file.fieldname === 'cover') {
    cb(null, file.mimetype.startsWith('image/')); // accept image
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 } // 200 MB max
});
//get root
router.get("/",(req,res)=>{
    res.send("root of songs");
})
// GET /spotify/songs
router.get('/songs', async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    console.log(songs);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/songs/:id
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/songs/upload   (multipart form-data: file, cover, plus title/artist)
router.post('/upload', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const file = req.files?.file?.[0];
    const cover = req.files?.cover?.[0];
    if (!file) return res.status(400).json({ error: 'Audio file is required' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    const coverUrl = cover ? `${req.protocol}://${req.get('host')}/uploads/${cover.filename}` : '';

    const { title, artist, album } = req.body;
    const song = new Song({
      title: title || file.originalname,
      artist: artist || 'Unknown',
      album,
      fileUrl,
      coverUrl
    });

    await song.save();
    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/songs   (create via JSON - you can use this if you already have fileUrl)
router.post('/', async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();
    res.status(201).json(song);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/songs/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/songs/:id  (also attempt to remove files from uploads)
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ error: 'Not found' });

    // helper to unlink local file if exists
    const deleteFile = (url) => {
      if (!url) return;
      const parts = url.split('/uploads/');
      if (parts.length < 2) return;
      const filename = parts[1];
      const filepath = path.join(__dirname, '..', 'uploads', filename);
      fs.unlink(filepath, err => { if (err) console.warn('unlink error', err.message); });
    };

    deleteFile(song.fileUrl);
    deleteFile(song.coverUrl);

    res.json({ message: 'Deleted', song });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
