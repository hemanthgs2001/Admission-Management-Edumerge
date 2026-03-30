import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const TAB_ORDER = ['institution', 'campus', 'department', 'program'];

const tabConfig = [
  { key: 'institution', label: 'Institution' },
  { key: 'campus',      label: 'Campus' },
  { key: 'department',  label: 'Department' },
  { key: 'program',     label: 'Program' },
];

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Masters = () => {
  const [institutions, setInstitutions] = useState([]);
  const [campuses,     setCampuses]     = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [programs,     setPrograms]     = useState([]);

  const [activeTab,  setActiveTab]  = useState('institution');
  const [formData,   setFormData]   = useState({});
  const [loading,    setLoading]    = useState(false);
  const [codeError,  setCodeError]  = useState('');
  const [editingId,  setEditingId]  = useState(null);

  const currentIndex = TAB_ORDER.indexOf(activeTab);
  const isFirst      = currentIndex === 0;
  const isLast       = currentIndex === TAB_ORDER.length - 1;

  const inputClass =
    'mt-1 block w-full rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 ' +
    'border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ' +
    'focus:outline-none px-3 py-2 text-sm transition duration-150';

  useEffect(() => {
    setFormData({});
    setCodeError('');
    setEditingId(null);
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'institution') {
        const [instRes, campRes] = await Promise.all([
          axios.get('http://localhost:5000/api/masters/institutions'),
          axios.get('http://localhost:5000/api/masters/campuses'),
        ]);
        setInstitutions(instRes.data);
        setCampuses(campRes.data);
      } else if (activeTab === 'campus') {
        const [campRes, instRes] = await Promise.all([
          axios.get('http://localhost:5000/api/masters/campuses'),
          axios.get('http://localhost:5000/api/masters/institutions'),
        ]);
        setCampuses(campRes.data);
        setInstitutions(instRes.data);
      } else if (activeTab === 'department') {
        const [deptRes, campRes] = await Promise.all([
          axios.get('http://localhost:5000/api/masters/departments'),
          axios.get('http://localhost:5000/api/masters/campuses'),
        ]);
        setDepartments(deptRes.data);
        setCampuses(campRes.data);
      } else if (activeTab === 'program') {
        const [progRes, deptRes] = await Promise.all([
          axios.get('http://localhost:5000/api/masters/programs'),
          axios.get('http://localhost:5000/api/masters/departments'),
        ]);
        setPrograms(progRes.data);
        setDepartments(deptRes.data);
      }
    } catch {
      toast.error('Failed to fetch data');
    }
  };

  
  const goNext     = () => !isLast  && setActiveTab(TAB_ORDER[currentIndex + 1]);
  const goPrevious = () => !isFirst && setActiveTab(TAB_ORDER[currentIndex - 1]);

  
  const handleEditClick = (program) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const departmentId =
      (typeof program.department === 'object' && program.department !== null)
        ? program.department._id
        : program.departmentId || program.department || '';

    setEditingId(program._id);
    setFormData({
      _id:          program._id,
      name:         program.name         || '',
      code:         program.code         || '',
      departmentId,
      academicYear: program.academicYear  || '',
      courseType:   program.courseType    || '',
      entryType:    program.entryType     || '',
      totalIntake:  program.totalIntake   || '',
      quotas:       program.quotas        || [],
    });
    setCodeError('');
    toast.success(`Editing "${program.name}" — update the fields and save.`);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setCodeError('');
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'institution') {
        await axios.post('http://localhost:5000/api/masters/institutions', formData);
        toast.success('Institution created successfully');
        setFormData({});
        setCodeError('');
        await fetchData();
        goNext();                         

      } else if (activeTab === 'campus') {
        await axios.post('http://localhost:5000/api/masters/campuses', formData);
        toast.success('Campus created successfully');
        setFormData({});
        setCodeError('');
        await fetchData();
        goNext();                         

      } else if (activeTab === 'department') {
        await axios.post('http://localhost:5000/api/masters/departments', formData);
        toast.success('Department created successfully');
        setFormData({});
        setCodeError('');
        await fetchData();
        goNext();                         

      } else if (activeTab === 'program') {
        if (editingId) {
          await axios.put(
            `http://localhost:5000/api/masters/programs/${editingId}`,
            formData
          );
          toast.success('Program updated successfully');
          setEditingId(null);
        } else {
          await axios.post('http://localhost:5000/api/masters/programs', formData);
          toast.success('Program created successfully');
        }
        setFormData({});
        setCodeError('');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

 
  const renderActionRow = ({ submitDisabled = false, isUpdate = false } = {}) => (
    <div className="flex items-center justify-between pt-2">
      {/* Previous */}
      <button
        type="button"
        onClick={goPrevious}
        disabled={isFirst}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border transition
          ${isFirst
            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
            : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
      >
        <ChevronLeft />
        Previous
      </button>

      <div className="flex items-center gap-3">
        {/* Cancel (edit mode only) */}
        {isUpdate && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-4 py-2 rounded-md text-sm border border-gray-600 text-gray-300 hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        )}

        {/* Primary submit */}
        <button
          type="submit"
          disabled={submitDisabled || loading}
          className={`btn-primary ${(submitDisabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading
            ? (isUpdate ? 'Updating...' : 'Creating...')
            : (isUpdate
                ? 'Update Program'
                : `Create ${tabConfig.find(t => t.key === activeTab)?.label}`)}
        </button>

        {/* Next (only on tabs that are not the last) */}
        {!isLast && (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition"
          >
            Next
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );

  
  const renderForm = () => {
    switch (activeTab) {
      case 'institution':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Institution Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., ABC College of Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Institution Code</label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={inputClass}
                  placeholder="e.g., ABCE"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used in admission number format: CODE/2026/UG/CSE/KCET/0001
                </p>
              </div>
            </div>
            {renderActionRow()}
          </form>
        );

      case 'campus':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Campus Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Main Campus"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Institution</label>
                <select
                  required
                  value={formData.institutionId || ''}
                  onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Institution</option>
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name} ({inst.code})</option>
                  ))}
                </select>
              </div>
            </div>
            {renderActionRow()}
          </form>
        );

      // ── Department ───────────────────────────────────────────────────────
      case 'department':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Department Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Campus</label>
                <select
                  required
                  value={formData.campusId || ''}
                  onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Campus</option>
                  {campuses.map(campus => (
                    <option key={campus._id} value={campus._id}>{campus.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {renderActionRow()}
          </form>
        );

      // ── Program ──────────────────────────────────────────────────────────
      case 'program':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Edit-mode notice banner */}
            {editingId && (
              <div className="flex items-center justify-between gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2.5 text-sm text-yellow-300">
                <div className="flex items-center gap-2">
                  <EditIcon />
                  <span>
                    Editing <span className="font-semibold">"{formData.name}"</span>
                    {' '}— update the fields and save.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-yellow-400/70 hover:text-yellow-300 text-xs underline underline-offset-2"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Program Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Computer Science and Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Program Code</label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => {
                    const upperCode = e.target.value.toUpperCase();
                    // Skip self-duplicate check in edit mode
                    const exists = programs.some(p => p.code === upperCode && p._id !== editingId);
                    setCodeError(exists ? 'Program Code already exists' : '');
                    setFormData({ ...formData, code: upperCode });
                  }}
                  className={`${inputClass} ${codeError ? 'border-red-500' : ''}`}
                  placeholder="e.g., CSE, ECE, ME"
                />
                <p className="text-xs text-gray-500 mt-1">This code will be used in admission number format</p>
                {codeError && <p className="text-xs text-red-500 mt-1">{codeError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Department</label>
                <select
                  required
                  value={formData.departmentId || ''}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Academic Year</label>
                <input
                  type="text"
                  required
                  value={formData.academicYear || ''}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Course Type</label>
                <select
                  required
                  value={formData.courseType || ''}
                  onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Course Type</option>
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Entry Type</label>
                <select
                  required
                  value={formData.entryType || ''}
                  onChange={(e) => setFormData({ ...formData, entryType: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select Entry Type</option>
                  <option value="Regular">Regular</option>
                  <option value="Lateral">Lateral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Total Intake</label>
                <input
                  type="number"
                  required
                  value={formData.totalIntake || ''}
                  onChange={(e) => setFormData({ ...formData, totalIntake: parseInt(e.target.value) })}
                  className={inputClass}
                  placeholder="e.g., 60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quotas</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['KCET', 'COMEDK', 'Management'].map(quota => (
                  <div key={quota} className="flex items-center space-x-3">
                    <span className="w-28 text-sm text-gray-400">{quota}</span>
                    <input
                      type="number"
                      placeholder="Seats"
                      value={formData.quotas?.find(q => q.name === quota)?.seats || ''}
                      onChange={(e) => {
                        const quotas = formData.quotas ? [...formData.quotas] : [];
                        const index = quotas.findIndex(q => q.name === quota);
                        if (index >= 0) {
                          quotas[index] = { ...quotas[index], seats: parseInt(e.target.value) || 0 };
                        } else {
                          quotas.push({ name: quota, seats: parseInt(e.target.value) || 0 });
                        }
                        setFormData({ ...formData, quotas });
                      }}
                      className={`${inputClass} flex-1`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Total quota seats must equal total intake</p>
            </div>

            {/* Program is the last tab — no Next button shown */}
            {renderActionRow({ submitDisabled: !!codeError, isUpdate: !!editingId })}
          </form>
        );

      default:
        return null;
    }
  };

  // ── Tables ────────────────────────────────────────────────────────────────
  const renderTable = () => {
    const thClass = "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider";
    const tdClass = "px-6 py-4 text-sm text-gray-300";

    switch (activeTab) {
      case 'institution':
        return (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Code</th>
                <th className={thClass}>Campuses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {institutions.map(inst => (
                <tr key={inst._id} className="hover:bg-gray-700/40 transition duration-150">
                  <td className={tdClass}>{inst.name}</td>
                  <td className={tdClass}>
                    <span className="font-mono font-bold text-cyan-400">{inst.code}</span>
                  </td>
                  <td className={tdClass}>{inst.campuses?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'campus':
        return (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Institution</th>
                <th className={thClass}>Departments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {campuses.map(campus => (
                <tr key={campus._id} className="hover:bg-gray-700/40 transition duration-150">
                  <td className={tdClass}>{campus.name}</td>
                  <td className={tdClass}>
                    {campus.institution?.name}{' '}
                    <span className="text-cyan-400 font-mono">({campus.institution?.code})</span>
                  </td>
                  <td className={tdClass}>{campus.departments?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'department':
        return (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Campus</th>
                <th className={thClass}>Programs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {departments.map(dept => (
                <tr key={dept._id} className="hover:bg-gray-700/40 transition duration-150">
                  <td className={tdClass}>{dept.name}</td>
                  <td className={tdClass}>{dept.campus?.name}</td>
                  <td className={tdClass}>{dept.programs?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'program':
        return (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Code</th>
                <th className={thClass}>Department</th>
                <th className={thClass}>Total Intake</th>
                <th className={thClass}>Quotas</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {programs.map(program => (
                <tr
                  key={program._id}
                  className={`hover:bg-gray-700/40 transition duration-150 ${
                    editingId === program._id
                      ? 'bg-yellow-500/5 ring-1 ring-inset ring-yellow-500/20'
                      : ''
                  }`}
                >
                  <td className={tdClass}>{program.name}</td>
                  <td className={tdClass}>
                    <span className="font-mono text-cyan-400">{program.code}</span>
                  </td>
                  <td className={tdClass}>{program.department?.name}</td>
                  <td className={tdClass}>{program.totalIntake}</td>
                  <td className={tdClass}>
                    {program.quotas.map(q => `${q.name}: ${q.seats}`).join(', ')}
                  </td>
                  <td className={tdClass}>
                    <button
                      onClick={() => handleEditClick(program)}
                      title="Edit program"
                      className="p-1.5 rounded-md text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                    >
                      <EditIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Masters Configuration</h1>

      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">

        {/* Tab Navigation with step indicators */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-1 px-6">
            {tabConfig.map((tab, idx) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-4 text-sm font-medium transition duration-200 border-b-2 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-cyan-500 text-gray-900'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {idx + 1}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form + Table */}
        <div className="p-6">
          {renderForm()}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Existing Records</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              {renderTable()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Masters;