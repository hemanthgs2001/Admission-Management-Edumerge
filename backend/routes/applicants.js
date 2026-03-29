const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicant,
  getRemainingSeats,
  allocateSeat,
  confirmAdmission,
  updateDocumentStatus,
  updateFeeStatus,
} = require('../controllers/applicantController');

router.use(authMiddleware);

// Routes accessible by admission officer and admin
router.post('/', roleMiddleware('admission_officer', 'admin'), createApplicant);
router.get('/', roleMiddleware('admission_officer', 'admin', 'management'), getApplicants);
router.get('/:id', roleMiddleware('admission_officer', 'admin', 'management'), getApplicantById);
router.put('/:id', roleMiddleware('admission_officer', 'admin'), updateApplicant);

// Get remaining seats before allocation
router.get('/remaining-seats/:programId/:quotaName', roleMiddleware('admission_officer', 'admin'), getRemainingSeats);

// Seat allocation with availability check
router.post('/allocate', roleMiddleware('admission_officer', 'admin'), allocateSeat);

// Admission confirmation with fee and document check
router.post('/confirm', roleMiddleware('admission_officer', 'admin'), confirmAdmission);

// Document and fee management
router.post('/documents', roleMiddleware('admission_officer', 'admin'), updateDocumentStatus);
router.post('/fee', roleMiddleware('admission_officer', 'admin'), updateFeeStatus);

module.exports = router;