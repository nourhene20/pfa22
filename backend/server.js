const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// ✅ Import des routes
const candidateRoutes = require('./routes/candidate.routes');
const linkRoutes = require('./routes/links.routes');
const resultsRoute = require('./routes/results');
const uploadRoutes = require('./routes/upload');
const EntretienModel = require('./entry-schema'); // Schéma mongoose pour les entretiens

const app = express();
const PORT = 3000;

// ✅ Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Middlewares
app.use(cors());
app.use(express.json()); // Utiliser uniquement express.json()
app.use('/uploads', express.static(uploadsDir)); // Servir les fichiers statiques

// ✅ Routes API
app.use('/api/candidates', candidateRoutes);
app.use('/api/links', linkRoutes);
app.use('/api', resultsRoute);
app.use('/api', uploadRoutes);

// ✅ Configuration Nodemailer
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: adminEmail,
    pass: adminPassword
  }
});

// ✅ Route pour envoyer les liens par email
app.post('/api/send-links', async (req, res) => {
  const linksToSend = req.body;
  if (!Array.isArray(linksToSend) || linksToSend.length === 0) {
    return res.status(400).send('❗ Format de données invalide.');
  }

  try {
    await Promise.all(
      linksToSend.map(({ email, lien }) => {
        if (!email || !lien) {
          throw new Error('❗ Données manquantes.');
        }

        const mailOptions = {
          from: `"Entretien" <${adminEmail}>`,
          to: email,
          subject: 'Votre lien d\'entretien est valable entre le 07/05/2025 et 10/05/2025 :',
          html: `<p>Bonjour,</p><p>Voici votre lien d'entretien : <a href="${lien}">${lien}</a></p><p>Merci.</p>`
        };

        return transporter.sendMail(mailOptions);
      })
    );

    console.log('✅ Tous les emails ont été envoyés.');
    res.status(200).send('✅ Emails envoyés avec succès.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des emails :', error);
    res.status(500).send('❌ Erreur serveur lors de l\'envoi des emails.');
  }
});

// ✅ CRUD ENTRETIENS
// Obtenir tous les entretiens
app.get('/api/entretien', async (req, res) => {
  try {
    const entretiens = await EntretienModel.find();
    res.json({ entretiens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les questions d'un domaine
app.get('/api/entretien/domaines/:domaine', async (req, res) => {
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
app.get('/api/entretien/domaines', async (req, res) => {
  try {
    const domaines = await EntretienModel.distinct('domaine');
    res.json(domaines);
  } catch (error) {
    console.error('❌ Erreur récupération domaines :', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des domaines' });
  }
});

// Ajouter un entretien
app.post('/api/entretien', async (req, res) => {
  try {
    const newEntretien = new EntretienModel(req.body);
    const savedEntretien = await newEntretien.save();
    res.status(201).json(savedEntretien);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Modifier un entretien
app.put('/api/entretien/:id', async (req, res) => {
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
app.delete('/api/entretien/:id', async (req, res) => {
  try {
    await EntretienModel.findByIdAndDelete(req.params.id);
    res.status(204).end(); // No content
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ Connexion MongoDB et démarrage serveur
mongoose.connect('mongodb://localhost:27017/entretiens', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connecté à MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('❌ Erreur de connexion MongoDB :', err);
});
