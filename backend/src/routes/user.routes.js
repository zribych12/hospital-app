const express = require('express');
const { body } = require('express-validator');
const {
  getMedecins,
  getMedecinById,
  createMedecin,
  toggleMedecinStatus,
  resetPassword,
} = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/medecins', getMedecins);
router.get('/medecins/:id', getMedecinById);

router.post(
  '/medecins',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('nom').trim().notEmpty().withMessage('Nom requis'),
    body('prenom').trim().notEmpty().withMessage('Prénom requis'),
    body('specialite').trim().notEmpty().withMessage('Spécialité requise'),
  ],
  createMedecin
);

router.patch('/medecins/:id/toggle-status', toggleMedecinStatus);
router.patch('/medecins/:id/reset-password', resetPassword);

module.exports = router;
