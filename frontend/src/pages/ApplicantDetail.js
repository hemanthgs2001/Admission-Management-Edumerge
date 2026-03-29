import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [remainingSeats, setRemainingSeats] = useState(null);
  const [allocateForm, setAllocateForm] = useState({
    programId: '',
    quotaName: '',
    allotmentNumber: '',
  });

  useEffect(() => {
    fetchApplicant();
    fetchPrograms();
  }, [id]);

  useEffect(() => {
    if (allocateForm.programId && allocateForm.quotaName) {
      checkRemainingSeats();
    } else {
      setRemainingSeats(null);
    }
  }, [allocateForm.programId, allocateForm.quotaName]);

  const fetchApplicant = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/applicants/${id}`);
      setApplicant(response.data);
    } catch (error) {
      toast.error('Failed to fetch applicant details');
      navigate('/applicants');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/masters/programs');
      setPrograms(response.data);
    } catch (error) {
      toast.error('Failed to fetch programs');
    }
  };

  const checkRemainingSeats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/applicants/remaining-seats/${allocateForm.programId}/${allocateForm.quotaName}`);
      setRemainingSeats(response.data);
    } catch (error) {
      setRemainingSeats(null);
    }
  };

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
      setAllocateForm({ programId: '', quotaName: '', allotmentNumber: '' });
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
      // Redirect to applicants list after 2 seconds
      setTimeout(() => {
        navigate('/applicants');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm admission');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!applicant) {
    return <div className="text-center">Applicant not found</div>;
  }

  // Determine admission journey steps
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
        <h1 className="text-2xl font-bold">Applicant Details</h1>
        <button
          onClick={() => navigate('/applicants')}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Back to List
        </button>
      </div>

      {/* Journey Progress */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Admission Journey Progress</h2>
        <div className="flex items-center justify-between">
          {journeySteps.map((step, index) => (
            <div key={index} className="flex-1 text-center">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-500 text-white' : 
                step.current ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <p className={`text-xs mt-2 ${step.completed ? 'text-green-600' : step.current ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {step.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="space-y-2">
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
              <p><strong>Allotment Number:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{applicant.allotmentNumber}</span></p>
            )}
            {applicant.admissionNumber && (
              <p><strong>Admission Number:</strong> <span className="font-mono bg-green-100 px-2 py-1 rounded">{applicant.admissionNumber}</span></p>
            )}
          </div>
        </div>

        {/* Admission Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Admission Status</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Program:</p>
              <p>{applicant.program?.name || 'Not Allocated'}</p>
            </div>
            <div>
              <p className="font-medium">Documents Status:</p>
              <p className={`inline-block px-2 py-1 rounded-full text-sm ${
                applicant.documents.status === 'Verified' ? 'bg-green-100 text-green-800' :
                applicant.documents.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {applicant.documents.status}
              </p>
            </div>
            <div>
              <p className="font-medium">Fee Status:</p>
              <p className={`inline-block px-2 py-1 rounded-full text-sm ${
                applicant.feeStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {applicant.feeStatus}
              </p>
            </div>
            <div>
              <p className="font-medium">Admission Status:</p>
              <p className={`inline-block px-2 py-1 rounded-full text-sm ${
                applicant.admissionStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                applicant.admissionStatus === 'Allocated' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {applicant.admissionStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {(user?.role === 'admin' || user?.role === 'admission_officer') && (
        <div className="mt-6 space-y-6">
          {/* Step 2 & 3: Allocate Seat */}
          {canAllocate && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                {applicant.quotaType === 'Management' ? 'Step 2 & 3: Select Program & Allocate Seat' : 'Step 2 & 3: Enter Allotment Details & Allocate Seat'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <select
                    value={allocateForm.programId}
                    onChange={(e) => setAllocateForm({ ...allocateForm, programId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program._id} value={program._id}>{program.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quota</label>
                  <select
                    value={allocateForm.quotaName}
                    onChange={(e) => setAllocateForm({ ...allocateForm, quotaName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Quota</option>
                    <option value="KCET">KCET</option>
                    <option value="COMEDK">COMEDK</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                
                {/* Government: Allotment Number */}
                {(applicant.quotaType === 'KCET' || applicant.quotaType === 'COMEDK') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allotment Number</label>
                    <input
                      type="text"
                      value={allocateForm.allotmentNumber}
                      onChange={(e) => setAllocateForm({ ...allocateForm, allotmentNumber: e.target.value })}
                      placeholder="Enter government allotment number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
                
                {/* Seat Availability */}
                {remainingSeats && (
                  <div className={`p-3 rounded-md ${remainingSeats.isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className="text-sm font-medium">Seat Availability:</p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                      <div>Total: <strong>{remainingSeats.totalSeats}</strong></div>
                      <div>Filled: <strong>{remainingSeats.filledSeats}</strong></div>
                      <div>Available: <strong className={remainingSeats.isAvailable ? 'text-green-600' : 'text-red-600'}>
                        {remainingSeats.remainingSeats}
                      </strong></div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleAllocateSeat}
                  disabled={!remainingSeats || !remainingSeats.isAvailable || !allocateForm.programId || !allocateForm.quotaName}
                  className={`px-4 py-2 rounded-md text-white ${
                    remainingSeats && remainingSeats.isAvailable && allocateForm.programId && allocateForm.quotaName
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {remainingSeats && remainingSeats.isAvailable ? 'Allocate Seat & Lock Seat' : 'Check Seat Availability First'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Verify Documents */}
          {canVerifyDocuments && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Step 4: Document Verification</h2>
              <div className="space-x-4">
                <button
                  onClick={() => handleUpdateDocuments('Submitted')}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Mark Documents as Submitted
                </button>
                <button
                  onClick={() => handleUpdateDocuments('Verified')}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Verify Documents
                </button>
              </div>
              {applicant.documents.status === 'Pending' && (
                <p className="text-sm text-gray-500 mt-2">→ First mark documents as submitted, then verify</p>
              )}
            </div>
          )}

          {/* Step 5: Fee Payment */}
          {canUpdateFee && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Step 5: Fee Payment</h2>
              <button
                onClick={() => handleUpdateFee('Paid')}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Mark Fee as Paid
              </button>
            </div>
          )}

          {/* Step 6: Generate Admission Number */}
          {canConfirm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Step 6: Generate Admission Number & Confirm</h2>
              <p className="text-sm text-gray-600 mb-4">
                Admission number will be generated in format: <strong>INSTITUTE_CODE/YEAR/COURSE_TYPE/PROGRAM_CODE/QUOTA_TYPE/SEQUENCE</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Example: <strong>ABCE/2026/UG/CSE/KCET/0001</strong>
              </p>
              <button
                onClick={handleConfirmAdmission}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
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