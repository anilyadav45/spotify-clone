// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('./models/Song');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB — seeding...');
    await Song.deleteMany({});

    const songs = [
      {
        title: 'Sample Song 1',
        artist: 'Demo Artist',
        fileUrl: 'http://localhost:5000/uploads/sample1.mp3',
        coverUrl: 'http://localhost:5000/uploads/sample1.jpg'
      },
      {
        title: 'Sample Song 2',
        artist: 'Demo Artist',
        fileUrl: 'http://localhost:5000/uploads/sample2.mp3',
        coverUrl: 'http://localhost:5000/uploads/sample2.jpg'
      }
    ];

    await Song.insertMany(songs);
    console.log('Seeding complete');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
