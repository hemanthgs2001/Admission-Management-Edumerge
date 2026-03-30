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

  const [activeStep, setActiveStep] = useState(0);

  // Document verification checkbox state
  const [docChecks, setDocChecks] = useState({
    submitted: false,
    verified: false,
  });

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
        const response = await axios.get(
          `http://localhost:5000/api/applicants/remaining-seats/${program._id}/${applicant.quotaType}`
        );
        if (response.data.isAvailable) {
          availablePrograms.push({
            ...program,
            remainingSeats: response.data.remainingSeats,
            totalSeats: response.data.totalSeats,
            filledSeats: response.data.filledSeats,
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
      const response = await axios.get(
        `http://localhost:5000/api/applicants/remaining-seats/${allocateForm.programId}/${allocateForm.quotaName}`
      );
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
      // Pre-fill quotaName from applicant.quotaType
      if (applicant.quotaType && !allocateForm.quotaName) {
        setAllocateForm(prev => ({ ...prev, quotaName: applicant.quotaType }));
      }
      // Pre-fill allotmentNumber from applicant.allotmentNumber
      if (applicant.allotmentNumber && !allocateForm.allotmentNumber) {
        setAllocateForm(prev => ({ ...prev, allotmentNumber: applicant.allotmentNumber }));
      }
    }

    // If applicant already has a program assigned, pre-fill programId too
    if (applicant && applicant.program) {
      const programId = applicant.program._id || applicant.program;
      if (programId && !allocateForm.programId) {
        setAllocateForm(prev => ({ ...prev, programId }));
      }
    }
  }, [applicant, allocateForm.quotaName, allocateForm.allotmentNumber, allocateForm.programId]);

  useEffect(() => {
    if (programs.length > 0 && applicant) {
      filterProgramsByQuota();
    }
  }, [programs, applicant, filterProgramsByQuota]);

  useEffect(() => {
    checkRemainingSeats();
  }, [checkRemainingSeats]);

  useEffect(() => {
    if (!applicant) return;
    if (applicant.admissionStatus === 'Confirmed') {
      setActiveStep(3);
    } else if (
      applicant.admissionStatus === 'Allocated' &&
      applicant.documents.status === 'Verified' &&
      applicant.feeStatus === 'Paid'
    ) {
      setActiveStep(3);
    } else if (
      applicant.admissionStatus === 'Allocated' &&
      applicant.documents.status === 'Verified'
    ) {
      setActiveStep(2);
    } else if (applicant.admissionStatus === 'Allocated') {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }

    // Sync checkbox state to actual document status
    setDocChecks({
      submitted: applicant.documents.status === 'Submitted' || applicant.documents.status === 'Verified',
      verified: applicant.documents.status === 'Verified',
    });
  }, [applicant]);

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
      toast.success(
        `✓ Seat allocated successfully! Remaining seats: ${response.data.remainingSeatsAfterAllocation}`
      );
      fetchApplicant();
      setRemainingSeats(null);
      setActiveStep(1); // Advance to Document Verification
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to allocate seat');
    }
  };

  const handleDocCheckChange = async (checkKey) => {
    if (applicant.documents.status === 'Verified') return; // already locked

    const newChecks = { ...docChecks };

    if (checkKey === 'submitted') {
      // Toggle submitted; if unchecking, also uncheck verified
      const newVal = !newChecks.submitted;
      newChecks.submitted = newVal;
      if (!newVal) newChecks.verified = false;
    } else if (checkKey === 'verified') {
      // Can only check verified if submitted is already checked
      if (!newChecks.submitted) {
        toast.error('Please mark documents as submitted first');
        return;
      }
      newChecks.verified = !newChecks.verified;
    }

    setDocChecks(newChecks);

    // Determine which API status to send
    let statusToSend = null;
    if (newChecks.verified) statusToSend = 'Verified';
    else if (newChecks.submitted) statusToSend = 'Submitted';

    if (statusToSend) {
      try {
        await axios.post('http://localhost:5000/api/applicants/documents', {
          applicantId: id,
          status: statusToSend,
        });
        toast.success(`✓ Documents ${statusToSend.toLowerCase()}`);
        fetchApplicant();
        if (statusToSend === 'Verified') {
          setActiveStep(2); // Advance to Fee Payment
        }
      } catch (error) {
        toast.error('Failed to update document status');
        setDocChecks(docChecks); // revert on error
      }
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
      if (feeStatus === 'Paid') {
        setActiveStep(3); // Advance to Confirm Admission
      }
    } catch (error) {
      toast.error('Failed to update fee status');
    }
  };

  const handleConfirmAdmission = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/applicants/confirm', {
        applicantId: id,
      });
      toast.success(
        `✓ Admission confirmed! Admission Number: ${response.data.admissionNumber}`
      );
      toast.success('Redirecting to applicants list...');
      setTimeout(() => navigate('/applicants'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm admission');
    }
  };
  const isStaff =
    user?.role === 'admin' || user?.role === 'admission_officer';

  const canAllocate =
    !applicant?.program &&
    isStaff &&
    applicant?.admissionStatus === 'Pending';

  const canVerifyDocuments =
    applicant?.documents.status !== 'Verified' && isStaff;

  const canUpdateFee = applicant?.feeStatus !== 'Paid' && isStaff;

  const canConfirm =
    applicant?.admissionStatus === 'Allocated' &&
    applicant?.documents.status === 'Verified' &&
    applicant?.feeStatus === 'Paid' &&
    isStaff;
  // Each step is shown one-at-a-time using activeStep index
  const actionSteps = applicant
    ? [
        {
          label: applicant.quotaType === 'Management'
            ? 'Step 2 & 3: Select Program & Allocate Seat'
            : 'Step 2 & 3: Enter Allotment Details & Allocate Seat',
          visible: canAllocate,
          completed: applicant.admissionStatus !== 'Pending',
        },
        {
          label: 'Step 4: Document Verification',
          visible: canVerifyDocuments,
          completed: applicant.documents.status === 'Verified',
        },
        {
          label: 'Step 5: Fee Payment',
          visible: canUpdateFee,
          completed: applicant.feeStatus === 'Paid',
        },
        {
          label: 'Step 6: Generate Admission Number & Confirm',
          visible: canConfirm,
          completed: applicant.admissionStatus === 'Confirmed',
        },
      ]
    : [];
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
    { name: 'Create Applicant', completed: true, current: false },
    {
      name:
        applicant.quotaType === 'Management'
          ? 'Select Program & Check Availability'
          : 'Enter Allotment Details',
      completed: !!(applicant.allotmentNumber || applicant.program),
      current: !applicant.program,
    },
    {
      name: 'Allocate Seat',
      completed:
        applicant.admissionStatus === 'Allocated' ||
        applicant.admissionStatus === 'Confirmed',
      current:
        applicant.admissionStatus === 'Pending' &&
        !!(applicant.allotmentNumber || applicant.quotaType === 'Management'),
    },
    {
      name: 'Verify Documents',
      completed: applicant.documents.status === 'Verified',
      current: applicant.documents.status === 'Submitted',
    },
    {
      name: 'Fee Payment',
      completed: applicant.feeStatus === 'Paid',
      current:
        applicant.feeStatus === 'Pending' &&
        applicant.documents.status === 'Verified',
    },
    {
      name: 'Generate Admission Number',
      completed: applicant.admissionStatus === 'Confirmed',
      current:
        applicant.admissionStatus === 'Allocated' &&
        applicant.documents.status === 'Verified' &&
        applicant.feeStatus === 'Paid',
    },
  ];

  const goToPrevStep = () => setActiveStep(prev => Math.max(0, prev - 1));
  const goToNextStep = () =>
    setActiveStep(prev => Math.min(actionSteps.length - 1, prev + 1));

  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === actionSteps.length - 1;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Applicant Details</h1>
        <button onClick={() => navigate('/applicants')} className="btn-secondary">
          Back to List
        </button>
      </div>

      {/* Journey Progress */}
      <div className="mb-6 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Admission Journey Progress</h2>
        <div className="flex items-center justify-between">
          {journeySteps.map((step, index) => (
            <div key={index} className="flex-1 text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <p
                className={`text-xs mt-2 ${
                  step.completed
                    ? 'text-green-400'
                    : step.current
                    ? 'text-cyan-400 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {step.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Personal Information</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Name:</strong> {applicant.fullName}</p>
            <p><strong>Email:</strong> {applicant.email}</p>
            <p><strong>Phone:</strong> {applicant.phone}</p>
            <p>
              <strong>Date of Birth:</strong>{' '}
              {new Date(applicant.dateOfBirth).toLocaleDateString()}
            </p>
            <p>
              <strong>Address:</strong> {applicant.address}, {applicant.city},{' '}
              {applicant.state} - {applicant.pincode}
            </p>
            <p><strong>Category:</strong> {applicant.category}</p>
            <p><strong>Entry Type:</strong> {applicant.entryType}</p>
            <p><strong>Quota Type:</strong> {applicant.quotaType}</p>
            <p><strong>Marks:</strong> {applicant.marks}%</p>
            {applicant.allotmentNumber && (
              <p>
                <strong>Allotment Number:</strong>{' '}
                <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                  {applicant.allotmentNumber}
                </span>
              </p>
            )}
            {applicant.admissionNumber && (
              <p>
                <strong>Admission Number:</strong>{' '}
                <span className="font-mono bg-green-900/30 text-green-400 px-2 py-1 rounded">
                  {applicant.admissionNumber}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Admission Status */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Admission Status</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-300">Program:</p>
              <p className="text-gray-400">{applicant.program?.name || 'Not Allocated'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Documents Status:</p>
              <p
                className={`inline-block px-2 py-1 rounded-full text-sm ${
                  applicant.documents.status === 'Verified'
                    ? 'bg-green-500/20 text-green-400'
                    : applicant.documents.status === 'Submitted'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {applicant.documents.status}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Fee Status:</p>
              <p
                className={`inline-block px-2 py-1 rounded-full text-sm ${
                  applicant.feeStatus === 'Paid'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {applicant.feeStatus}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-300">Admission Status:</p>
              <p
                className={`inline-block px-2 py-1 rounded-full text-sm ${
                  applicant.admissionStatus === 'Confirmed'
                    ? 'bg-green-500/20 text-green-400'
                    : applicant.admissionStatus === 'Allocated'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {applicant.admissionStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Step-by-step Action Panel (staff only) ── */}
      {isStaff && (
        <div className="mt-6">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">

            {/* Step indicator tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {actionSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                    idx === activeStep
                      ? 'bg-cyan-600 text-white shadow'
                      : step.completed
                      ? 'bg-green-700/40 text-green-400 border border-green-600/40'
                      : 'bg-gray-700 text-gray-400 border border-gray-600'
                  }`}
                >
                  {step.completed ? '✓ ' : `${idx + 1}. `}
                  {step.label.replace(/^Step \d+ ?&? ?\d*: /, '')}
                </button>
              ))}
            </div>

            {/* ── Step 0: Allocate Seat ── */}
            {activeStep === 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">
                  {actionSteps[0]?.label}
                </h2>

                {applicant.admissionStatus !== 'Pending' ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="text-xl">✓</span>
                    <span>
                      Seat already allocated to{' '}
                      <strong>{applicant.program?.name || 'a program'}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Program dropdown — pre-filled from applicant if available */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Program *
                      </label>
                      {checkingSeats ? (
                        <div className="mt-2 text-gray-400 text-sm">
                          Loading available programs...
                        </div>
                      ) : (
                        <>
                          <select
                            value={allocateForm.programId}
                            onChange={(e) =>
                              setAllocateForm({ ...allocateForm, programId: e.target.value })
                            }
                            className="input-field"
                            required
                          >
                            <option value="">Select Program</option>
                            {filteredPrograms.map(program => (
                              <option key={program._id} value={program._id}>
                                {program.name} ({program.code}) — Available:{' '}
                                {program.remainingSeats} / {program.totalSeats} seats
                              </option>
                            ))}
                          </select>
                          {filteredPrograms.length === 0 && !checkingSeats && (
                            <p className="mt-2 text-sm text-red-400">
                              No programs available with seats in {applicant.quotaType}{' '}
                              quota.
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Quota — pre-filled and locked */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Quota *
                      </label>
                      <input
                        type="text"
                        value={applicant.quotaType}
                        disabled
                        className="input-field bg-gray-700 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Quota is pre-filled from applicant data and cannot be changed
                      </p>
                    </div>

                    {/* Allotment Number — pre-filled and locked for govt quotas */}
                    {(applicant.quotaType === 'KCET' ||
                      applicant.quotaType === 'COMEDK') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300">
                          Allotment Number *
                        </label>
                        <input
                          type="text"
                          value={applicant.allotmentNumber || ''}
                          disabled
                          className="input-field bg-gray-700 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Allotment number is pre-filled from applicant data and cannot
                          be changed
                        </p>
                      </div>
                    )}

                    {/* Seat availability panel */}
                    {remainingSeats && (
                      <div
                        className={`p-3 rounded-md ${
                          remainingSeats.isAvailable
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-300">
                          Seat Availability for Selected Program:
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                          <div>
                            Total Seats:{' '}
                            <strong className="text-gray-200">
                              {remainingSeats.totalSeats}
                            </strong>
                          </div>
                          <div>
                            Filled Seats:{' '}
                            <strong className="text-gray-200">
                              {remainingSeats.filledSeats}
                            </strong>
                          </div>
                          <div>
                            Available:{' '}
                            <strong
                              className={
                                remainingSeats.isAvailable
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }
                            >
                              {remainingSeats.remainingSeats}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleAllocateSeat}
                      disabled={
                        !remainingSeats ||
                        !remainingSeats.isAvailable ||
                        !allocateForm.programId ||
                        filteredPrograms.length === 0
                      }
                      className={`btn-primary ${
                        remainingSeats &&
                        remainingSeats.isAvailable &&
                        allocateForm.programId &&
                        filteredPrograms.length > 0
                          ? ''
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Allocate Seat &amp; Lock Seat
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 1: Document Verification ── */}
            {activeStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">
                  Step 4: Document Verification
                </h2>

                {applicant.documents.status === 'Verified' ? (
                  <div className="flex items-center gap-2 text-green-400 mb-4">
                    <span className="text-xl">✓</span>
                    <span>Documents have been verified</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                      Check each box as you complete verification. Once documents are
                      verified you can proceed to fee payment.
                    </p>

                    {/* Checkbox: Documents Submitted */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-150 ${
                        docChecks.submitted
                          ? 'border-cyan-500/50 bg-cyan-500/10'
                          : 'border-gray-600 bg-gray-700/40 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={docChecks.submitted}
                        onChange={() => handleDocCheckChange('submitted')}
                        disabled={applicant.documents.status === 'Verified'}
                        className="mt-0.5 h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          Documents Submitted
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Applicant has physically submitted all required documents
                        </p>
                      </div>
                      {docChecks.submitted && (
                        <span className="ml-auto text-cyan-400 text-sm font-medium">
                          ✓ Done
                        </span>
                      )}
                    </label>

                    {/* Checkbox: Documents Verified */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-150 ${
                        !docChecks.submitted
                          ? 'border-gray-700 bg-gray-700/20 opacity-50 cursor-not-allowed'
                          : docChecks.verified
                          ? 'border-green-500/50 bg-green-500/10 cursor-pointer'
                          : 'border-gray-600 bg-gray-700/40 hover:border-gray-500 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={docChecks.verified}
                        onChange={() => handleDocCheckChange('verified')}
                        disabled={
                          !docChecks.submitted ||
                          applicant.documents.status === 'Verified'
                        }
                        className="mt-0.5 h-4 w-4 rounded border-gray-500 bg-gray-700 text-green-500 focus:ring-green-500 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-200">
                          Documents Verified
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          All documents have been reviewed and verified by the officer
                        </p>
                      </div>
                      {docChecks.verified && (
                        <span className="ml-auto text-green-400 text-sm font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </label>

                    {!docChecks.submitted && (
                      <p className="text-xs text-gray-500">
                        → First mark documents as submitted, then verify
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Fee Payment ── */}
            {activeStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">
                  Step 5: Fee Payment
                </h2>

                {applicant.feeStatus === 'Paid' ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="text-xl">✓</span>
                    <span>Fee has been marked as paid</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                      Mark the fee as paid once the applicant has completed the fee
                      payment process.
                    </p>
                    <button
                      onClick={() => handleUpdateFee('Paid')}
                      className="btn-primary"
                    >
                      Mark Fee as Paid
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3: Confirm Admission ── */}
            {activeStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">
                  Step 6: Generate Admission Number &amp; Confirm
                </h2>

                {applicant.admissionStatus === 'Confirmed' ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <span className="text-xl">✓</span>
                    <span>
                      Admission confirmed — Number:{' '}
                      <span className="font-mono bg-green-900/30 px-2 py-0.5 rounded">
                        {applicant.admissionNumber}
                      </span>
                    </span>
                  </div>
                ) : canConfirm ? (
                  <div className="space-y-4">
                    <div className="bg-cyan-500/10 p-3 rounded-md mb-4 border border-cyan-500/30">
                      <p className="text-sm font-medium text-cyan-400">
                        Admission Number Format:
                      </p>
                      <p className="text-sm text-gray-300 font-mono">
                        INSTITUTE_CODE/YEAR/COURSE_TYPE/PROGRAM_CODE/QUOTA_TYPE/SEQUENCE
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Example: ABCE/2026/UG/CSE/KCET/0001
                      </p>
                    </div>
                    <button onClick={handleConfirmAdmission} className="btn-primary">
                      Generate Admission Number &amp; Confirm Admission
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-gray-400">
                    <p className="font-medium text-gray-300">
                      Prerequisites not yet met:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {applicant.admissionStatus !== 'Allocated' && (
                        <li>Seat must be allocated first</li>
                      )}
                      {applicant.documents.status !== 'Verified' && (
                        <li>Documents must be verified</li>
                      )}
                      {applicant.feeStatus !== 'Paid' && (
                        <li>Fee must be marked as paid</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Previous / Next navigation ── */}
            <div className="flex justify-between mt-8 pt-4 border-t border-gray-700">
              <button
                onClick={goToPrevStep}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isFirstStep
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                ← Previous
              </button>

              <button
                onClick={goToNextStep}
                disabled={isLastStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isLastStep
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                }`}
              >
                Next →
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDetail;