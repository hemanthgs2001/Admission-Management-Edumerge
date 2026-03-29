import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ApplicantForm = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [admissionType, setAdmissionType] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [seatAvailability, setSeatAvailability] = useState({
    KCET: null,
    COMEDK: null,
    Management: null
  });
  const [checkingSeats, setCheckingSeats] = useState(false);
  const [checkingUniqueness, setCheckingUniqueness] = useState({
    email: false,
    phone: false,
    allotmentNumber: false
  });
  const [uniquenessStatus, setUniquenessStatus] = useState({
    email: { isValid: true, message: '' },
    phone: { isValid: true, message: '' },
    allotmentNumber: { isValid: true, message: '' }
  });
  
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
    allotmentNumber: '',
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/masters/programs');
      setPrograms(response.data);
    } catch (error) {
      toast.error('Failed to fetch programs');
    }
  };

  const checkSeatAvailability = useCallback(async () => {
    setCheckingSeats(true);
    const availability = {
      KCET: null,
      COMEDK: null,
      Management: null
    };
    
    for (const quota of ['KCET', 'COMEDK', 'Management']) {
      try {
        const response = await axios.get(`http://localhost:5000/api/applicants/remaining-seats/${selectedProgram}/${quota}`);
        availability[quota] = response.data;
      } catch (error) {
        availability[quota] = null;
      }
    }
    
    setSeatAvailability(availability);
    setCheckingSeats(false);
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram && admissionType) {
      checkSeatAvailability();
    }
  }, [selectedProgram, admissionType, checkSeatAvailability]);

  const checkEmailUniqueness = async (email) => {
    if (!email) {
      setUniquenessStatus(prev => ({
        ...prev,
        email: { isValid: true, message: '' }
      }));
      return;
    }

    setCheckingUniqueness(prev => ({ ...prev, email: true }));
    try {
      const response = await axios.get(`http://localhost:5000/api/applicants`);
      const existingApplicants = response.data;
      const emailExists = existingApplicants.some(applicant => applicant.email === email);
      
      if (emailExists) {
        setUniquenessStatus(prev => ({
          ...prev,
          email: { isValid: false, message: 'This email is already registered. Please use a different email.' }
        }));
      } else {
        setUniquenessStatus(prev => ({
          ...prev,
          email: { isValid: true, message: 'Email is available ✓' }
        }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setCheckingUniqueness(prev => ({ ...prev, email: false }));
    }
  };

  const checkPhoneUniqueness = async (phone) => {
    if (!phone) {
      setUniquenessStatus(prev => ({
        ...prev,
        phone: { isValid: true, message: '' }
      }));
      return;
    }

    setCheckingUniqueness(prev => ({ ...prev, phone: true }));
    try {
      const response = await axios.get(`http://localhost:5000/api/applicants`);
      const existingApplicants = response.data;
      const phoneExists = existingApplicants.some(applicant => applicant.phone === phone);
      
      if (phoneExists) {
        setUniquenessStatus(prev => ({
          ...prev,
          phone: { isValid: false, message: 'This phone number is already registered. Please use a different number.' }
        }));
      } else {
        setUniquenessStatus(prev => ({
          ...prev,
          phone: { isValid: true, message: 'Phone number is available ✓' }
        }));
      }
    } catch (error) {
      console.error('Error checking phone:', error);
    } finally {
      setCheckingUniqueness(prev => ({ ...prev, phone: false }));
    }
  };

  const checkAllotmentNumberUniqueness = async (allotmentNumber) => {
    if (!allotmentNumber || admissionType !== 'government') {
      setUniquenessStatus(prev => ({
        ...prev,
        allotmentNumber: { isValid: true, message: '' }
      }));
      return;
    }

    setCheckingUniqueness(prev => ({ ...prev, allotmentNumber: true }));
    try {
      const response = await axios.get(`http://localhost:5000/api/applicants`);
      const existingApplicants = response.data;
      const allotmentExists = existingApplicants.some(applicant => applicant.allotmentNumber === allotmentNumber);
      
      if (allotmentExists) {
        setUniquenessStatus(prev => ({
          ...prev,
          allotmentNumber: { isValid: false, message: 'This allotment number is already used. Please verify and enter correct number.' }
        }));
      } else {
        setUniquenessStatus(prev => ({
          ...prev,
          allotmentNumber: { isValid: true, message: 'Allotment number is valid ✓' }
        }));
      }
    } catch (error) {
      console.error('Error checking allotment number:', error);
    } finally {
      setCheckingUniqueness(prev => ({ ...prev, allotmentNumber: false }));
    }
  };

  const handleAdmissionTypeChange = (type) => {
    setAdmissionType(type);
    setSelectedProgram('');
    setFormData({
      ...formData,
      quotaType: '',
      allotmentNumber: ''
    });
    setUniquenessStatus({
      email: { isValid: true, message: '' },
      phone: { isValid: true, message: '' },
      allotmentNumber: { isValid: true, message: '' }
    });
  };

  const handleProgramChange = (e) => {
    const programId = e.target.value;
    setSelectedProgram(programId);
    setFormData({
      ...formData,
      quotaType: '',
      allotmentNumber: ''
    });
  };

  const handleQuotaChange = (e) => {
    const quotaType = e.target.value;
    const availability = seatAvailability[quotaType];
    
    if (availability && !availability.isAvailable) {
      toast.error(`No seats available in ${quotaType} quota. All seats are filled.`);
      return;
    }
    
    setFormData({
      ...formData,
      quotaType: quotaType,
      allotmentNumber: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (value && !emailRegex.test(value)) {
        setUniquenessStatus(prev => ({
          ...prev,
          email: { isValid: false, message: 'Email must be a valid Gmail address (@gmail.com)' }
        }));
      } else {
        checkEmailUniqueness(value);
      }
    }
    
    if (name === 'phone') {
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      if (value && !phoneRegex.test(value)) {
        setUniquenessStatus(prev => ({
          ...prev,
          phone: { isValid: false, message: 'Phone number must be a valid Indian number (10 digits starting with 6-9, optional +91)' }
        }));
      } else {
        checkPhoneUniqueness(value);
      }
    }
    
    if (name === 'allotmentNumber') {
      checkAllotmentNumberUniqueness(value);
    }
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      dateOfBirth: e.target.value
    });
  };

  const validateForm = () => {
    if (!uniquenessStatus.email.isValid) {
      toast.error(uniquenessStatus.email.message);
      return false;
    }
    
    if (!uniquenessStatus.phone.isValid) {
      toast.error(uniquenessStatus.phone.message);
      return false;
    }
    
    if (admissionType === 'government' && formData.quotaType && !uniquenessStatus.allotmentNumber.isValid) {
      toast.error(uniquenessStatus.allotmentNumber.message);
      return false;
    }
    
    if (!formData.quotaType) {
      toast.error('Please select a quota type');
      return false;
    }
    
    const availability = seatAvailability[formData.quotaType];
    if (availability && !availability.isAvailable) {
      toast.error(`No seats available in ${formData.quotaType} quota. All seats are filled.`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const submitData = { ...formData };
      const response = await axios.post('http://localhost:5000/api/applicants', submitData);
      toast.success('Applicant created successfully! Redirecting to details page...');
      setTimeout(() => {
        navigate(`/applicants/${response.data._id}`);
      }, 1000);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create applicant');
      }
      setLoading(false);
    }
  };

  const getAvailableQuotas = () => {
    if (admissionType === 'government') {
      return ['KCET', 'COMEDK'].filter(quota => {
        const availability = seatAvailability[quota];
        return availability && availability.isAvailable;
      });
    } else if (admissionType === 'management') {
      return ['Management'].filter(quota => {
        const availability = seatAvailability[quota];
        return availability && availability.isAvailable;
      });
    }
    return [];
  };

  const getMaxDate = () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return eighteenYearsAgo.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const today = new Date();
    const seventyYearsAgo = new Date(today.getFullYear() - 70, today.getMonth(), today.getDate());
    return seventyYearsAgo.toISOString().split('T')[0];
  };

  if (!admissionType) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Add New Applicant</h1>
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-100">Select Admission Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleAdmissionTypeChange('government')}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white p-8 rounded-xl text-center transition duration-200"
            >
              <div className="text-2xl font-bold mb-2">Government Admission</div>
              <div className="text-sm">KCET / COMEDK Quota</div>
            </button>
            <button
              onClick={() => handleAdmissionTypeChange('management')}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white p-8 rounded-xl text-center transition duration-200"
            >
              <div className="text-2xl font-bold mb-2">Management Admission</div>
              <div className="text-sm">Management Quota</div>
            </button>
          </div>
          <button
            onClick={() => navigate('/applicants')}
            className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">
          Add New Applicant - {admissionType === 'government' ? 'Government Admission' : 'Management Admission'}
        </h1>
        <button
          onClick={() => setAdmissionType('')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Selection
        </button>
      </div>
      
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Select Program *</label>
              <select
                required
                value={selectedProgram}
                onChange={handleProgramChange}
                className="input-field"
              >
                <option value="">Select Program</option>
                {programs.map(program => (
                  <option key={program._id} value={program._id}>
                    {program.name} ({program.code}) - Intake: {program.totalIntake}
                  </option>
                ))}
              </select>
            </div>

            {selectedProgram && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Quota Type *</label>
                {checkingSeats ? (
                  <div className="mt-2 text-gray-400">Checking seat availability...</div>
                ) : (
                  <>
                    <select
                      required
                      value={formData.quotaType}
                      onChange={handleQuotaChange}
                      className="input-field"
                    >
                      <option value="">Select Quota</option>
                      {getAvailableQuotas().map(quota => (
                        <option key={quota} value={quota}>
                          {quota} - Available: {seatAvailability[quota]?.remainingSeats} / {seatAvailability[quota]?.totalSeats} seats
                        </option>
                      ))}
                    </select>
                    {getAvailableQuotas().length === 0 && (
                      <p className="mt-2 text-sm text-red-400">
                        No seats available in any quota for this program. All seats are filled.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {admissionType === 'government' && formData.quotaType && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Allotment Number *</label>
                <input
                  type="text"
                  name="allotmentNumber"
                  required
                  value={formData.allotmentNumber}
                  onChange={handleChange}
                  placeholder="Enter government allotment number"
                  className={`input-field ${
                    uniquenessStatus.allotmentNumber.isValid 
                      ? 'border-gray-700' 
                      : 'border-red-500'
                  }`}
                />
                {checkingUniqueness.allotmentNumber && (
                  <p className="mt-1 text-xs text-gray-400">Checking...</p>
                )}
                {!checkingUniqueness.allotmentNumber && uniquenessStatus.allotmentNumber.message && (
                  <p className={`mt-1 text-xs ${
                    uniquenessStatus.allotmentNumber.isValid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {uniquenessStatus.allotmentNumber.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className={`input-field ${
                  uniquenessStatus.email.isValid 
                    ? 'border-gray-700' 
                    : 'border-red-500'
                }`}
              />
              {checkingUniqueness.email && (
                <p className="mt-1 text-xs text-gray-400">Checking availability...</p>
              )}
              {!checkingUniqueness.email && uniquenessStatus.email.message && (
                <p className={`mt-1 text-xs ${
                  uniquenessStatus.email.isValid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {uniquenessStatus.email.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Phone *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+919876543210 or 9876543210"
                className={`input-field ${
                  uniquenessStatus.phone.isValid 
                    ? 'border-gray-700' 
                    : 'border-red-500'
                }`}
              />
              {checkingUniqueness.phone && (
                <p className="mt-1 text-xs text-gray-400">Checking availability...</p>
              )}
              {!checkingUniqueness.phone && uniquenessStatus.phone.message && (
                <p className={`mt-1 text-xs ${
                  uniquenessStatus.phone.isValid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {uniquenessStatus.phone.message}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleDateChange}
                min={getMinDate()}
                max={getMaxDate()}
                className="input-field"
              />
              <p className="mt-1 text-xs text-gray-500">Click the calendar icon to select date (Age must be between 18 and 70 years)</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Address *</label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                pattern="[0-9]{6}"
                title="Pincode must be 6 digits"
                value={formData.pincode}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Category</option>
                <option value="GM">GM</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Entry Type *</label>
              <select
                name="entryType"
                required
                value={formData.entryType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Entry Type</option>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Marks (%) *</label>
              <input
                type="number"
                name="marks"
                required
                step="0.01"
                min="0"
                max="100"
                value={formData.marks}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Qualifying Exam *</label>
              <input
                type="text"
                name="qualifyingExam"
                required
                value={formData.qualifyingExam}
                onChange={handleChange}
                placeholder="e.g., KCET, COMEDK, CBSE, etc."
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/applicants')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || getAvailableQuotas().length === 0 || !uniquenessStatus.email.isValid || !uniquenessStatus.phone.isValid || (admissionType === 'government' && formData.quotaType && !uniquenessStatus.allotmentNumber.isValid)}
              className={`btn-primary ${
                (loading || getAvailableQuotas().length === 0 || !uniquenessStatus.email.isValid || !uniquenessStatus.phone.isValid || (admissionType === 'government' && formData.quotaType && !uniquenessStatus.allotmentNumber.isValid))
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
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