import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

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

                    {/* Actions - Direct Icons */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {/* View Details Icon */}
                        <button
                          onClick={() => navigate(`/applicants/${applicant._id}`)}
                          className="p-1.5 rounded-md text-cyan-400 hover:text-cyan-300 hover:bg-gray-700 transition-colors duration-150 focus:outline-none"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* Edit Icon - Only for admin/admission_officer */}
                        {(user?.role === 'admin' || user?.role === 'admission_officer') && (
                          <button
                            onClick={() => navigate(`/applicants/${applicant._id}/edit`)}
                            className="p-1.5 rounded-md text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 transition-colors duration-150 focus:outline-none"
                            title="Edit Applicant"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        )}
                      </div>
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