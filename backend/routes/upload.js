// routes/upload.js
const express = require('express');
const router = express.Router();
const File = require('../models/file');


router.post('/files/save', async (req, res) => {
  const { candidateId, videopath, filepath } = req.body;

  if (!candidateId || !videopath || !filepath) {
    return res.status(400).json({ error: '❌ Données manquantes.' });
  }

  try {
    const file = new File({ candidateId, videopath, filepath });
    await file.save();
    res.status(201).json({ message: '✅ Données sauvegardées.', file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Erreur serveur.' });
  }
});

module.exports = router;
