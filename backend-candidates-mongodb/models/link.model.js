const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  email: { type: String, required: true },
  domaine: { type: String, required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  lienGeneré: { type: String, required: true }
});

module.exports = mongoose.model('Link', linkSchema);
