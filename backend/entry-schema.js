const mongoose = require('mongoose'); // Ligne 1 - doit être en premier

const entretienSchema = new mongoose.Schema({ // Correction du nom de variable
  domaine: String,
  questions: String
}, { 
  collection: 'entretien' // Option explicite pour la collection
});

module.exports = mongoose.model('Entretien', entretienSchema); // Utilisation du bon nom de schéma