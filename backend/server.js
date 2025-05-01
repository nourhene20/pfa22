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
  // Modèle amélioré avec validation
const interviewSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: true,
    index: true
  },
  responses: {
    type: String,
    required: true
  },
  video: {
    type: Buffer,
    required: true,
    validate: {
      validator: v => v.length < 100 * 1024 * 1024, // 100MB max
      message: 'La vidéo dépasse la taille maximale autorisée'
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});