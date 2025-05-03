const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate.model');
const Link = require('../models/link.model');
const File = require('../models/file');
const fs = require('fs');
const path = require('path');

// ✅ Fonction pour retirer les champs null/undefined
function removeNullFields(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)
  );
}

// ✅ Extraire date depuis le nom du fichier (format : reponses_2025-05-03T10-15-30.txt)
function extractDateFromFilename(filepath) {
  if (!filepath) return null;

  const match = filepath.match(/reponses_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
  if (match && match[1]) {
    const iso = match[1].replace(/T(\d{2})-(\d{2})-(\d{2})/, (_, h, m, s) => `T${h}:${m}:${s}`);
    return new Date(iso);
  }

  return null;
}

// ✅ GET /api/results → liste des résultats complets
router.get('/results', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    console.log('📋 Candidats trouvés :', candidates.length);

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const file = await File.findOne({ candidateId: candidate._id.toString() });

          if (!file) return null; // Ignorer ceux sans fichiers

          const link = await Link.findOne({ email: candidate.email });

          const result = {
            nom: candidate.nom,
            prenom: candidate.prenom,
            email: candidate.email,
            domaine: candidate.domaine,
            telephone: candidate.telephone,
            filepath: file?.filepath || null,
            videopath: file?.videopath || null,
            dateDebut: link?.dateDebut || null,
            dateFin: link?.dateFin || null,
            dateEntretien: extractDateFromFilename(file?.filepath)
          };

          return removeNullFields(result);
        } catch (err) {
          console.error(`❌ Erreur pour ${candidate.email} :`, err.message);
          return null;
        }
      })
    );

    res.json(results.filter(r => r !== null));
  } catch (error) {
    console.error('❌ Erreur serveur globale :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ DELETE /api/results/:email → suppression complète d'un candidat
router.delete('/results/:email', async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  try {
    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    // Supprimer les fichiers physiques
    const files = await File.find({ candidateId: candidate._id });

    for (const f of files) {
      if (f.filepath) {
        const textPath = path.join(__dirname, '..', f.filepath);
        if (fs.existsSync(textPath)) fs.unlinkSync(textPath);
      }
      if (f.videopath) {
        const videoPath = path.join(__dirname, '..', f.videopath);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      }
    }

    // Supprimer de la base de données
    await File.deleteMany({ candidateId: candidate._id });
    await Link.deleteMany({ email });

    res.status(200).json({ message: '✅ Données du candidat supprimées avec succès' });
  } catch (err) {
    console.error('❌ Erreur suppression :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression' });
  }
});

module.exports = router;
