import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { 
  FiUsers, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiFileText,
  FiTrendingUp,
  FiPieChart,
  FiBarChart2,
  FiDollarSign,
  FiClock
} from 'react-icons/fi';
import { MdSchool, MdVerified } from 'react-icons/md';

const Dashboard = () => {
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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center text-gray-400">No data available</div>;
  }

  const admissionData = [
    { name: 'Admitted', value: dashboardData.summary.totalAdmitted, color: '#06B6D4' },
    { name: 'Remaining', value: dashboardData.summary.remainingSeats, color: '#F59E0B' },
  ];

  const quotaData = [
    { name: 'KCET', filled: dashboardData.quotaWise.KCET.filled, total: dashboardData.quotaWise.KCET.total, fill: '#06B6D4' },
    { name: 'COMEDK', filled: dashboardData.quotaWise.COMEDK.filled, total: dashboardData.quotaWise.COMEDK.total, fill: '#8B5CF6' },
    { name: 'Management', filled: dashboardData.quotaWise.Management.filled, total: dashboardData.quotaWise.Management.total, fill: '#EC4899' },
  ];

  const documentData = [
    { name: 'Pending', value: dashboardData.documents.pending, color: '#F59E0B', label: 'Pending', icon: <FiClock /> },
    { name: 'Submitted', value: dashboardData.documents.submitted, color: '#06B6D4', label: 'Submitted', icon: <FiFileText /> },
    { name: 'Verified', value: dashboardData.documents.verified, color: '#10B981', label: 'Verified', icon: <MdVerified /> },
  ];

  const nonZeroDocumentData = documentData.filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm">{payload[0].name}</p>
          <p className="text-cyan-400 font-bold text-lg">{payload[0].value}</p>
          <p className="text-gray-500 text-xs mt-1">applicants</p>
        </div>
      );
    }
    return null;
  };

  const totalDocuments = dashboardData.documents.pending + dashboardData.documents.submitted + dashboardData.documents.verified;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-teal-600/20 rounded-xl shadow-lg p-6 border border-cyan-500/30">
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <FiTrendingUp className="text-cyan-400" />
          Dashboard Overview
        </h2>
        <p className="text-gray-400 mt-2">Track your admission progress and seat allocation status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <MdSchool className="text-cyan-400" />
                Total Intake
              </p>
              <p className="text-3xl font-bold text-cyan-400 mt-2">{dashboardData.summary.totalIntake}</p>
              <p className="text-xs text-gray-500 mt-1">Total available seats</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <MdSchool className="text-2xl text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <FiCheckCircle className="text-green-400" />
                Total Admitted
              </p>
              <p className="text-3xl font-bold text-green-400 mt-2">{dashboardData.summary.totalAdmitted}</p>
              <p className="text-xs text-gray-500 mt-1">{dashboardData.summary.admissionPercentage}% of total</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-2xl text-green-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <FiAlertCircle className="text-yellow-400" />
                Remaining Seats
              </p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{dashboardData.summary.remainingSeats}</p>
              <p className="text-xs text-gray-500 mt-1">Still available</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <FiBarChart2 className="text-2xl text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
                <FiFileText className="text-red-400" />
                Pending Documents
              </p>
              <p className="text-3xl font-bold text-red-400 mt-2">{dashboardData.documents.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Need verification</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <FiFileText className="text-2xl text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admission Status Pie Chart */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <FiPieChart className="text-cyan-400" />
            Admission Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={admissionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {admissionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Quota-wise Bar Chart */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <FiBarChart2 className="text-cyan-400" />
            Quota-wise Seat Filling
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quotaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Bar dataKey="filled" fill="#06B6D4" name="Filled Seats" />
              <Bar dataKey="total" fill="#374151" name="Total Seats" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Document Status and Fee Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Verification Status */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <FiFileText className="text-cyan-400" />
            Document Verification Status
          </h3>
          {totalDocuments > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={nonZeroDocumentData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {nonZeroDocumentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Document Status Legend with counts */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-700">
                {documentData.map((status) => (
                  <div key={status.name} className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        {status.icon}
                        {status.name}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-100 mt-1">{status.value}</p>
                    <p className="text-xs text-gray-500">
                      {totalDocuments > 0 ? ((status.value / totalDocuments) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-400">No documents uploaded yet</p>
            </div>
          )}
        </div>

        {/* Fee Payment Status */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <FiDollarSign className="text-cyan-400" />
            Fee Payment Status
          </h3>
          <div className="flex items-center justify-around h-64">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto border-2 border-green-500/50">
                <div>
                  <div className="text-4xl font-bold text-green-400">{dashboardData.fees.paid}</div>
                  <p className="text-xs text-gray-400 mt-1">Students</p>
                </div>
              </div>
              <p className="text-green-400 font-semibold mt-3 flex items-center justify-center gap-1">
                <FiCheckCircle /> Paid
              </p>
              <p className="text-xs text-gray-500 mt-1">{dashboardData.fees.paid} students paid fees</p>
            </div>
            
            <div className="w-px h-32 bg-gray-700"></div>
            
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500/20 to-red-500/20 flex items-center justify-center mx-auto border-2 border-yellow-500/50">
                <div>
                  <div className="text-4xl font-bold text-yellow-400">{dashboardData.fees.pending}</div>
                  <p className="text-xs text-gray-400 mt-1">Students</p>
                </div>
              </div>
              <p className="text-yellow-400 font-semibold mt-3 flex items-center justify-center gap-1">
                <FiClock /> Pending
              </p>
              <p className="text-xs text-gray-500 mt-1">{dashboardData.fees.pending} students pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Program-wise Details Table */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <FiUsers className="text-cyan-400" />
            Program-wise Detailed Report
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="table-header">Program</th>
                <th className="table-header">Total Intake</th>
                <th className="table-header">Filled</th>
                <th className="table-header">Remaining</th>
                <th className="table-header">Fill Rate</th>
                <th className="table-header">Quota-wise Filling</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {dashboardData.programs.map((program, index) => {
                const fillRate = (program.filled / program.totalIntake * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                    <td className="table-cell font-medium text-gray-200">{program.name}</td>
                    <td className="table-cell">{program.totalIntake}</td>
                    <td className="table-cell">
                      <span className="text-green-400 font-semibold">{program.filled}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-yellow-400">{program.remaining}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${fillRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-300">{fillRate}%</span>
                      </div>
                    </td>
                    <td className="table-cell text-sm">
                      {program.quotas.map((quota, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs">
                          <span className="font-medium text-gray-400">{quota.name}:</span>
                          <span className="text-green-400">{quota.filled}</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-gray-400">{quota.seats}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;