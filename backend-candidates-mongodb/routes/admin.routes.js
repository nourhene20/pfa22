const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Admin non trouvé" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: admin._id }, 'votre_clé_secrète', { expiresIn: '1h' });
    res.status(200).json({ token, email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Création d'un admin (optionnelle)
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
