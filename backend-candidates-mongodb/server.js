const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const candidateRoutes = require('./routes/candidate.routes');
//const adminRoutes = require('./routes/admin.routes'); // 👈 importer la route admin

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/candidates', candidateRoutes);
//app.use('/api/admin', adminRoutes); // 👈 ajouter la route

mongoose.connect('mongodb://localhost:27017/candidates', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connecté à MongoDB');
  app.listen(PORT, () => console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`));
}).catch(err => console.error('Erreur MongoDB :', err));