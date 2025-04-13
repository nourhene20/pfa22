const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const EntretienModel = require('./entry-schema');

const app = express();
const port = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/entretiens")
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB :', err));

// ✅ Routes

// Obtenir tous les entretiens
app.get('/entretien', async (req, res) => {
  try {
    const entretiens = await EntretienModel.find();
    res.json({ entretiens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/entretien/domaines', async (req, res) => {
  const domaines = await EntretienModel.distinct('domaine');
  res.status(200).json(domaines);
});

// Ajouter un entretien
app.post('/entretien', async (req, res) => {
  try {
    const newEntretien = new EntretienModel(req.body);
    const savedEntretien = await newEntretien.save();
    res.status(201).json(savedEntretien);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Modifier un entretien
app.put('/entretien/:id', async (req, res) => {
  try {
    const updatedEntretien = await EntretienModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedEntretien);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un entretien
app.delete('/entretien/:id', async (req, res) => {
  try {
    await EntretienModel.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
});
