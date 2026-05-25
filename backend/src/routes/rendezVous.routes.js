const express = require('express');
const {
  getRendezVous,
  getRendezVousById,
  createRendezVous,
  updateRendezVous,
  cancelRendezVous,
  getCreneauxDisponibles,
} = require('../controllers/rendezVous.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRendezVous);
router.get('/creneaux', getCreneauxDisponibles);
router.get('/:id', getRendezVousById);
router.post('/', createRendezVous);
router.put('/:id', updateRendezVous);
router.patch('/:id/annuler', cancelRendezVous);

module.exports = router;
