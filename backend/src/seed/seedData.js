require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const RendezVous = require('../models/RendezVous');
const ConsultationNote = require('../models/ConsultationNote');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_db';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connecté à MongoDB — démarrage du seed...');

  // Nettoyage
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    RendezVous.deleteMany({}),
    ConsultationNote.deleteMany({}),
  ]);

  const hash = (pwd) => bcrypt.hash(pwd, 12);

  // ── Utilisateurs ────────────────────────────────────────────────────────────
  const [adminHash, med1Hash, med2Hash, med3Hash] = await Promise.all([
    hash('Admin@2024'),
    hash('Medecin@2024'),
    hash('Medecin@2024'),
    hash('Medecin@2024'),
  ]);

  const admin = await User.create({
    email: 'admin@hopital.fr',
    passwordHash: adminHash,
    role: 'admin',
    nom: 'Dupont',
    prenom: 'Claire',
    actif: true,
  });

  const [med1, med2, med3] = await User.insertMany([
    {
      email: 'bernard.martin@hopital.fr',
      passwordHash: med1Hash,
      role: 'medecin',
      nom: 'Martin',
      prenom: 'Bernard',
      specialite: 'Cardiologie',
      actif: true,
    },
    {
      email: 'sophie.leroy@hopital.fr',
      passwordHash: med2Hash,
      role: 'medecin',
      nom: 'Leroy',
      prenom: 'Sophie',
      specialite: 'Neurologie',
      actif: true,
    },
    {
      email: 'pierre.dubois@hopital.fr',
      passwordHash: med3Hash,
      role: 'medecin',
      nom: 'Dubois',
      prenom: 'Pierre',
      specialite: 'Pneumologie',
      actif: false,
    },
  ]);

  // ── Patients ─────────────────────────────────────────────────────────────────
  const patientsData = [
    { nom: 'Nguyen', prenom: 'Linh', dateNaissance: new Date('1975-03-14'), telephone: '0601020304', email: 'linh.nguyen@mail.com', pathologie: 'Hypertension', statut: 'stable', medecin: med1._id },
    { nom: 'Moreau', prenom: 'Jean', dateNaissance: new Date('1960-07-22'), telephone: '0611223344', pathologie: 'Insuffisance cardiaque', statut: 'en observation', medecin: med1._id },
    { nom: 'Bernard', prenom: 'Alice', dateNaissance: new Date('1988-11-05'), telephone: '0622334455', pathologie: 'Arythmie', statut: 'stable', medecin: med1._id },
    { nom: 'Petit', prenom: 'François', dateNaissance: new Date('1945-01-30'), telephone: '0633445566', pathologie: 'Coronaropathie', statut: 'critique', medecin: med1._id },
    { nom: 'Rousseau', prenom: 'Marie', dateNaissance: new Date('1990-09-18'), telephone: '0644556677', email: 'marie.rousseau@mail.com', pathologie: 'Migraine chronique', statut: 'stable', medecin: med2._id },
    { nom: 'Laurent', prenom: 'Thomas', dateNaissance: new Date('1982-04-12'), telephone: '0655667788', pathologie: 'Épilepsie', statut: 'en observation', medecin: med2._id },
    { nom: 'Simon', prenom: 'Isabelle', dateNaissance: new Date('1995-06-25'), telephone: '0666778899', pathologie: 'Sclérose en plaques', statut: 'stable', medecin: med2._id },
    { nom: 'Michel', prenom: 'Robert', dateNaissance: new Date('1952-12-03'), telephone: '0677889900', pathologie: 'BPCO', statut: 'critique', medecin: med3._id },
    { nom: 'Garcia', prenom: 'Ana', dateNaissance: new Date('1978-08-17'), telephone: '0688990011', pathologie: 'Asthme', statut: 'guéri', medecin: med3._id },
  ];

  const patients = await Patient.insertMany(patientsData);

  // ── Rendez-vous ──────────────────────────────────────────────────────────────
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await RendezVous.insertMany([
    { patient: patients[0]._id, medecin: med1._id, date: today, heure: '09:00', motif: 'Contrôle tension', type: 'suivi', statut: 'confirmé', niveauUrgence: 'faible' },
    { patient: patients[1]._id, medecin: med1._id, date: today, heure: '10:30', motif: 'Bilan cardiaque', type: 'consultation', statut: 'en attente', niveauUrgence: 'moyen' },
    { patient: patients[2]._id, medecin: med1._id, date: today, heure: '14:00', motif: 'ECG de contrôle', type: 'suivi', statut: 'présent', niveauUrgence: 'faible' },
    { patient: patients[3]._id, medecin: med1._id, date: today, heure: '15:30', motif: 'Urgence cardiaque', type: 'urgence', statut: 'en attente', niveauUrgence: 'élevé' },
    { patient: patients[4]._id, medecin: med2._id, date: today, heure: '08:30', motif: 'Suivi migraine', type: 'suivi', statut: 'confirmé', niveauUrgence: 'faible' },
    { patient: patients[0]._id, medecin: med1._id, date: tomorrow, heure: '09:00', motif: 'Résultats bilan', type: 'consultation', statut: 'en attente', niveauUrgence: 'faible' },
    { patient: patients[1]._id, medecin: med1._id, date: yesterday, heure: '11:00', motif: 'Contrôle mensuel', type: 'suivi', statut: 'présent', niveauUrgence: 'faible' },
    {
      medecin: med1._id,
      date: tomorrow,
      heure: '11:00',
      motif: 'Douleur thoracique',
      type: 'urgence',
      statut: 'en attente',
      niveauUrgence: 'élevé',
      patientPublic: { nom: 'Durand', prenom: 'Paul', telephone: '0612345678', email: 'paul.durand@mail.com' },
    },
  ]);

  // ── Notes de consultation ────────────────────────────────────────────────────
  await ConsultationNote.insertMany([
    {
      patient: patients[0]._id,
      medecin: med1._id,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      diagnostic: 'Hypertension artérielle contrôlée',
      traitement: 'Amlodipine 5mg',
      notes: 'Patient observant, tension stabilisée à 130/85',
      statutPatient: 'stable',
    },
    {
      patient: patients[1]._id,
      medecin: med1._id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      diagnostic: 'Insuffisance cardiaque décompensée',
      traitement: 'Furosémide 40mg + Ramipril 5mg',
      notes: 'Œdèmes des membres inférieurs. Hospitalisation envisagée si pas d\'amélioration.',
      statutPatient: 'en observation',
    },
    {
      patient: patients[3]._id,
      medecin: med1._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      diagnostic: 'Angor instable',
      traitement: 'Aspirine 100mg + Bêtabloquant',
      notes: 'Transfert en cardiologie interventionnelle prévu',
      statutPatient: 'critique',
    },
  ]);

  console.log('✅ Seed terminé avec succès !');
  console.log('');
  console.log('Comptes de test :');
  console.log('  Admin  → admin@hopital.fr        / Admin@2024');
  console.log('  Médecin→ bernard.martin@hopital.fr / Medecin@2024');
  console.log('  Médecin→ sophie.leroy@hopital.fr   / Medecin@2024');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Erreur seed :', err);
  process.exit(1);
});
