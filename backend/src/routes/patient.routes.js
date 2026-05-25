const express = require('express');
const { body } = require('express-validator');
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  updateNotesMedicales,
  deletePatient,
} = require('../controllers/patient.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getPatients);
router.get('/:id', getPatientById);

router.post(
  '/',
  [
    body('nom').trim().notEmpty().withMessage('Nom requis'),
    body('prenom').trim().notEmpty().withMessage('Prénom requis'),
    body('dateNaissance').isISO8601().withMessage('Date de naissance invalide'),
    body('telephone').trim().notEmpty().withMessage('Téléphone requis'),
  ],
  createPatient
);

router.put('/:id', updatePatient);
router.patch('/:id/notes', updateNotesMedicales);
router.delete('/:id', deletePatient);

module.exports = router;
