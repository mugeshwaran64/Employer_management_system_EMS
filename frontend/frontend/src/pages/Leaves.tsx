import { useEffect, useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import type { Leave } from '../types';

export function Leaves() {
  const { employee } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const isAdmin = employee?.is_admin;

  useEffect(() => {
    fetchLeaves();
  }, [employee]);

  const fetchLeaves = async () => {
    if (!employee) return;

    try {
      const { data } = await api.get('/leaves/');
      // Filter client side if not admin (or use backend filter)
      if (!isAdmin) {
          setLeaves(data.filter((l: Leave) => l.employee_id === employee.id));
      } else {
          setLeaves(data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      const days = calculateDays(formData.start_date, formData.end_date);
      await api.post('/leaves/', {
          employee_id: employee.id,
          ...formData,
          days
      });

      setShowModal(false);
      setFormData({
        leave_type: 'sick',
        start_date: '',
        end_date: '',
        reason: '',
      });
      await fetchLeaves();
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      alert('Failed to submit leave request');
    }
  };

  const handleApprove = async (leaveId: number) => {
    if (!employee) return;
    try {
      await api.patch(`/leaves/${leaveId}/`, {
        status: 'approved',
        approved_by: employee.id,
      });
      await fetchLeaves();
    } catch (error: any) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave');
    }
  };

  const handleReject = async (leaveId: number) => {
    if (!employee) return;
    try {
      await api.patch(`/leaves/${leaveId}/`, {
        status: 'rejected',
        approved_by: employee.id,
      });
      await fetchLeaves();
    } catch (error: any) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading leaves...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage employee leave requests' : 'View and apply for leaves'}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Apply Leave
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {isAdmin && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Leave Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Start Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">End Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Days</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  {isAdmin && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 6} className="text-center py-8 text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {isAdmin && (
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">
                            {leave.employees?.first_name} {leave.employees?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{leave.employees?.employee_code}</p>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                          {leave.leave_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(leave.start_date)}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(leave.end_date)}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium">{leave.days}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{leave.reason}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            leave.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : leave.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          {leave.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApprove(leave.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(leave.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply for Leave</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <select
                  id="leave_type"
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}