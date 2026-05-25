'use strict';
/**
 * mockSetup.js — Active le mode mock avant le chargement de app.js.
 *
 * Comment ça marche :
 *   1. On crée les MockModel pour chaque collection.
 *   2. On injecte ces instances dans require.cache AVANT que app.js ne
 *      charge les fichiers models/*.js — les controllers reçoivent donc
 *      le MockModel au lieu du modèle Mongoose réel.
 *   3. Quand MongoDB est disponible, cette fonction n'est JAMAIS appelée
 *      → les vrais modèles Mongoose s'appliquent sans aucun changement.
 */

const path = require('path');
const { MockModel, setAllStores } = require('./MockModel');
const mockData = require('./mockData');

function install() {
  // ── 1. Créer les stores (tableau mutable partagé) ──────────────────────
  const User             = new MockModel('User',             mockData.users);
  const Patient          = new MockModel('Patient',          mockData.patients);
  const RendezVous       = new MockModel('RendezVous',       mockData.rendezvous);
  const ConsultationNote = new MockModel('ConsultationNote', mockData.consultationNotes);

  // ── 2. Partager les stores pour les .populate() inter-modèles ──────────
  const stores = {
    User:             User._store,
    Patient:          Patient._store,
    RendezVous:       RendezVous._store,
    ConsultationNote: ConsultationNote._store,
  };
  setAllStores(stores);

  // ── 3. Injecter dans require.cache ─────────────────────────────────────
  const modelsDir = path.resolve(__dirname, '../models');
  const map = {
    'User.js':             User,
    'Patient.js':          Patient,
    'RendezVous.js':       RendezVous,
    'ConsultationNote.js': ConsultationNote,
  };

  for (const [filename, model] of Object.entries(map)) {
    const fullPath = path.join(modelsDir, filename);
    require.cache[fullPath] = {
      id:       fullPath,
      filename: fullPath,
      loaded:   true,
      exports:  model,
      parent:   null,
      children: [],
    };
  }

  console.log('🧪 Mode mock activé — données en mémoire (bcrypt admin@hospital.fr / Admin123!)');
  console.log('   Comptes disponibles :');
  console.log('     admin@hospital.fr   / Admin123!');
  console.log('     medecin1@hospital.fr / Medecin123!');
  console.log('     medecin2@hospital.fr / Medecin456!');
}

module.exports = { install };
