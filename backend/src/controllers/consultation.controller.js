const ConsultationNote = require('../models/ConsultationNote');
const Patient = require('../models/Patient');

const createConsultation = async (req, res, next) => {
  try {
    const consultation = await ConsultationNote.create({
      ...req.body,
      medecin: req.user._id,
      date: req.body.date || new Date(),
    });

    if (req.body.statutPatient) {
      await Patient.findOneAndUpdate(
        { _id: req.body.patient, medecin: req.user._id },
        { statut: req.body.statutPatient }
      );
    }

    await consultation.populate('medecin', 'nom prenom');
    res.status(201).json(consultation);
  } catch (error) {
    next(error);
  }
};

const updateConsultation = async (req, res, next) => {
  try {
    const consultation = await ConsultationNote.findOneAndUpdate(
      { _id: req.params.id, medecin: req.user._id },
      req.body,
      { new: true }
    ).populate('medecin', 'nom prenom');
    if (!consultation) return res.status(404).json({ message: 'Consultation non trouvée' });
    res.json(consultation);
  } catch (error) {
    next(error);
  }
};

const deleteConsultation = async (req, res, next) => {
  try {
    const result = await ConsultationNote.findOneAndDelete({
      _id: req.params.id,
      medecin: req.user._id,
    });
    if (!result) return res.status(404).json({ message: 'Consultation non trouvée' });
    res.json({ message: 'Consultation supprimée' });
  } catch (error) {
    next(error);
  }
};

const getConsultationsByPatient = async (req, res, next) => {
  try {
    const consultations = await ConsultationNote.find({ patient: req.params.patientId })
      .populate('medecin', 'nom prenom specialite')
      .sort({ date: -1 });
    res.json(consultations);
  } catch (error) {
    next(error);
  }
};

module.exports = { createConsultation, getConsultationsByPatient, updateConsultation, deleteConsultation };
