const express = require('express');
const { createConsultation, getConsultationsByPatient, updateConsultation, deleteConsultation } = require('../controllers/consultation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('medecin'));

router.post('/', createConsultation);
router.get('/patient/:patientId', getConsultationsByPatient);
router.put('/:id', updateConsultation);
router.delete('/:id', deleteConsultation);

module.exports = router;
