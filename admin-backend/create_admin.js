// create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/admin'); // assure-toi que ce chemin est correct

mongoose.connect('mongodb://localhost:27017/admin-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connecté à MongoDB');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = new Admin({
    email: 'zouhour@admin.com',
    password: hashedPassword
  });

  await admin.save();
  console.log('✅ Admin ajouté avec succès');

  mongoose.disconnect();
}).catch(err => {
  console.error('❌ Erreur MongoDB :', err);
});
