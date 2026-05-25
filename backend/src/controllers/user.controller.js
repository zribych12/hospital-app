const { validationResult } = require('express-validator');
const userService = require('../services/user.service');

const getMedecins = async (req, res, next) => {
  try {
    const medecins = await userService.getMedecins();
    res.json(medecins);
  } catch (error) {
    next(error);
  }
};

const getMedecinById = async (req, res, next) => {
  try {
    const medecin = await userService.getMedecinById(req.params.id);
    if (!medecin) return res.status(404).json({ message: 'Médecin non trouvé' });
    res.json(medecin);
  } catch (error) {
    next(error);
  }
};

const createMedecin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const result = await userService.createMedecin(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const toggleMedecinStatus = async (req, res, next) => {
  try {
    const medecin = await userService.toggleStatus(req.params.id);
    res.json(medecin);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await userService.resetPassword(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMedecins, getMedecinById, createMedecin, toggleMedecinStatus, resetPassword };
