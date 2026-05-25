require('dotenv').config();
const mongoose = require('mongoose');

const PORT     = process.env.PORT     || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_db';

(async () => {
  try {
    // Tente de se connecter à MongoDB (timeout 3 secondes)
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connecté à MongoDB');
  } catch {
    // MongoDB non disponible → active les mock models AVANT de charger app.js
    require('./src/db/mockSetup').install();
  }

  // app.js est chargé ICI — après la décision mock vs réel
  // Quand MongoDB sera disponible, il suffit de démarrer MongoDB : aucun changement de code.
  const app = require('./src/app');
  app.listen(PORT, () => {
    const mode = mongoose.connection.readyState === 1 ? 'MongoDB' : 'mock (mémoire)';
    console.log(`🚀 Serveur démarré sur le port ${PORT} [${mode}]`);
  });
})();
