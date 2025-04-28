const express = require('express');
const router = express.Router(); // 🔥 important: créer le router express

const Link = require('../models/link.model'); // 🔥 importe ton modèle Mongoose Link

// ➡️ Route pour ajouter un lien
router.post('/add', async (req, res) => {
  console.log('🔥 Requête POST reçue avec :', req.body);

  try {
    const { email, domaine, dateDebut, dateFin, lienGeneré } = req.body;

    // Créer un nouvel objet Link
    const newLink = new Link({
      email,
      domaine,
      dateDebut,
      dateFin,
      lienGeneré
    });

    // Sauvegarder dans MongoDB
    await newLink.save();

    res.status(201).json({ message: 'Lien enregistré avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement du lien :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ➡️ Exporter le router pour pouvoir l'utiliser dans server.js
module.exports = router;
