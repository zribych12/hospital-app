const { validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const ConsultationNote = require('../models/ConsultationNote');

const getPatients = async (req, res, next) => {
  try {
    const { statut, pathologie, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role === 'medecin') {
      filter.medecin = req.user._id;
    }
    if (statut) filter.statut = statut;
    if (pathologie) filter.pathologie = new RegExp(pathologie, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate('medecin', 'nom prenom specialite')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Patient.countDocuments(filter),
    ]);

    res.json({
      patients,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'medecin') filter.medecin = req.user._id;

    const patient = await Patient.findOne(filter).populate('medecin', 'nom prenom specialite');
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé' });

    const consultations = await ConsultationNote.find({ patient: patient._id })
      .populate('medecin', 'nom prenom')
      .sort({ date: -1 })
      .limit(20);

    res.json({ patient, consultations });
  } catch (error) {
    next(error);
  }
};

const createPatient = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const patient = await Patient.create({ ...req.body, medecin: req.user._id });
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, medecin: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé' });
    res.json(patient);
  } catch (error) {
    next(error);
  }
};

const updateNotesMedicales = async (req, res, next) => {
  try {
    const { notesMedicales, statut } = req.body;
    const update = {};
    if (notesMedicales !== undefined) update.notesMedicales = notesMedicales;
    if (statut) update.statut = statut;

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, medecin: req.user._id },
      update,
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé' });
    res.json(patient);
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndDelete({ _id: req.params.id, medecin: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé ou non autorisé' });
    res.json({ message: 'Patient supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatients, getPatientById, createPatient, updatePatient, updateNotesMedicales, deletePatient }
;
