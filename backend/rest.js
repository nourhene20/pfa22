const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const EntretienModel = require('./entry-schema'); // ✅ Schéma mongoose des entretiens

const app = express();
const port = process.env.PORT || 5000;

// ✅ Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Permet de servir les fichiers statiques (vidéos et fichiers texte)

// ✅ Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/entretiens", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB :', err));

// ✅ Routes Upload
app.use('/api', require('./routes/upload')); // POST /api/files/upload

// ✅ ROUTES ENTRETIEN CRUD

// Obtenir tous les entretiens
app.get('/entretien', async (req, res) => {
  try {
    const entretiens = await EntretienModel.find();
    res.json({ entretiens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les questions par domaine
app.get('/entretien/domaines/:domaine', async (req, res) => {
  const { domaine } = req.params;
  try {
    const entretien = await EntretienModel.findOne({ domaine });
    if (entretien) {
      res.json({ questions: entretien.questions });
    } else {
      res.status(404).json({ error: 'Domaine non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir la liste des domaines
app.get('/entretien/domaines', async (req, res) => {
  try {
    const domaines = await EntretienModel.distinct('domaine');
    res.json(domaines);
  } catch (error) {
    console.error('Erreur lors de la récupération des domaines :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des domaines' });
  }
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
    res.status(204).end(); // No content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
});
