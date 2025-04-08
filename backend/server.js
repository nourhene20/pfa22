const express=require("express");

const app=express();

// AVANT (ERREUR) :
const entrySchema = mongoose.Schema({
    domaine: String,
    questions: String
  });
  module.exports = mongoose.model('Entretien', entretienSchema, 'entretien');
  
  // APRÈS (CORRIGÉ) :
  const mongoose = require('mongoose');
  
  const entretienSchema = mongoose.Schema({ // Nom correct du schéma
    domaine: String,
    questions: String
  }, { collection: 'entretien' }); // Spécification explicite de la collection
  
  module.exports = mongoose.model('Entretien', entretienSchema);