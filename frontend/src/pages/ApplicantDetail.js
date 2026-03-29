import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ApplicantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applicant, setApplicant] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remainingSeats, setRemainingSeats] = useState(null);
  const [checkingSeats, setCheckingSeats] = useState(false);
  const [allocateForm, setAllocateForm] = useState({
    programId: '',
    quotaName: '',
    allotmentNumber: '',
  });

  const fetchApplicant = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/applicants/${id}`);
      setApplicant(response.data);
    } catch (error) {
      toast.error('Failed to fetch applicant details');
      navigate('/applicants');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchPrograms = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/masters/programs');
      setPrograms(response.data);
    } catch (error) {
      toast.error('Failed to fetch programs');
    }
  }, []);

  const filterProgramsByQuota = useCallback(async () => {
    if (!applicant || !applicant.quotaType) return;
    
    setCheckingSeats(true);
    const availablePrograms = [];
    
    for (const program of programs) {
      try {
        const response = await axios.get(`http://localhost:5000/api/applicants/remaining-seats/${program._id}/${applicant.quotaType}`);
        if (response.data.isAvailable) {
          availablePrograms.push({
            ...program,
            remainingSeats: response.data.remainingSeats,
            totalSeats: response.data.totalSeats,
            filledSeats: response.data.filledSeats
          });
        }
      } catch (error) {
        console.error(`Error checking seats for program ${program.name}:`, error);
      }
    }
    
    setFilteredPrograms(availablePrograms);
    setCheckingSeats(false);
    
    if (availablePrograms.length === 0) {
      toast.error(`No programs available with seats in ${applicant.quotaType} quota`);
    }
  }, [applicant, programs]);

  const checkRemainingSeats = useCallback(async () => {
    if (!allocateForm.programId || !allocateForm.quotaName) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/applicants/remaining-seats/${allocateForm.programId}/${allocateForm.quotaName}`);
      setRemainingSeats(response.data);
    } catch (error) {
      setRemainingSeats(null);
    }
  }, [allocateForm.programId, allocateForm.quotaName]);

  useEffect(() => {
    fetchApplicant();
    fetchPrograms();
  }, [fetchApplicant, fetchPrograms]);

  useEffect(() => {
    if (applicant && !applicant.program) {
      if (applicant.quotaType && !allocateForm.quotaName) {
        setAllocateForm(prev => ({
          ...prev,
          quotaName: applicant.quotaType
        }));
      }
      
      if (applicant.allotmentNumber && !allocateForm.allotmentNumber) {
        setAllocateForm(prev => ({
          ...prev,
          allotmentNumber: applicant.allotmentNumber
        }));
      }
    }
  }, [applicant, allocateForm.quotaName, allocateForm.allotmentNumber]);

  useEffect(() => {
    if (programs.length > 0 && applicant) {
      filterProgramsByQuota();
    }
  }, [programs, applicant, filterProgramsByQuota]);

  useEffect(() => {
    checkRemainingSeats();
  }, [checkRemainingSeats]);

  const handleAllocateSeat = async () => {
    if (!remainingSeats || !remainingSeats.isAvailable) {
      toast.error('No seats available in this quota');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/applicants/allocate', {
        applicantId: id,
        ...allocateForm,
      });
      toast.success(`✓ Seat allocated successfully! Remaining seats: ${response.data.remainingSeatsAfterAllocation}`);
      fetchApplicant();
      setRemainingSeats(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate seat');
    }
  };

  const handleUpdateDocuments = async (status) => {
    try {
      await axios.post('http://localhost:5000/api/applicants/documents', {
        applicantId: id,
        status,
      });
      toast.success(`✓ Documents ${status.toLowerCase()}`);
      fetchApplicant();
    } catch (error) {
      toast.error('Failed to update document status');
    }
  };

  const handleUpdateFee = async (feeStatus) => {
    try {
      await axios.post('http://localhost:5000/api/applicants/fee', {
        applicantId: id,
        feeStatus,
      });
      toast.success(`✓ Fee marked as ${feeStatus}`);
      fetchApplicant();
    } catch (error) {
      toast.error('Failed to update fee status');
    }
  };

  const handleConfirmAdmission = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/applicants/confirm', {
        applicantId: id,
      });
      toast.success(`✓ Admission confirmed! Admission Number: ${response.data.admissionNumber}`);
      toast.success('Redirecting to applicants list...');
      setTimeout(() => {
        navigate('/applicants');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm admission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading applicant details...</p>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return <div className="text-center text-gray-400">Applicant not found</div>;
  }

  const journeySteps = [
    { name: 'Create Applicant', completed: true, current: true },
    { name: applicant.quotaType === 'Management' ? 'Select Program & Check Availability' : 'Enter Allotment Details', 
      completed: applicant.allotmentNumber || applicant.program, current: !applicant.program },
    { name: 'Allocate Seat', completed: applicant.admissionStatus === 'Allocated' || applicant.admissionStatus === 'Confirmed', 
      current: applicant.admissionStatus === 'Pending' && (applicant.allotmentNumber || applicant.quotaType === 'Management') },
    { name: 'Verify Documents', completed: applicant.documents.status === 'Verified', 
      current: applicant.documents.status === 'Submitted' },
    { name: 'Fee Payment', completed: applicant.feeStatus === 'Paid', 
      current: applicant.feeStatus === 'Pending' && applicant.documents.status === 'Verified' },
    { name: 'Generate Admission Number', completed: applicant.admissionStatus === 'Confirmed', 
      current: applicant.admissionStatus === 'Allocated' && applicant.documents.status === 'Verified' && applicant.feeStatus === 'Paid' },
  ];

  const canAllocate = !applicant.program && 
    (user?.role === 'admin' || user?.role === 'admission_officer') &&
    applicant.admissionStatus === 'Pending';

  const canVerifyDocuments = applicant.documents.status !== 'Verified' &&
    (user?.role === 'admin' || user?.role === 'admission_officer');

  const canUpdateFee = applicant.feeStatus !== 'Paid' &&
    (user?.role === 'admin' || user?.role === 'admission_officer');

  const canConfirm = applicant.admissionStatus === 'Allocated' &&
    applicant.documents.status === 'Verified' &&
    applicant.feeStatus === 'Paid' &&
    (user?.role === 'admin' || user?.role === 'admission_officer');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Applicant Details</h1>
        <button
          onClick={() => navigate('/applicants')}
          className="btn-secondary"
        >
          Back to List
        </button>
      </div>

      <div className="mb-6 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Admission Journey Progress</h2>
        <div className="flex items-center justify-between">
          {journeySteps.map((step, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-500 text-white' : 
                step.current ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <p className={`text-xs mt-2 ${step.completed ? 'text-green-400' : step.current ? 'text-cyan-400 font-semibold' : 'text-gray-500'}`}>
                {step.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Personal Information</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Name:</strong> {applicant.fullName}</p>
            <p><strong>Email:</strong> {applicant.email}</p>
            <p><strong>Phone:</strong> {applicant.phone}</p>
            <p><strong>Date of Birth:</strong> {new Date(applicant.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>Address:</strong> {applicant.address}, {applicant.city}, {applicant.state} - {applicant.pincode}</p>
            <p><strong>Category:</strong> {applicant.category}</p>
            <p><strong>Entry Type:</strong> {applicant.entryType}</p>
            <p><strong>Quota Type:</strong> {applicant.quotaType}</p>
            <p><strong>Marks:</strong> {applicant.marks}%</p>
            <p><strong>Qualifying Exam:</strong> {applicant.qualifyingExam}</p>
            {applicant.allotmentNumber && (
              <p><strong>Allotment Number:</strong> <span className="font-mono bg-gray-700 px-2 py-1 rounded">{applicant.allotmentNumber}</span></p>
            )}
            {applicant.admissionNumber && (
              <p><strong>Admission Number:</strong> <span className="font-mono bg-green-900/30 text-green-400 px-2 py-1 rounded">{applicant.admissionNumber}</span></p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Admission Status</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-300">Program:</p>
              <p className="text-gray-400">{applicant.program?.name || 'Not Allocated'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Documents Status:</p>
              <p className={`inline-block px-2 py-1 rounded-full text-sm ${
                applicant.documents.status === 'Verified' ? 'bg-green-500/20 text-green-400' :
                applicant.documents.status === 'Submitted' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {applicant.documents.status}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Fee Status:</p>
              <p className={`inline-block px-2 py-1 rounded-full text-sm ${
                applicant.feeStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {applicant.feeStatus}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Admission Status:</p>
              <p className={`inline-block px-2 py-1 rounded-full text-sm ${
                applicant.admissionStatus === 'Confirmed' ? 'bg-green-500/20 text-green-400' :
                applicant.admissionStatus === 'Allocated' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {applicant.admissionStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {(user?.role === 'admin' || user?.role === 'admission_officer') && (
        <div className="mt-6 space-y-6">
          {canAllocate && (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">
                {applicant.quotaType === 'Management' ? 'Step 2 & 3: Select Program & Allocate Seat' : 'Step 2 & 3: Enter Allotment Details & Allocate Seat'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Program *</label>
                  {checkingSeats ? (
                    <div className="mt-2 text-gray-400">Loading available programs...</div>
                  ) : (
                    <>
                      <select
                        value={allocateForm.programId}
                        onChange={(e) => setAllocateForm({ ...allocateForm, programId: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select Program</option>
                        {filteredPrograms.map(program => (
                          <option key={program._id} value={program._id}>
                            {program.name} ({program.code}) - Available: {program.remainingSeats} / {program.totalSeats} seats
                          </option>
                        ))}
                      </select>
                      {filteredPrograms.length === 0 && !checkingSeats && (
                        <p className="mt-2 text-sm text-red-400">
                          No programs available with available seats in {applicant.quotaType} quota.
                        </p>
                      )}
                    </>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Quota *</label>
                  <input
                    type="text"
                    value={applicant.quotaType}
                    disabled
                    className="input-field bg-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Quota is pre-filled from applicant data and cannot be changed</p>
                </div>
                
                {(applicant.quotaType === 'KCET' || applicant.quotaType === 'COMEDK') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Allotment Number *</label>
                    <input
                      type="text"
                      value={applicant.allotmentNumber || ''}
                      disabled
                      className="input-field bg-gray-700 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Allotment number is pre-filled from applicant data and cannot be changed</p>
                  </div>
                )}
                
                {remainingSeats && (
                  <div className={`p-3 rounded-md ${remainingSeats.isAvailable ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <p className="text-sm font-medium text-gray-300">Seat Availability for Selected Program:</p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                      <div>Total Seats: <strong className="text-gray-200">{remainingSeats.totalSeats}</strong></div>
                      <div>Filled Seats: <strong className="text-gray-200">{remainingSeats.filledSeats}</strong></div>
                      <div>Available: <strong className={remainingSeats.isAvailable ? 'text-green-400' : 'text-red-400'}>
                        {remainingSeats.remainingSeats}
                      </strong></div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleAllocateSeat}
                  disabled={!remainingSeats || !remainingSeats.isAvailable || !allocateForm.programId || filteredPrograms.length === 0}
                  className={`btn-primary ${
                    remainingSeats && remainingSeats.isAvailable && allocateForm.programId && filteredPrograms.length > 0
                      ? ''
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Allocate Seat & Lock Seat
                </button>
              </div>
            </div>
          )}

          {canVerifyDocuments && (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Step 4: Document Verification</h2>
              <div className="space-x-4">
                <button
                  onClick={() => handleUpdateDocuments('Submitted')}
                  className="btn-secondary"
                >
                  Mark Documents as Submitted
                </button>
                <button
                  onClick={() => handleUpdateDocuments('Verified')}
                  className="btn-primary"
                >
                  Verify Documents
                </button>
              </div>
              {applicant.documents.status === 'Pending' && (
                <p className="text-sm text-gray-500 mt-2">→ First mark documents as submitted, then verify</p>
              )}
            </div>
          )}

          {canUpdateFee && (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Step 5: Fee Payment</h2>
              <button
                onClick={() => handleUpdateFee('Paid')}
                className="btn-primary"
              >
                Mark Fee as Paid
              </button>
            </div>
          )}

          {canConfirm && (
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Step 6: Generate Admission Number & Confirm</h2>
              <div className="bg-cyan-500/10 p-3 rounded-md mb-4 border border-cyan-500/30">
                <p className="text-sm font-medium text-cyan-400">Admission Number Format:</p>
                <p className="text-sm text-gray-300 font-mono">INSTITUTE_CODE/YEAR/COURSE_TYPE/PROGRAM_CODE/QUOTA_TYPE/SEQUENCE</p>
                <p className="text-xs text-gray-400 mt-1">Example: ABCE/2026/UG/CSE/KCET/0001</p>
              </div>
              <button
                onClick={handleConfirmAdmission}
                className="btn-primary"
              >
                Generate Admission Number & Confirm Admission
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicantDetail;