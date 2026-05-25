const express = require('express');
const User = require('../models/User');
const RendezVous = require('../models/RendezVous');

const router = express.Router();

// Liste des médecins actifs (pour le formulaire public)
router.get('/medecins', async (req, res, next) => {
  try {
    const medecins = await User.find({ role: 'medecin', actif: true })
      .select('nom prenom specialite')
      .sort({ nom: 1 });
    res.json(medecins);
  } catch (error) {
    next(error);
  }
});

// Créneaux disponibles (sans authentification)
router.get('/creneaux', async (req, res, next) => {
  try {
    const { medecinId, date } = req.query;
    if (!medecinId || !date) {
      return res.status(400).json({ message: 'medecinId et date requis' });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const existants = await RendezVous.find({
      medecin: medecinId,
      date: { $gte: start, $lte: end },
      statut: { $ne: 'annulé' },
    }).select('heure');

    const taken = new Set(existants.map((r) => r.heure));
    const slots = [];
    for (let h = 8; h < 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (!taken.has(slot)) slots.push(slot);
      }
    }
    res.json(slots);
  } catch (error) {
    next(error);
  }
});

// Prise de rendez-vous public (sans compte)
router.post('/rendez-vous', async (req, res, next) => {
  try {
    const { nom, prenom, dateNaissance, telephone, email, medecinId, motif, niveauUrgence, date, heure } =
      req.body;

    if (!nom || !prenom || !telephone || !medecinId || !motif || !date || !heure) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const rdv = await RendezVous.create({
      medecin: medecinId,
      date: new Date(date),
      heure,
      motif,
      niveauUrgence: niveauUrgence || 'faible',
      statut: 'en attente',
      patientPublic: { nom, prenom, dateNaissance, telephone, email },
    });

    res.status(201).json({ message: 'Rendez-vous créé avec succès', reference: rdv.reference });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
