const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  createInstitution,
  getInstitutions,
  createCampus,
  getCampuses,
  createDepartment,
  getDepartments,
  createProgram,
  getPrograms,
  updateProgram,
} = require('../controllers/masterController');

// GET endpoints - accessible by admin and admission_officer
router.use(authMiddleware);

// Get programs - accessible by admin and admission_officer
router.get('/programs', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'admission_officer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
}, getPrograms);

// Get institutions - accessible by admin and admission_officer
router.get('/institutions', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'admission_officer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
}, getInstitutions);

// Get campuses - accessible by admin and admission_officer
router.get('/campuses', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'admission_officer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
}, getCampuses);

// Get departments - accessible by admin and admission_officer
router.get('/departments', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'admission_officer') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
}, getDepartments);

// POST, PUT endpoints - only admin
router.post('/institutions', roleMiddleware('admin'), createInstitution);
router.post('/campuses', roleMiddleware('admin'), createCampus);
router.post('/departments', roleMiddleware('admin'), createDepartment);
router.post('/programs', roleMiddleware('admin'), createProgram);
router.put('/programs/:id', roleMiddleware('admin'), updateProgram);

module.exports = router;