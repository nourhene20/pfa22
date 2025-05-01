const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/admin-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connexion MongoDB réussie'))
  .catch(err => console.error('❌ Erreur MongoDB', err));

// Routes
app.use('/api', authRoutes);

// Serveur
const PORT = 5001; 
app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
