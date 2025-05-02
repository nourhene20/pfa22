const express = require('express');
const router = express.Router();
const File = require('../models/file');
const multer = require('multer');
const path = require('path');

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // Chemin vers backend/uploads
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Limite à 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mp4', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// Route pour uploader les fichiers
router.post('/files/upload', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'text', maxCount: 1 }
]), async (req, res) => {
  const { candidateId } = req.body;

  if (!candidateId || !req.files || !req.files.video || !req.files.text) {
    return res.status(400).json({ error: '❌ Données ou fichiers manquants.' });
  }

  try {
    const videoFile = req.files.video[0];
    const textFile = req.files.text[0];

    const file = new File({
      candidateId,
      videopath: `uploads/${videoFile.filename}`, // Chemin relatif
      filepath: `uploads/${textFile.filename}`    // Chemin relatif
    });

    await file.save();
    res.status(201).json({ message: '✅ Fichiers sauvegardés.', file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Erreur serveur.' });
  }
});

module.exports = router;