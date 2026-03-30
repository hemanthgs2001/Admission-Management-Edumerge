import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Country, State, City } from 'country-state-city';

const ApplicantForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();                        
  const isEditMode = Boolean(id);

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode); 
  const [admissionType, setAdmissionType] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [seatAvailability, setSeatAvailability] = useState({
    KCET: null, COMEDK: null, Management: null,
  });
  const [checkingSeats, setCheckingSeats] = useState(false);
  const indianStates = State.getStatesOfCountry('IN');
  const [selectedStateIso, setSelectedStateIso] = useState('');
  const [cityList, setCityList] = useState([]);
  const [pincodeOptions, setPincodeOptions] = useState([]);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [checkingUniqueness, setCheckingUniqueness] = useState({
    email: false, phone: false, allotmentNumber: false,
  });
  const [uniquenessStatus, setUniquenessStatus] = useState({
    email: { isValid: true, message: '' },
    phone: { isValid: true, message: '' },
    allotmentNumber: { isValid: true, message: '' },
  });

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', dateOfBirth: '',
    address: '', city: '', state: '', pincode: '',
    category: '', entryType: '', quotaType: '',
    marks: '', qualifyingExam: '', allotmentNumber: '',
  });

  const inputBase =
    'mt-1 block w-full rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 ' +
    'border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ' +
    'focus:outline-none px-3 py-2 text-sm transition duration-150';

  const inputWithValidation = (isValid) =>
    'mt-1 block w-full rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 ' +
    `border ${isValid ? 'border-gray-600' : 'border-red-500'} ` +
    'focus:ring-1 focus:outline-none px-3 py-2 text-sm transition duration-150 ' +
    `${isValid ? 'focus:border-cyan-500 focus:ring-cyan-500' : 'focus:border-red-500 focus:ring-red-500'}`;

  const inputReadOnly =
    'mt-1 block w-full rounded-md bg-gray-600 text-cyan-300 placeholder-gray-500 ' +
    'border border-cyan-700 px-3 py-2 text-sm cursor-not-allowed';

  const inputDisabled =
    'mt-1 block w-full rounded-md bg-gray-600 text-gray-500 placeholder-gray-600 ' +
    'border border-gray-600 px-3 py-2 text-sm cursor-not-allowed';
  const fetchPincodesForCity = useCallback(async (cityName) => {
    if (!cityName) return;
    setLoadingPincodes(true);
    setPincodeOptions([]);
    setFormData(prev => ({ ...prev, pincode: '' }));
    try {
      const res = await fetch(
        `https://api.postalpincode.in/postoffice/${encodeURIComponent(cityName)}`
      );
      const data = await res.json();
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const pins = [...new Set(data[0].PostOffice.map(po => po.Pincode))].sort();
        setPincodeOptions(pins);
        if (pins.length === 1) {
          setFormData(prev => ({ ...prev, pincode: pins[0] }));
          toast.success('Pincode auto-filled ✓');
        }
      } else {
        setPincodeOptions([]);
        toast('No pincodes found for this city. Please enter manually.', { icon: 'ℹ️' });
      }
    } catch {
      setPincodeOptions([]);
      toast.error('Failed to fetch pincodes. Please enter manually.');
    } finally {
      setLoadingPincodes(false);
    }
  }, []);

  useEffect(() => { fetchPrograms(); }, []);

  const fetchPrograms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/masters/programs');
      setPrograms(response.data);
    } catch {
      toast.error('Failed to fetch programs');
    }
  };

  useEffect(() => {
    if (!isEditMode) return;
    const loadApplicant = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/applicants/${id}`);

        // Determine admission type from quotaType
        const qt = data.quotaType;
        const type = (qt === 'KCET' || qt === 'COMEDK') ? 'government' : 'management';
        setAdmissionType(type);

        let programId = '';
        if (data.program) {
          programId = typeof data.program === 'object' ? data.program._id : data.program;
        }
        setSelectedProgram(programId);

        // Restore state ISO
        const stateObj = indianStates.find(s => s.name === data.state);
        if (stateObj) {
          setSelectedStateIso(stateObj.isoCode);
          const cities = City.getCitiesOfState('IN', stateObj.isoCode);
          setCityList(cities);
        }

        // Keep pincode as-is (manual fallback)
        if (data.pincode) setPincodeOptions([data.pincode]);

        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          category: data.category || '',
          entryType: data.entryType || '',
          quotaType: data.quotaType || '',
          marks: data.marks || '',
          qualifyingExam: data.qualifyingExam || '',
          allotmentNumber: data.allotmentNumber || '',
        });
      } catch {
        toast.error('Failed to load applicant data');
        navigate('/applicants');
      } finally {
        setPageLoading(false);
      }
    };
    loadApplicant();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkSeatAvailability = useCallback(async () => {
    if (!selectedProgram) return;
    setCheckingSeats(true);
    const availability = { KCET: null, COMEDK: null, Management: null };
    for (const quota of ['KCET', 'COMEDK', 'Management']) {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/applicants/remaining-seats/${selectedProgram}/${quota}`
        );
        availability[quota] = res.data;
      } catch {
        availability[quota] = null;
      }
    }
    setSeatAvailability(availability);
    setCheckingSeats(false);
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram && admissionType) checkSeatAvailability();
  }, [selectedProgram, admissionType, checkSeatAvailability]);

  const checkEmailUniqueness = async (email) => {
    if (!email) { setUniquenessStatus(p => ({ ...p, email: { isValid: true, message: '' } })); return; }
    setCheckingUniqueness(p => ({ ...p, email: true }));
    try {
      const { data } = await axios.get('http://localhost:5000/api/applicants');
      // In edit mode, exclude the current applicant from the check
      const exists = data.some(a => a.email === email && a._id !== id);
      setUniquenessStatus(p => ({
        ...p,
        email: exists
          ? { isValid: false, message: 'This email is already registered. Please use a different email.' }
          : { isValid: true, message: 'Email is available ✓' },
      }));
    } catch (err) { console.error('Error checking email:', err); }
    finally { setCheckingUniqueness(p => ({ ...p, email: false })); }
  };

  const checkPhoneUniqueness = async (phone) => {
    if (!phone) { setUniquenessStatus(p => ({ ...p, phone: { isValid: true, message: '' } })); return; }
    setCheckingUniqueness(p => ({ ...p, phone: true }));
    try {
      const { data } = await axios.get('http://localhost:5000/api/applicants');
      const exists = data.some(a => a.phone === phone && a._id !== id);
      setUniquenessStatus(p => ({
        ...p,
        phone: exists
          ? { isValid: false, message: 'This phone number is already registered. Please use a different number.' }
          : { isValid: true, message: 'Phone number is available ✓' },
      }));
    } catch (err) { console.error('Error checking phone:', err); }
    finally { setCheckingUniqueness(p => ({ ...p, phone: false })); }
  };

  const checkAllotmentNumberUniqueness = async (allotmentNumber) => {
    if (!allotmentNumber || admissionType !== 'government') {
      setUniquenessStatus(p => ({ ...p, allotmentNumber: { isValid: true, message: '' } })); return;
    }
    setCheckingUniqueness(p => ({ ...p, allotmentNumber: true }));
    try {
      const { data } = await axios.get('http://localhost:5000/api/applicants');
      const exists = data.some(a => a.allotmentNumber === allotmentNumber && a._id !== id);
      setUniquenessStatus(p => ({
        ...p,
        allotmentNumber: exists
          ? { isValid: false, message: 'This allotment number is already used. Please verify and enter correct number.' }
          : { isValid: true, message: 'Allotment number is valid ✓' },
      }));
    } catch (err) { console.error('Error checking allotment number:', err); }
    finally { setCheckingUniqueness(p => ({ ...p, allotmentNumber: false })); }
  };

  const handleStateChange = (e) => {
    const isoCode = e.target.value;
    const stateObj = indianStates.find(s => s.isoCode === isoCode);
    const stateName = stateObj?.name || '';
    setSelectedStateIso(isoCode);
    const cities = City.getCitiesOfState('IN', isoCode);
    setCityList(cities);
    setPincodeOptions([]);
    setFormData(prev => ({ ...prev, state: stateName, city: '', pincode: '' }));
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFormData(prev => ({ ...prev, city: cityName, pincode: '' }));
    setPincodeOptions([]);
    if (cityName) fetchPincodesForCity(cityName);
  };

  const handlePincodeChange = (e) => {
    setFormData(prev => ({ ...prev, pincode: e.target.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (value && !emailRegex.test(value)) {
        setUniquenessStatus(p => ({ ...p, email: { isValid: false, message: 'Email must be a valid Gmail address (@gmail.com)' } }));
      } else {
        checkEmailUniqueness(value);
      }
    }
    if (name === 'phone') {
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      if (value && !phoneRegex.test(value)) {
        setUniquenessStatus(p => ({ ...p, phone: { isValid: false, message: 'Phone must be a valid Indian number (10 digits starting 6-9, optional +91)' } }));
      } else {
        checkPhoneUniqueness(value);
      }
    }
    if (name === 'allotmentNumber') checkAllotmentNumberUniqueness(value);
  };

  const handleDateChange = (e) => {
    setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }));
  };

  const handleAdmissionTypeChange = (type) => {
    setAdmissionType(type);
    setSelectedProgram('');
    setFormData(prev => ({ ...prev, quotaType: '', allotmentNumber: '' }));
    setUniquenessStatus({
      email: { isValid: true, message: '' },
      phone: { isValid: true, message: '' },
      allotmentNumber: { isValid: true, message: '' },
    });
  };

  const handleProgramChange = (e) => {
    setSelectedProgram(e.target.value);
    setFormData(prev => ({ ...prev, quotaType: '', allotmentNumber: '' }));
  };

  const handleQuotaChange = (e) => {
    const quotaType = e.target.value;
    if (!isEditMode && seatAvailability[quotaType] && !seatAvailability[quotaType].isAvailable) {
      toast.error(`No seats available in ${quotaType} quota. All seats are filled.`);
      return;
    }
    setFormData(prev => ({ ...prev, quotaType, allotmentNumber: '' }));
  };

  const validateForm = () => {
    if (!selectedProgram) { toast.error('Please select a program'); return false; }
    if (!uniquenessStatus.email.isValid) { toast.error(uniquenessStatus.email.message); return false; }
    if (!uniquenessStatus.phone.isValid) { toast.error(uniquenessStatus.phone.message); return false; }
    if (admissionType === 'government' && formData.quotaType && !uniquenessStatus.allotmentNumber.isValid) {
      toast.error(uniquenessStatus.allotmentNumber.message); return false;
    }
    if (!formData.quotaType) { toast.error('Please select a quota type'); return false; }
    if (!isEditMode) {
      const availability = seatAvailability[formData.quotaType];
      if (availability && !availability.isAvailable) {
        toast.error(`No seats available in ${formData.quotaType} quota.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/applicants/${id}`, { ...formData });
        toast.success('Applicant updated successfully! Redirecting…');
        setTimeout(() => navigate(`/applicants/${id}`), 1000);
      } else {
        const response = await axios.post('http://localhost:5000/api/applicants', { ...formData });
        toast.success('Applicant created successfully! Redirecting…');
        setTimeout(() => navigate(`/applicants/${response.data._id}`), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} applicant`);
      setLoading(false);
    }
  };

  const getAvailableQuotas = () => {
    if (isEditMode) {
      // In edit mode show all quotas for the admission type without seat check
      if (admissionType === 'government') return ['KCET', 'COMEDK'];
      if (admissionType === 'management') return ['Management'];
      return [];
    }
    if (admissionType === 'government') return ['KCET', 'COMEDK'].filter(q => seatAvailability[q]?.isAvailable);
    if (admissionType === 'management') return ['Management'].filter(q => seatAvailability[q]?.isAvailable);
    return [];
  };

  const getMaxDate = () => {
    const t = new Date();
    return new Date(t.getFullYear() - 18, t.getMonth(), t.getDate()).toISOString().split('T')[0];
  };
  const getMinDate = () => {
    const t = new Date();
    return new Date(t.getFullYear() - 70, t.getMonth(), t.getDate()).toISOString().split('T')[0];
  };

  const isSubmitDisabled =
    loading ||
    !selectedProgram ||
    (!isEditMode && getAvailableQuotas().length === 0) ||
    !uniquenessStatus.email.isValid ||
    !uniquenessStatus.phone.isValid ||
    (admissionType === 'government' && formData.quotaType && !uniquenessStatus.allotmentNumber.isValid);

    
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner animate-spin" />
      </div>
    );
  }
  if (!admissionType && !isEditMode) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-100">Add New Applicant</h1>
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
            className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-150"
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
          {isEditMode
            ? 'Edit Applicant'
            : `Add New Applicant — ${admissionType === 'government' ? 'Government Admission' : 'Management Admission'}`}
        </h1>
        <button
          onClick={() => isEditMode ? navigate(`/applicants/${id}`) : setAdmissionType('')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-150"
        >
          {isEditMode ? 'Back to Details' : 'Back to Selection'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Program + Quota + Allotment ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Select Program *</label>
              <select 
                required 
                value={selectedProgram} 
                onChange={handleProgramChange} 
                className={inputBase}
              >
                <option value="">Select Program</option>
                {programs.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.code}) - Intake: {p.totalIntake}
                  </option>
                ))}
              </select>
            </div>

            {selectedProgram && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Quota Type *</label>
                {checkingSeats && !isEditMode ? (
                  <div className="mt-2 text-gray-400 text-sm">Checking seat availability...</div>
                ) : (
                  <>
                    <select 
                      required 
                      value={formData.quotaType} 
                      onChange={handleQuotaChange} 
                      className={inputBase}
                    >
                      <option value="">Select Quota</option>
                      {getAvailableQuotas().map(quota => (
                        <option key={quota} value={quota}>
                          {isEditMode
                            ? quota
                            : `${quota} — Available: ${seatAvailability[quota]?.remainingSeats} / ${seatAvailability[quota]?.totalSeats} seats`}
                        </option>
                      ))}
                    </select>
                    {!isEditMode && getAvailableQuotas().length === 0 && (
                      <p className="mt-2 text-sm text-red-400">No seats available for this program.</p>
                    )}
                  </>
                )}
              </div>
            )}

            {admissionType === 'government' && formData.quotaType && (
              <div>
                <label className="block text-sm font-medium text-gray-300">Allotment Number *</label>
                <input
                  type="text" name="allotmentNumber" required
                  value={formData.allotmentNumber} onChange={handleChange}
                  placeholder="Enter government allotment number"
                  className={inputWithValidation(uniquenessStatus.allotmentNumber.isValid)}
                />
                {checkingUniqueness.allotmentNumber && <p className="mt-1 text-xs text-gray-400">Checking...</p>}
                {!checkingUniqueness.allotmentNumber && uniquenessStatus.allotmentNumber.message && (
                  <p className={`mt-1 text-xs ${uniquenessStatus.allotmentNumber.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {uniquenessStatus.allotmentNumber.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Personal details ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Full Name *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className={inputBase} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Email *</label>
              <input
                type="email" name="email" required value={formData.email} onChange={handleChange}
                placeholder="example@gmail.com"
                className={inputWithValidation(uniquenessStatus.email.isValid)}
              />
              {checkingUniqueness.email && <p className="mt-1 text-xs text-gray-400">Checking availability...</p>}
              {!checkingUniqueness.email && uniquenessStatus.email.message && (
                <p className={`mt-1 text-xs ${uniquenessStatus.email.isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {uniquenessStatus.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Phone *</label>
              <input
                type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                placeholder="+919876543210 or 9876543210"
                className={inputWithValidation(uniquenessStatus.phone.isValid)}
              />
              {checkingUniqueness.phone && <p className="mt-1 text-xs text-gray-400">Checking availability...</p>}
              {!checkingUniqueness.phone && uniquenessStatus.phone.message && (
                <p className={`mt-1 text-xs ${uniquenessStatus.phone.isValid ? 'text-green-400' : 'text-red-400'}`}>
                  {uniquenessStatus.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Date of Birth *</label>
              <input
                type="date" name="dateOfBirth" required value={formData.dateOfBirth}
                onChange={handleDateChange} min={getMinDate()} max={getMaxDate()}
                className={inputBase}
              />
              <p className="mt-1 text-xs text-gray-500">Age must be between 18 and 70 years</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Address *</label>
              <textarea name="address" required value={formData.address} onChange={handleChange} rows="2" className={inputBase} />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-300">State *</label>
              <select required value={selectedStateIso} onChange={handleStateChange} className={inputBase}>
                <option value="">Select State</option>
                {indianStates.map(s => (
                  <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                City *
                {cityList.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-cyan-400">({cityList.length} cities)</span>
                )}
              </label>
              <select
                required value={formData.city} onChange={handleCityChange}
                disabled={!selectedStateIso} className={inputBase}
              >
                <option value="">{selectedStateIso ? 'Select City' : 'Select a state first'}</option>
                {cityList.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              {loadingPincodes && (
                <p className="mt-1 text-xs text-cyan-400 animate-pulse">⟳ Fetching pincodes for {formData.city}…</p>
              )}
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Pincode *
                {pincodeOptions.length > 1 && (
                  <span className="ml-2 text-xs font-normal text-cyan-400">({pincodeOptions.length} pincodes found)</span>
                )}
                {pincodeOptions.length === 1 && formData.pincode && (
                  <span className="ml-2 text-xs font-normal text-green-400">Auto-filled ✓</span>
                )}
              </label>
              {pincodeOptions.length > 1 ? (
                <select required value={formData.pincode} onChange={handlePincodeChange} disabled={loadingPincodes} className={inputBase}>
                  <option value="">Select Pincode</option>
                  {pincodeOptions.map(pin => (
                    <option key={pin} value={pin}>{pin}</option>
                  ))}
                </select>
              ) : pincodeOptions.length === 1 ? (
                <input type="text" required value={formData.pincode} readOnly className={inputReadOnly} />
              ) : (
                <input
                  type="text" name="pincode" required value={formData.pincode}
                  onChange={handlePincodeChange}
                  placeholder={
                    loadingPincodes ? 'Fetching pincodes…' :
                    formData.city    ? 'Enter 6-digit pincode' :
                    'Select a city first'
                  }
                  maxLength={6} pattern="\d{6}"
                  disabled={!formData.city || loadingPincodes}
                  className={inputBase}
                />
              )}
              <p className="mt-1 text-xs text-gray-500">Select State → City to auto-populate pincode options</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Category *</label>
              <select name="category" required value={formData.category} onChange={handleChange} className={inputBase}>
                <option value="">Select Category</option>
                <option value="GM">GM</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
              </select>
            </div>

            {/* Entry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Entry Type *</label>
              <select name="entryType" required value={formData.entryType} onChange={handleChange} className={inputBase}>
                <option value="">Select Entry Type</option>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>

            {/* Marks */}
            <div>
              <label className="block text-sm font-medium text-gray-300">Marks (%) *</label>
              <input
                type="number" name="marks" required step="0.01" min="0" max="100"
                value={formData.marks} onChange={handleChange} className={inputBase}
              />
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => isEditMode ? navigate(`/applicants/${id}`) : navigate('/applicants')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`btn-primary ${isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading
                ? (isEditMode ? 'Saving...' : 'Creating...')
                : (isEditMode ? 'Save Changes' : 'Create Applicant')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ApplicantForm;