import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/applicants');
      setApplicants(response.data);
    } catch (error) {
      toast.error('Failed to fetch applicants');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Allocated':
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getDocStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'Submitted':
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    }
  };

  const getFeeStatusBadge = (status) => {
    return status === 'Paid'
      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Applicants</h1>
        {(user?.role === 'admin' || user?.role === 'admission_officer') && (
          <Link to="/applicants/new" className="btn-primary">
            + Add New Applicant
          </Link>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                {['Name', 'Email', 'Program', 'Quota', 'Documents', 'Fee', 'Status', 'Actions'].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {applicants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No applicants found.
                  </td>
                </tr>
              ) : (
                applicants.map((applicant) => (
                  <tr
                    key={applicant._id}
                    className="hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">{applicant.fullName}</div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{applicant.email}</div>
                    </td>

                    {/* Program */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {applicant.program?.name || (
                          <span className="text-gray-600 italic">Not Allocated</span>
                        )}
                      </div>
                    </td>

                    {/* Quota */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{applicant.quotaType}</div>
                    </td>

                    {/* Documents */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocStatusBadge(applicant.documents?.status)}`}>
                        {applicant.documents?.status}
                      </span>
                    </td>

                    {/* Fee */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getFeeStatusBadge(applicant.feeStatus)}`}>
                        {applicant.feeStatus}
                      </span>
                    </td>

                    {/* Admission Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(applicant.admissionStatus)}`}>
                        {applicant.admissionStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/applicants/${applicant._id}`}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-150"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Applicants;