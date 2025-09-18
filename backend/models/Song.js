// models/Song.js
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, default: 'Unknown' },
  album: { type: String },
  fileUrl: { type: String, required: true },   // e.g. http://localhost:5000/uploads/12345.mp3
  coverUrl: { type: String },
  duration: { type: Number }, // seconds (optional)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Song', songSchema);
