import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Masters = () => {
  const [institutions, setInstitutions] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [activeTab, setActiveTab] = useState('institution');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Always-visible gray border, turns cyan on focus
  const inputClass =
    'mt-1 block w-full rounded-md bg-gray-700 text-gray-100 placeholder-gray-500 ' +
    'border border-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 ' +
    'focus:outline-none px-3 py-2 text-sm transition duration-150';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'institution') {
        const res = await axios.get('http://localhost:5000/api/masters/institutions');
        setInstitutions(res.data);
      } else if (activeTab === 'campus') {
        const res = await axios.get('http://localhost:5000/api/masters/campuses');
        setCampuses(res.data);
      } else if (activeTab === 'department') {
        const res = await axios.get('http://localhost:5000/api/masters/departments');
        setDepartments(res.data);
      } else if (activeTab === 'program') {
        const res = await axios.get('http://localhost:5000/api/masters/programs');
        setPrograms(res.data);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'institution') {
        await axios.post('http://localhost:5000/api/masters/institutions', formData);
        toast.success('Institution created successfully');
      } else if (activeTab === 'campus') {
        await axios.post('http://localhost:5000/api/masters/campuses', formData);
        toast.success('Campus created successfully');
      } else if (activeTab === 'department') {
        await axios.post('http://localhost:5000/api/masters/departments', formData);
        toast.success('Department created successfully');
      } else if (activeTab === 'program') {
        await axios.post('http://localhost:5000/api/masters/programs', formData);
        toast.success('Program created successfully');
      }
      setFormData({});
      setCodeError('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const tabConfig = [
    { key: 'institution', label: 'Institution' },
    { key: 'campus',      label: 'Campus' },
    { key: 'department',  label: 'Department' },
    { key: 'program',     label: 'Program' },
  ];

  const submitLabel = {
    institution: 'Create Institution',
    campus:      'Create Campus',
    department:  'Create Department',
    program:     'Create Program',
  };

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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : submitLabel[activeTab]}
              </button>
            </div>
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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : submitLabel[activeTab]}
              </button>
            </div>
          </form>
        );

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
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : submitLabel[activeTab]}
              </button>
            </div>
          </form>
        );

      case 'program':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Program Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
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
                    const exists = programs.some(p => p.code === upperCode);
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !!codeError}
                className={`btn-primary ${(loading || !!codeError) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : submitLabel[activeTab]}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

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
                  <td className={tdClass}><span className="font-mono font-bold text-cyan-400">{inst.code}</span></td>
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
                  <td className={tdClass}>{campus.institution?.name} <span className="text-cyan-400 font-mono">({campus.institution?.code})</span></td>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {programs.map(program => (
                <tr key={program._id} className="hover:bg-gray-700/40 transition duration-150">
                  <td className={tdClass}>{program.name}</td>
                  <td className={tdClass}><span className="font-mono text-cyan-400">{program.code}</span></td>
                  <td className={tdClass}>{program.department?.name}</td>
                  <td className={tdClass}>{program.totalIntake}</td>
                  <td className={tdClass}>{program.quotas.map(q => `${q.name}: ${q.seats}`).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Masters Configuration</h1>

      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-1 px-6">
            {tabConfig.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-4 text-sm font-medium transition duration-200 border-b-2 ${
                  activeTab === tab.key
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {renderForm()}

          {/* Existing Records */}
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