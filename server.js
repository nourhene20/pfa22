const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const { GridFSBucket } = require('mongodb');

const app = express();
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/interviewDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schéma Mongoose avec GridFS
const interviewSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: true,
    match: /^[a-f\d]{24}$/i
  },
  responses: {
    type: String,
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Interview = mongoose.model('Interview', interviewSchema);

// Configuration GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, { bucketName: 'videos' });
});

// Route d'upload
app.post('/api/interviews', upload.single('video'), async (req, res) => {
  try {
    if (!req.file || !req.body.candidateId || !req.body.responses) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const writeStream = gfs.openUploadStream(req.file.originalname);
    const bufferStream = new require('stream').PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream.pipe(writeStream)
      .on('finish', async () => {
        const interview = new Interview({
          candidateId: req.body.candidateId,
          responses: req.body.responses,
          videoId: writeStream.id
        });
        
        await interview.save();
        res.status(201).json({
          message: 'Entretien sauvegardé',
          interviewId: interview._id,
          videoId: writeStream.id
        });
      })
      .on('error', err => {
        throw new Error(err);
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Échec de la sauvegarde' });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5200;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});