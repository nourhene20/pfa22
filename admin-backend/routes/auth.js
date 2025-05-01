const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'votre_clé_secrète';

// Authentification
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Admin introuvable' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign({ id: admin._id, email: admin.email }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Connexion réussie', token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
});

module.exports = router;
