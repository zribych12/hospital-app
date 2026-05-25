const express = require('express');
const { getMedecinStats, getAdminStats } = require('../controllers/stats.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/medecin', roleMiddleware('medecin'), getMedecinStats);
router.get('/admin', roleMiddleware('admin'), getAdminStats);

module.exports = router;
