import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ApplicantForm = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState('');
  const [remainingSeats, setRemainingSeats] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    category: '',
    entryType: '',
    quotaType: '',
    marks: '',
    qualifyingExam: '',
    allotmentNumber: '', // For government admission
    programId: '', // For management admission
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    // Check seat availability when program and quota are selected for management admission
    if (formData.programId && formData.quotaType === 'Management') {
      checkRemainingSeats();
    } else {
      setRemainingSeats(null);
    }
  }, [formData.programId, formData.quotaType]);

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
      const response = await axios.get(`http://localhost:5000/api/applicants/remaining-seats/${formData.programId}/Management`);
      setRemainingSeats(response.data);
    } catch (error) {
      setRemainingSeats(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Reset program selection when quota type changes
    if (name === 'quotaType') {
      setSelectedQuota(value);
      setFormData(prev => ({ ...prev, programId: '' }));
      setRemainingSeats(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation for management admission
    if (formData.quotaType === 'Management') {
      if (!formData.programId) {
        toast.error('Please select a program for Management quota');
        return;
      }
      if (!remainingSeats || !remainingSeats.isAvailable) {
        toast.error('No seats available in Management quota for selected program');
        return;
      }
    }
    
    // Validation for government admission (KCET/COMEDK)
    if ((formData.quotaType === 'KCET' || formData.quotaType === 'COMEDK') && !formData.allotmentNumber) {
      toast.error('Please enter allotment number for government admission');
      return;
    }
    
    setLoading(true);
    try {
      // Create applicant first
      const applicantData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        category: formData.category,
        entryType: formData.entryType,
        quotaType: formData.quotaType,
        marks: parseFloat(formData.marks),
        qualifyingExam: formData.qualifyingExam,
      };
      
      if (formData.allotmentNumber) {
        applicantData.allotmentNumber = formData.allotmentNumber;
      }
      
      const response = await axios.post('http://localhost:5000/api/applicants', applicantData);
      const newApplicant = response.data;
      
      // For management admission, allocate seat immediately
      if (formData.quotaType === 'Management' && formData.programId) {
        try {
          await axios.post('http://localhost:5000/api/applicants/allocate', {
            applicantId: newApplicant._id,
            programId: formData.programId,
            quotaName: 'Management',
          });
          toast.success('Applicant created and seat allocated successfully!');
        } catch (allocateError) {
          toast.error('Applicant created but seat allocation failed: ' + allocateError.response?.data?.message);
          navigate('/applicants');
          return;
        }
      } else {
        toast.success('Applicant created successfully! Please allocate seat from applicant details page.');
      }
      
      navigate('/applicants');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create applicant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Applicant</h1>
      
      {/* Journey Information */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Admission Journey:</h3>
        <div className="text-sm text-blue-800">
          {formData.quotaType === 'Management' ? (
            <p>Management Admission: Create Applicant → Select Program → Check Seat Availability → Allocate Seat → Verify Documents → Fee Paid → Admission Confirmed</p>
          ) : formData.quotaType === 'KCET' || formData.quotaType === 'COMEDK' ? (
            <p>Government Admission: Create Applicant → Enter Allotment Details → Select Quota → System Checks Availability → Seat Locked → Documents Verified → Fee Paid → Admission Number Generated</p>
          ) : (
            <p>Select quota type to see admission journey</p>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="GM">GM</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Entry Type *</label>
              <select
                name="entryType"
                required
                value={formData.entryType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Entry Type</option>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quota Type *</label>
              <select
                name="quotaType"
                required
                value={formData.quotaType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Quota</option>
                <option value="KCET">KCET (Government)</option>
                <option value="COMEDK">COMEDK (Government)</option>
                <option value="Management">Management</option>
              </select>
            </div>
            
            {/* Government Admission Fields */}
            {(formData.quotaType === 'KCET' || formData.quotaType === 'COMEDK') && (
              <div className="md:col-span-2 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <h3 className="text-sm font-semibold text-yellow-900 mb-3">Government Admission Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Allotment Number *</label>
                  <input
                    type="text"
                    name="allotmentNumber"
                    required
                    value={formData.allotmentNumber}
                    onChange={handleChange}
                    placeholder="Enter government allotment number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Allotment number from government counseling</p>
                </div>
              </div>
            )}
            
            {/* Management Admission Fields */}
            {formData.quotaType === 'Management' && (
              <div className="md:col-span-2 bg-green-50 p-4 rounded-md border border-green-200">
                <h3 className="text-sm font-semibold text-green-900 mb-3">Management Admission Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Program *</label>
                  <select
                    name="programId"
                    required
                    value={formData.programId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Program</option>
                    {programs.map(program => (
                      <option key={program._id} value={program._id}>
                        {program.name} - {program.code} (Intake: {program.totalIntake})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Seat Availability Display */}
                {remainingSeats && (
                  <div className="mt-3 p-3 bg-white rounded-md border border-green-200">
                    <p className="text-sm font-medium text-gray-700">Seat Availability:</p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                      <div>
                        <span className="text-gray-600">Total Seats:</span>
                        <span className="ml-2 font-semibold">{remainingSeats.totalSeats}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Filled:</span>
                        <span className="ml-2 font-semibold">{remainingSeats.filledSeats}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Available:</span>
                        <span className={`ml-2 font-bold ${remainingSeats.remainingSeats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {remainingSeats.remainingSeats}
                        </span>
                      </div>
                    </div>
                    {!remainingSeats.isAvailable && (
                      <p className="text-sm text-red-600 font-bold mt-2">⚠️ No seats available in Management quota for this program!</p>
                    )}
                    {remainingSeats.isAvailable && remainingSeats.remainingSeats > 0 && (
                      <p className="text-sm text-green-600 mt-2">✓ Seats available. Seat will be allocated automatically.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Marks (%) *</label>
              <input
                type="number"
                name="marks"
                required
                step="0.01"
                value={formData.marks}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Qualifying Exam *</label>
              <input
                type="text"
                name="qualifyingExam"
                required
                value={formData.qualifyingExam}
                onChange={handleChange}
                placeholder="e.g., KCET, COMEDK, University Exam"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/applicants')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (formData.quotaType === 'Management' && (!remainingSeats || !remainingSeats.isAvailable))}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Applicant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantForm;