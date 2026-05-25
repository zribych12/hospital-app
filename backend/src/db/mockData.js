'use strict';
/**
 * Données mock en mémoire — simulées lorsque MongoDB n'est pas disponible.
 * Aucun changement requis dans les controllers/models/services.
 */

const bcrypt = require('bcryptjs');

// IDs stables pour les relations
const IDS = {
  admin:   'mock_user_admin_001',
  med1:    'mock_user_med_001',
  med2:    'mock_user_med_002',
  p1:      'mock_patient_001',
  p2:      'mock_patient_002',
  p3:      'mock_patient_003',
  p4:      'mock_patient_004',
  p5:      'mock_patient_005',
  rdv1:    'mock_rdv_001',
  rdv2:    'mock_rdv_002',
  rdv3:    'mock_rdv_003',
  rdv4:    'mock_rdv_004',
  rdv5:    'mock_rdv_005',
  cons1:   'mock_cons_001',
  cons2:   'mock_cons_002',
  cons3:   'mock_cons_003',
};

const now  = new Date().toISOString();
const today = new Date();
today.setHours(10, 0, 0, 0);
const yesterday = new Date(Date.now() - 86400000);
const tomorrow  = new Date(Date.now() + 86400000);

const hashSync = (pw) => bcrypt.hashSync(pw, 10);

// ─── Users ────────────────────────────────────────────────────────────────────
const users = [
  {
    _id:          IDS.admin,
    email:        'admin@hospital.fr',
    passwordHash: hashSync('Admin123!'),
    role:         'admin',
    nom:          'Dupont',
    prenom:       'Marie',
    specialite:   null,
    telephone:    '0612345678',
    actif:        true,
    createdAt:    now,
  },
  {
    _id:          IDS.med1,
    email:        'medecin1@hospital.fr',
    passwordHash: hashSync('Medecin123!'),
    role:         'medecin',
    nom:          'Martin',
    prenom:       'Pierre',
    specialite:   'Cardiologie',
    telephone:    '0623456789',
    actif:        true,
    createdAt:    now,
  },
  {
    _id:          IDS.med2,
    email:        'medecin2@hospital.fr',
    passwordHash: hashSync('Medecin456!'),
    role:         'medecin',
    nom:          'Bernard',
    prenom:       'Sophie',
    specialite:   'Neurologie',
    telephone:    '0634567890',
    actif:        true,
    createdAt:    now,
  },
];

// ─── Patients ─────────────────────────────────────────────────────────────────
const patients = [
  {
    _id:             IDS.p1,
    nom:             'Nguyen',
    prenom:          'Linh',
    dateNaissance:   new Date('1975-03-14').toISOString(),
    telephone:       '0645678901',
    email:           'linh.nguyen@mail.fr',
    adresse:         '12 rue des Lilas, Paris',
    medecin:         IDS.med1,
    statut:          'stable',
    pathologie:      'Hypertension',
    notesMedicales:  'Tension artérielle contrôlée. Suivi mensuel.',
    createdAt:       now,
  },
  {
    _id:             IDS.p2,
    nom:             'Moreau',
    prenom:          'Jean',
    dateNaissance:   new Date('1960-07-22').toISOString(),
    telephone:       '0656789012',
    email:           'jean.moreau@mail.fr',
    adresse:         '5 avenue Foch, Lyon',
    medecin:         IDS.med1,
    statut:          'en observation',
    pathologie:      'Insuffisance cardiaque',
    notesMedicales:  "Oedèmes des membres inférieurs. Hospitalisation envisagée si pas d'amélioration.",
    createdAt:       now,
  },
  {
    _id:             IDS.p3,
    nom:             'Bernard',
    prenom:          'Alice',
    dateNaissance:   new Date('1988-11-05').toISOString(),
    telephone:       '0667890123',
    email:           'alice.bernard@mail.fr',
    adresse:         '8 place Bellecour, Lyon',
    medecin:         IDS.med1,
    statut:          'critique',
    pathologie:      'Diabète type 2',
    notesMedicales:  'Glycémie très élevée. Traitement insuline en cours.',
    createdAt:       now,
  },
  {
    _id:             IDS.p4,
    nom:             'Petit',
    prenom:          'François',
    dateNaissance:   new Date('1945-01-30').toISOString(),
    telephone:       '0678901234',
    email:           'francois.petit@mail.fr',
    adresse:         '3 rue de la Paix, Marseille',
    medecin:         IDS.med2,
    statut:          'stable',
    pathologie:      'Migraine chronique',
    notesMedicales:  'Crises mensuelles. Triptans efficaces.',
    createdAt:       now,
  },
  {
    _id:             IDS.p5,
    nom:             'Rousseau',
    prenom:          'Marie',
    dateNaissance:   new Date('1990-09-18').toISOString(),
    telephone:       '0689012345',
    email:           'marie.rousseau@mail.fr',
    adresse:         '22 boulevard des Capucines, Nice',
    medecin:         IDS.med2,
    statut:          'guéri',
    pathologie:      'Épilepsie',
    notesMedicales:  'Pas de crise depuis 6 mois. Traitement antiépileptique maintenu.',
    createdAt:       now,
  },
];

// ─── RendezVous ───────────────────────────────────────────────────────────────
const rendezvous = [
  {
    _id:       IDS.rdv1,
    patient:   IDS.p1,
    medecin:   IDS.med1,
    date:      today.toISOString(),
    heure:     '09:00',
    type:      'consultation',
    statut:    'confirmé',
    motif:     'Contrôle tension artérielle',
    niveauUrgence: 'moyen',
    createdAt: now,
  },
  {
    _id:       IDS.rdv2,
    patient:   IDS.p2,
    medecin:   IDS.med1,
    date:      today.toISOString(),
    heure:     '10:30',
    type:      'suivi',
    statut:    'en attente',
    motif:     'Suivi insuffisance cardiaque',
    niveauUrgence: 'élevé',
    createdAt: now,
  },
  {
    _id:       IDS.rdv3,
    patient:   IDS.p3,
    medecin:   IDS.med1,
    date:      today.toISOString(),
    heure:     '14:00',
    type:      'urgence',
    statut:    'en attente',
    motif:     'Hyperglycémie sévère',
    niveauUrgence: 'élevé',
    createdAt: now,
  },
  {
    _id:       IDS.rdv4,
    patient:   IDS.p4,
    medecin:   IDS.med2,
    date:      tomorrow.toISOString(),
    heure:     '11:00',
    type:      'consultation',
    statut:    'en attente',
    motif:     'Crise migraineuse récente',
    niveauUrgence: 'faible',
    createdAt: now,
  },
  {
    _id:       IDS.rdv5,
    patient:   IDS.p1,
    medecin:   IDS.med1,
    date:      yesterday.toISOString(),
    heure:     '09:30',
    type:      'suivi',
    statut:    'présent',
    motif:     'Bilan mensuel',
    niveauUrgence: 'moyen',
    createdAt: now,
  },
];

// ─── ConsultationNotes ────────────────────────────────────────────────────────
const consultationNotes = [
  {
    _id:           IDS.cons1,
    patient:       IDS.p1,
    medecin:       IDS.med1,
    date:          yesterday.toISOString(),
    diagnostic:    'Hypertension artérielle contrôlée',
    traitement:    'Amlodipine 5mg/j + régime hyposodé',
    notes:         'Tension 130/80. Bon équilibre tensionnel.',
    statutPatient: 'stable',
    createdAt:     now,
  },
  {
    _id:           IDS.cons2,
    patient:       IDS.p2,
    medecin:       IDS.med1,
    date:          new Date(Date.now() - 7 * 86400000).toISOString(),
    diagnostic:    'Insuffisance cardiaque décompensée',
    traitement:    'Furosémide 40mg + Ramipril 5mg',
    notes:         "Oedèmes des membres inférieurs. Hospitalisation envisagée si pas d'amélioration.",
    statutPatient: 'en observation',
    createdAt:     now,
  },
  {
    _id:           IDS.cons3,
    patient:       IDS.p3,
    medecin:       IDS.med1,
    date:          new Date(Date.now() - 3 * 86400000).toISOString(),
    diagnostic:    'Déséquilibre glycémique sévère',
    traitement:    'Insuline Glargine 20UI/j + Metformine 1g x2/j',
    notes:         'HbA1c à 11.2%. Éducation thérapeutique indispensable.',
    statutPatient: 'critique',
    createdAt:     now,
  },
];

module.exports = { users, patients, rendezvous, consultationNotes };
