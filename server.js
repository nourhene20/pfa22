const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Configuration de l'application
const app = express();

// Middleware CORS amélioré
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

// Connexion MongoDB avec options modernes
mongoose.connect('mongodb://localhost:27017/entretiens', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('Connecté à MongoDB avec succès'))
.catch(err => console.error('Erreur de connexion MongoDB:', err));

// Modèle Mongoose avec validation
const entretienSchema = new mongoose.Schema({
  domaine: {
    type: String,
    required: [true, 'Le domaine est obligatoire']
  },
  questions: {
    type: String,
    required: [true, 'Les questions sont obligatoires']
  }
});

const Entretien = mongoose.model('Entretien', entretienSchema, 'entretien');

// Middleware de gestion d'erreurs centralisé
const handleError = (res, err) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Erreur serveur'
  });
};

// Routes
app.get('/entretien', async (req, res) => {
  try {
    const entretiens = await Entretien.find().lean();
    res.json({
      success: true,
      data: entretiens
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/entretien', async (req, res) => {
  try {
    const entretien = new Entretien(req.body);
    const result = await entretien.save();
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.put('/entretien/:id', async (req, res) => {
  try {
    const updated = await Entretien.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Entretien non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    handleError(res, err);
  }
});

app.delete('/entretien/:id', async (req, res) => {
  try {
    const deleted = await Entretien.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Entretien non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Entretien supprimé avec succès'
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Route de santé
app.get('/', (req, res) => {
  res.send('Serveur des entretiens opérationnel');
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trouvé'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});