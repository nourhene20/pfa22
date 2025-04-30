const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const candidateRoutes = require('./routes/candidate.routes');
const linkRoutes = require('./routes/links.routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use('/api/candidates', candidateRoutes);
app.use('/api/links', linkRoutes);

// 🔥 Email config sécurisé depuis .env
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

// Transporteur nodemailer avec Gmail
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: adminEmail,
    pass: adminPassword
  }
});

// ➡️ API pour envoyer des emails
app.post('/api/send-links', async (req, res) => {
  const linksToSend = req.body; // [{ email, lien }, { email, lien }]

  if (!Array.isArray(linksToSend) || linksToSend.length === 0) {
    return res.status(400).send('❗ Mauvais format de données.');
  }

  try {
    await Promise.all(
      linksToSend.map(({ email, lien }) => {
        if (!email || !lien) {
          throw new Error('❗ Données manquantes pour un email.');
        }

        const mailOptions = {
          from: `"Administration" <${adminEmail}>`,
          to: email,
          subject: 'Votre lien personnalisé',
          html: `<p>Bonjour,</p><p>Voici votre lien d'entretien : <a href="${lien}">${lien}</a></p><p>Merci.</p>`
        };
        return transporter.sendMail(mailOptions);
      })
    );

    console.log('✅ Tous les emails ont été envoyés.');
    res.status(200).send('✅ Emails envoyés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des emails :', error);
    res.status(500).send('Erreur lors de l\'envoi des emails.');
  }
});

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/candidates', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connecté à MongoDB');
  app.listen(PORT, () => console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`));
}).catch(err => console.error('❌ Erreur de connexion MongoDB :', err));
