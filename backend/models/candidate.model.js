const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  cin: { type: String, required: true, unique: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  domaine: { type: String, required: true },
  telephone: { type: String, required: true },
  diplome: { type: String, required: true }
});

module.exports = mongoose.model('Candidate', candidateSchema);