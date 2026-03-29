const Applicant = require('../models/Applicant');
const Program = require('../models/Program');

// Create applicant
const createApplicant = async (req, res) => {
  try {
    const applicantData = req.body;
    const applicant = new Applicant(applicantData);
    await applicant.save();
    res.status(201).json(applicant);
  } catch (error) {
    res.status(500).json({ message: 'Error creating applicant', error: error.message });
  }
};

// Get all applicants
const getApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find().populate('program');
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applicants', error: error.message });
  }
};

// Get applicant by ID
const getApplicantById = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id).populate('program');
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    res.json(applicant);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applicant', error: error.message });
  }
};

// Update applicant
const updateApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    res.json(applicant);
  } catch (error) {
    res.status(500).json({ message: 'Error updating applicant', error: error.message });
  }
};

// Get remaining seats for a program and quota
const getRemainingSeats = async (req, res) => {
  try {
    const { programId, quotaName } = req.params;
    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    const quota = program.quotas.find(q => q.name === quotaName);
    if (!quota) {
      return res.status(400).json({ message: 'Invalid quota type' });
    }
    
    const remainingSeats = quota.seats - quota.filled;
    res.json({
      programName: program.name,
      quotaName,
      totalSeats: quota.seats,
      filledSeats: quota.filled,
      remainingSeats,
      isAvailable: remainingSeats > 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking seat availability', error: error.message });
  }
};

// Allocate seat with availability check
const allocateSeat = async (req, res) => {
  try {
    const { applicantId, programId, quotaName, allotmentNumber } = req.body;
    
    const applicant = await Applicant.findById(applicantId);
    const program = await Program.findById(programId);
    
    if (!applicant || !program) {
      return res.status(404).json({ message: 'Applicant or Program not found' });
    }
    
    // Find the quota
    const quota = program.quotas.find(q => q.name === quotaName);
    if (!quota) {
      return res.status(400).json({ message: 'Invalid quota type' });
    }
    
    // Check seat availability before allocation
    if (quota.filled >= quota.seats) {
      return res.status(400).json({ 
        message: `No seats available in ${quotaName} quota. Total: ${quota.seats}, Filled: ${quota.filled}` 
      });
    }
    
    // Check if applicant is already allocated
    if (applicant.admissionStatus === 'Allocated' || applicant.admissionStatus === 'Confirmed') {
      return res.status(400).json({ message: 'Applicant already has an allocation' });
    }
    
    // Show remaining seats before allocation
    const remainingBeforeAllocation = quota.seats - quota.filled;
    
    // Allocate seat
    quota.filled += 1;
    await program.save();
    
    applicant.program = programId;
    applicant.quotaType = quotaName;
    if (allotmentNumber) {
      applicant.allotmentNumber = allotmentNumber;
    }
    applicant.admissionStatus = 'Allocated';
    applicant.allocationDate = new Date();
    await applicant.save();
    
    res.json({ 
      message: 'Seat allocated successfully',
      remainingSeatsAfterAllocation: quota.seats - quota.filled,
      remainingBeforeAllocation,
      applicant 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error allocating seat', error: error.message });
  }
};

// Generate unique admission number
const generateAdmissionNumber = async (applicant, program) => {
  const year = new Date().getFullYear();
  const programCode = program.code || program.name.substring(0, 3).toUpperCase();
  const quotaCode = applicant.quotaType;
  
  // Get the last admission number to generate sequence
  const lastApplicant = await Applicant.findOne({
    admissionNumber: { $regex: `${program.department?.name || 'INST'}/${year}/${program.courseType}/${programCode}/${quotaCode}/`, $exists: true }
  }).sort({ admissionNumber: -1 });
  
  let sequence = 1;
  if (lastApplicant && lastApplicant.admissionNumber) {
    const lastSeq = parseInt(lastApplicant.admissionNumber.split('/').pop());
    sequence = lastSeq + 1;
  }
  
  const admissionNumber = `${program.department?.name || 'INST'}/${year}/${program.courseType}/${programCode}/${quotaCode}/${String(sequence).padStart(4, '0')}`;
  return admissionNumber;
};

// Confirm admission with fee and document verification
const confirmAdmission = async (req, res) => {
  try {
    const { applicantId } = req.body;
    const applicant = await Applicant.findById(applicantId).populate('program');
    
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    
    // Check if documents are verified
    if (applicant.documents.status !== 'Verified') {
      return res.status(400).json({ 
        message: 'Documents must be verified before confirmation. Current status: ' + applicant.documents.status 
      });
    }
    
    // Check if fee is paid
    if (applicant.feeStatus !== 'Paid') {
      return res.status(400).json({ 
        message: 'Fee must be paid before confirmation. Current status: ' + applicant.feeStatus 
      });
    }
    
    // Check if already confirmed
    if (applicant.admissionStatus === 'Confirmed') {
      return res.status(400).json({ message: 'Admission already confirmed' });
    }
    
    // Check if seat is allocated
    if (applicant.admissionStatus !== 'Allocated') {
      return res.status(400).json({ 
        message: 'Seat must be allocated before confirmation. Current status: ' + applicant.admissionStatus 
      });
    }
    
    // Generate unique and immutable admission number
    const admissionNumber = await generateAdmissionNumber(applicant, applicant.program);
    
    applicant.admissionNumber = admissionNumber;
    applicant.admissionStatus = 'Confirmed';
    applicant.confirmationDate = new Date();
    await applicant.save();
    
    res.json({ 
      message: 'Admission confirmed successfully',
      admissionNumber,
      applicant 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming admission', error: error.message });
  }
};

// Update document status
const updateDocumentStatus = async (req, res) => {
  try {
    const { applicantId, status, remarks } = req.body;
    const applicant = await Applicant.findById(applicantId);
    
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    
    const validStatuses = ['Pending', 'Submitted', 'Verified'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid document status' });
    }
    
    applicant.documents.status = status;
    if (remarks) {
      applicant.documents.remarks = remarks;
    }
    await applicant.save();
    
    res.json({ 
      message: `Document status updated to ${status}`,
      applicant 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating document status', error: error.message });
  }
};

// Update fee status
const updateFeeStatus = async (req, res) => {
  try {
    const { applicantId, feeStatus } = req.body;
    const applicant = await Applicant.findById(applicantId);
    
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    
    const validStatuses = ['Pending', 'Paid'];
    if (!validStatuses.includes(feeStatus)) {
      return res.status(400).json({ message: 'Invalid fee status' });
    }
    
    applicant.feeStatus = feeStatus;
    await applicant.save();
    
    res.json({ 
      message: `Fee status updated to ${feeStatus}`,
      applicant 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating fee status', error: error.message });
  }
};

module.exports = {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicant,
  getRemainingSeats,
  allocateSeat,
  confirmAdmission,
  updateDocumentStatus,
  updateFeeStatus,
};