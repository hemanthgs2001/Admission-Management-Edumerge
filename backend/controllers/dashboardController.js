const Program = require('../models/Program');
const Applicant = require('../models/Applicant');

const getDashboardData = async (req, res) => {
  try {
    const programs = await Program.find();
    const applicants = await Applicant.find();
    
    // Calculate total intake vs admitted
    let totalIntake = 0;
    let totalAdmitted = 0;
    const quotaWiseData = {
      KCET: { total: 0, filled: 0 },
      COMEDK: { total: 0, filled: 0 },
      Management: { total: 0, filled: 0 },
    };
    
    programs.forEach(program => {
      totalIntake += program.totalIntake;
      program.quotas.forEach(quota => {
        quotaWiseData[quota.name].total += quota.seats;
        quotaWiseData[quota.name].filled += quota.filled;
        totalAdmitted += quota.filled;
      });
    });
    
    // Calculate remaining seats
    const remainingSeats = totalIntake - totalAdmitted;
    
    // Calculate applicants with pending documents
    const pendingDocuments = applicants.filter(a => a.documents.status === 'Pending').length;
    const submittedDocuments = applicants.filter(a => a.documents.status === 'Submitted').length;
    const verifiedDocuments = applicants.filter(a => a.documents.status === 'Verified').length;
    
    // Calculate fee status
    const feePaid = applicants.filter(a => a.feeStatus === 'Paid').length;
    const feePending = applicants.filter(a => a.feeStatus === 'Pending').length;
    
    // Calculate admission status
    const admitted = applicants.filter(a => a.admissionStatus === 'Confirmed').length;
    const allocated = applicants.filter(a => a.admissionStatus === 'Allocated').length;
    const pending = applicants.filter(a => a.admissionStatus === 'Pending').length;
    
    res.json({
      summary: {
        totalIntake,
        totalAdmitted,
        remainingSeats,
        admissionPercentage: totalIntake > 0 ? (totalAdmitted / totalIntake * 100).toFixed(2) : 0,
      },
      quotaWise: quotaWiseData,
      documents: {
        pending: pendingDocuments,
        submitted: submittedDocuments,
        verified: verifiedDocuments,
      },
      fees: {
        paid: feePaid,
        pending: feePending,
      },
      admissionStatus: {
        confirmed: admitted,
        allocated,
        pending,
      },
      programs: programs.map(p => ({
        name: p.name,
        totalIntake: p.totalIntake,
        filled: p.quotas.reduce((sum, q) => sum + q.filled, 0),
        remaining: p.totalIntake - p.quotas.reduce((sum, q) => sum + q.filled, 0),
        quotas: p.quotas,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

module.exports = { getDashboardData };