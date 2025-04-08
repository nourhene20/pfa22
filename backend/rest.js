const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const EntretienModel = require('./entry-schema');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/entretiens", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur MongoDB:', err));

// Routes
app.get('/entretien', async (req, res) => {
  try {
    const entretiens = await EntretienModel.find();
    res.json({ entretiens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/entretien', async (req, res) => {
  try {
    const newEntretien = new EntretienModel(req.body);
    const savedEntretien = await newEntretien.save();
    res.status(201).json(savedEntretien);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/entretien/:id', async (req, res) => {
  try {
    const updatedEntretien = await EntretienModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedEntretien);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/entretien/:id', async (req, res) => {
  try {
    await EntretienModel.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});