const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate.model');

// GET all candidates
router.get('/', async (req, res) => {
  const candidates = await Candidate.find();
  res.json(candidates);
});
// GET distinct domaines
router.get('/domaines', async (req, res) => {
  try {
    const domaines = await Candidate.distinct('domaine');
    res.status(200).json(domaines);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des domaines', error });
  }
});
router.post('/', async (req, res) => {
  try {
    const exists = await Candidate.findOne({ cin: req.body.cin });
    if (exists) {
      return res.status(400).json({ message: 'CIN déjà existant' });
    }

    const candidate = new Candidate(req.body);
    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update candidate
router.put('/:cin', async (req, res) => {
  try {
    const candidate = await Candidate.findOneAndUpdate(
      { cin: req.params.cin },
      req.body,
      { new: true }
    );
    if (!candidate) {
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE candidate
router.delete('/:cin', async (req, res) => {
  try {
    const result = await Candidate.findOneAndDelete({ cin: req.params.cin });
    if (!result) {
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }
    res.json({ message: 'Candidat supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;