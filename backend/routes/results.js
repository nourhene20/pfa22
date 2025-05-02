const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate.model');
const Link = require('../models/link.model');
const File = require('../models/file');

// ✅ Fonction utilitaire pour supprimer les champs null/undefined
function removeNullFields(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)
  );
}

router.get('/results', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    console.log('📋 Candidats trouvés :', candidates.length);

    const results = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const file = await File.findOne({ candidateId: candidate._id.toString() });

          // ❌ S'il n'a pas passé l'entretien, on l'ignore
          if (!file) return null;

          const link = await Link.findOne({ email: candidate.email });

          const result = {
            nom: candidate.nom,
            prenom: candidate.prenom,
            email: candidate.email,
            domaine:candidate.domaine,
            telephone: candidate.telephone,
            filepath: file?.filepath || null,
            videopath: file?.videopath || null,
            dateDebut: link?.dateDebut || null,
            dateFin: link?.dateFin || null
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

module.exports = router;
