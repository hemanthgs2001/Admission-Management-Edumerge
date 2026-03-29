const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { getDashboardData } = require('../controllers/dashboardController');

router.use(authMiddleware);
router.get('/', roleMiddleware('admin', 'admission_officer', 'management'), getDashboardData);

module.exports = router;