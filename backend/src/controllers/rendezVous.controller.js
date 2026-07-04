const RendezVous = require('../models/RendezVous');
const emailService = require('../services/email.service');

const notifyPatientForDecision = async (rdv) => {
  const statut = rdv?.statut;
  if (!['confirmé', 'annulé'].includes(statut)) return;

  const email = rdv.patient?.email || rdv.patientPublic?.email;
  if (!email) return;

  const patientPrenom = rdv.patient?.prenom || rdv.patientPublic?.prenom;
  const patientNom = rdv.patient?.nom || rdv.patientPublic?.nom;

  try {
    const result = await emailService.sendRendezVousDecision({
      email,
      patientPrenom,
      patientNom,
      statut,
      date: rdv.date,
      heure: rdv.heure,
      medecinPrenom: rdv.medecin?.prenom,
      medecinNom: rdv.medecin?.nom,
      motif: rdv.motif,
      reference: rdv.reference || rdv._id,
    });

    if (result?.skipped) {
      console.warn('⚠️  Notification RDV non envoyée :', result.reason);
      return;
    }

    console.log(
      `📧 Notification RDV envoyée à ${email} (messageId=${result?.messageId || 'n/a'})`
    );
  } catch (e) {
    console.warn('⚠️  Email patient non envoyé :', e.message);
  }
};

const getRendezVous = async (req, res, next) => {
  try {
    const { date, statut, startDate, endDate } = req.query;
    const filter = {};

    if (req.user.role === 'medecin') filter.medecin = req.user._id;
    if (statut) filter.statut = statut;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      // $lt lendemain minuit UTC pour inclure toute la journée finale
      const endOfRange = new Date(endDate);
      endOfRange.setDate(endOfRange.getDate() + 1);
      filter.date = { $gte: new Date(startDate), $lt: endOfRange };
    }

    const rdvList = await RendezVous.find(filter)
      .populate('patient', 'nom prenom telephone')
      .populate('medecin', 'nom prenom specialite')
      .sort({ date: 1, heure: 1 });

    res.json(rdvList);
  } catch (error) {
    next(error);
  }
};

const getRendezVousById = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'medecin') filter.medecin = req.user._id;

    const rdv = await RendezVous.findOne(filter)
      .populate('patient', 'nom prenom telephone')
      .populate('medecin', 'nom prenom specialite');

    if (!rdv) return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    res.json(rdv);
  } catch (error) {
    next(error);
  }
};

const createRendezVous = async (req, res, next) => {
  try {
    const rdv = await RendezVous.create({ ...req.body, medecin: req.user._id });
    await rdv.populate('patient', 'nom prenom');
    res.status(201).json(rdv);
  } catch (error) {
    next(error);
  }
};

const updateRendezVous = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'medecin') filter.medecin = req.user._id;

    const existingRdv = await RendezVous.findOne(filter).select('statut');
    if (!existingRdv) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

    const rdv = await RendezVous.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom');

    const nextStatut = req.body?.statut;
    if (
      ['confirmé', 'annulé'].includes(nextStatut) &&
      existingRdv.statut !== nextStatut
    ) {
      await notifyPatientForDecision(rdv);
    }

    res.json(rdv);
  } catch (error) {
    next(error);
  }
};

const cancelRendezVous = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'medecin') filter.medecin = req.user._id;

    const existingRdv = await RendezVous.findOne(filter).select('statut');
    if (!existingRdv) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

    const rdv = await RendezVous.findOneAndUpdate(
      filter,
      { statut: 'annulé' },
      { new: true }
    )
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom');

    if (existingRdv.statut !== 'annulé') {
      await notifyPatientForDecision(rdv);
    }

    res.json(rdv);
  } catch (error) {
    next(error);
  }
};

const deleteRendezVous = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'medecin') filter.medecin = req.user._id;

    const rdv = await RendezVous.findOne(filter)
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom');

    if (!rdv) return res.status(404).json({ message: 'Rendez-vous non trouvé' });

    await RendezVous.findOneAndDelete(filter);

    await notifyPatientForDecision({
      ...rdv,
      statut: 'annulé',
    });

    res.json({ message: 'Rendez-vous supprimé' });
  } catch (error) {
    next(error);
  }
};

const getCreneauxDisponibles = async (req, res, next) => {
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
};

module.exports = {
  getRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  cancelRendezVous,
  deleteRendezVous,
  getCreneauxDisponibles,
};
