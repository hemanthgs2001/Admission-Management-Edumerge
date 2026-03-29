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
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'institution':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution Name</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Create Institution
            </button>
          </form>
        );
      case 'campus':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Campus Name</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <select
                required
                value={formData.institutionId || ''}
                onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Institution</option>
                {institutions.map(inst => (
                  <option key={inst._id} value={inst._id}>{inst.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Create Campus
            </button>
          </form>
        );
      case 'department':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department Name</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Campus</label>
              <select
                required
                value={formData.campusId || ''}
                onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Campus</option>
                {campuses.map(campus => (
                  <option key={campus._id} value={campus._id}>{campus.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Create Department
            </button>
          </form>
        );
      case 'program':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Program Name</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Program Code</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                required
                value={formData.departmentId || ''}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Year</label>
              <input
                type="text"
                required
                value={formData.academicYear || ''}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Type</label>
              <select
                required
                value={formData.courseType || ''}
                onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Course Type</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Entry Type</label>
              <select
                required
                value={formData.entryType || ''}
                onChange={(e) => setFormData({ ...formData, entryType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Entry Type</option>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Intake</label>
              <input
                type="number"
                required
                value={formData.totalIntake || ''}
                onChange={(e) => setFormData({ ...formData, totalIntake: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quotas</label>
              <div className="space-y-2">
                {['KCET', 'COMEDK', 'Management'].map(quota => (
                  <div key={quota} className="flex items-center space-x-2">
                    <span className="w-24">{quota}</span>
                    <input
                      type="number"
                      placeholder="Seats"
                      value={formData.quotas?.find(q => q.name === quota)?.seats || ''}
                      onChange={(e) => {
                        const quotas = formData.quotas || [];
                        const index = quotas.findIndex(q => q.name === quota);
                        if (index >= 0) {
                          quotas[index].seats = parseInt(e.target.value) || 0;
                        } else {
                          quotas.push({ name: quota, seats: parseInt(e.target.value) || 0 });
                        }
                        setFormData({ ...formData, quotas });
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Create Program
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Masters Configuration</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex space-x-4 px-6">
            <button
              onClick={() => setActiveTab('institution')}
              className={`py-4 px-2 ${activeTab === 'institution' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Institution
            </button>
            <button
              onClick={() => setActiveTab('campus')}
              className={`py-4 px-2 ${activeTab === 'campus' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Campus
            </button>
            <button
              onClick={() => setActiveTab('department')}
              className={`py-4 px-2 ${activeTab === 'department' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Department
            </button>
            <button
              onClick={() => setActiveTab('program')}
              className={`py-4 px-2 ${activeTab === 'program' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            >
              Program
            </button>
          </nav>
        </div>
        <div className="p-6">
          {renderForm()}
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Existing Records</h3>
            <div className="overflow-x-auto">
              {activeTab === 'institution' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campuses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map(inst => (
                      <tr key={inst._id}>
                        <td className="px-6 py-4">{inst.name}</td>
                        <td className="px-6 py-4">{inst.campuses?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'campus' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campuses.map(campus => (
                      <tr key={campus._id}>
                        <td className="px-6 py-4">{campus.name}</td>
                        <td className="px-6 py-4">{campus.institution?.name}</td>
                        <td className="px-6 py-4">{campus.departments?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'department' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campus</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map(dept => (
                      <tr key={dept._id}>
                        <td className="px-6 py-4">{dept.name}</td>
                        <td className="px-6 py-4">{dept.campus?.name}</td>
                        <td className="px-6 py-4">{dept.programs?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === 'program' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Intake</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quotas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map(program => (
                      <tr key={program._id}>
                        <td className="px-6 py-4">{program.name}</td>
                        <td className="px-6 py-4">{program.code}</td>
                        <td className="px-6 py-4">{program.department?.name}</td>
                        <td className="px-6 py-4">{program.totalIntake}</td>
                        <td className="px-6 py-4">
                          {program.quotas.map(q => `${q.name}: ${q.seats}`).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Masters;