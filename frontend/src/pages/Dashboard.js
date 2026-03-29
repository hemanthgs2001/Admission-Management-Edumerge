import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center">No data available</div>;
  }

  const admissionData = [
    { name: 'Admitted', value: dashboardData.summary.totalAdmitted },
    { name: 'Remaining', value: dashboardData.summary.remainingSeats },
  ];

  const quotaData = [
    { name: 'KCET', filled: dashboardData.quotaWise.KCET.filled, total: dashboardData.quotaWise.KCET.total },
    { name: 'COMEDK', filled: dashboardData.quotaWise.COMEDK.filled, total: dashboardData.quotaWise.COMEDK.total },
    { name: 'Management', filled: dashboardData.quotaWise.Management.filled, total: dashboardData.quotaWise.Management.total },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Intake vs Admitted</h3>
          <p className="text-2xl font-bold mt-2">{dashboardData.summary.totalAdmitted} / {dashboardData.summary.totalIntake}</p>
          <p className="text-sm text-gray-600 mt-1">Admission Rate: {dashboardData.summary.admissionPercentage}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Remaining Seats</h3>
          <p className="text-2xl font-bold mt-2">{dashboardData.summary.remainingSeats}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending Documents</h3>
          <p className="text-2xl font-bold mt-2">{dashboardData.documents.pending}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Admission Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={admissionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {admissionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quota-wise Seat Filling</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quotaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="filled" fill="#8884d8" name="Filled Seats" />
              <Bar dataKey="total" fill="#82ca9d" name="Total Seats" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Program-wise Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Program-wise Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Intake</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quota-wise Filling</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.programs.map((program, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.totalIntake}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.filled}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{program.remaining}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {program.quotas.map((quota, idx) => (
                      <div key={idx}>{quota.name}: {quota.filled}/{quota.seats}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;