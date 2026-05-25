const Patient = require('../models/Patient');
const RendezVous = require('../models/RendezVous');
const User = require('../models/User');
const ConsultationNote = require('../models/ConsultationNote');

const getMedecinStats = async (req, res, next) => {
  try {
    const medecinId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      rdvAujourdhui,
      rdvEnAttente,
      rdvTotal,
      rdvPresent,
    ] = await Promise.all([
      Patient.countDocuments({ medecin: medecinId }),
      RendezVous.countDocuments({ medecin: medecinId, date: { $gte: today, $lt: tomorrow } }),
      RendezVous.countDocuments({ medecin: medecinId, statut: 'en attente' }),
      RendezVous.countDocuments({ medecin: medecinId, statut: { $in: ['présent', 'absent'] } }),
      RendezVous.countDocuments({ medecin: medecinId, statut: 'présent' }),
    ]);

    const tauxPresence = rdvTotal > 0 ? Math.round((rdvPresent / rdvTotal) * 100) : 0;

    const prochainRdv = await RendezVous.find({
      medecin: medecinId,
      date: { $gte: today, $lt: tomorrow },
      statut: { $in: ['en attente', 'confirmé'] },
    })
      .populate('patient', 'nom prenom')
      .sort({ heure: 1 })
      .limit(10);

    const pathologies = await Patient.aggregate([
      { $match: { medecin: medecinId, pathologie: { $exists: true, $ne: '' } } },
      { $group: { _id: '$pathologie', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const consultEvolution = await ConsultationNote.aggregate([
      { $match: { medecin: medecinId, date: { $gte: since30 } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalPatients,
      rdvAujourdhui,
      rdvEnAttente,
      tauxPresence,
      prochainRdv,
      pathologies,
      consultEvolution,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [totalMedecins, medecinActifs, totalPatients, rdvCeMois] = await Promise.all([
      User.countDocuments({ role: 'medecin' }),
      User.countDocuments({ role: 'medecin', actif: true }),
      Patient.countDocuments(),
      RendezVous.countDocuments({ date: { $gte: thisMonth } }),
    ]);

    res.json({
      totalMedecins,
      medecinActifs,
      medecinInactifs: totalMedecins - medecinActifs,
      totalPatients,
      rdvCeMois,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMedecinStats, getAdminStats };
