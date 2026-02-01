import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import type { Attendance as AttendanceType } from '../types';

export function Attendance() {
  const { employee } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceType[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (employee) {
      fetchAttendance();
    }
  }, [employee, selectedMonth]);

  const fetchAttendance = async () => {
    if (!employee) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch Today's Record
      const { data: todayData } = await api.get(`/attendance/?employee_id=${employee.id}&date=${today}`);
      setTodayAttendance(todayData.length > 0 ? todayData[0] : null);

      // Fetch All Records (filtering by month logic should ideally be backend, but here we fetch all for this user and filter client side if needed, or update backend to accept month)
      // Since our simple backend filters by employee_id, we fetch all for the employee
      const { data: records } = await api.get(`/attendance/?employee_id=${employee.id}`);
      setAttendanceRecords(records || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!employee) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { data } = await api.post('/attendance/', {
        employee_id: employee.id,
        date: today,
        check_in: now,
        status: 'present',
      });

      setTodayAttendance(data);
      await fetchAttendance();
    } catch (error: any) {
      console.error('Error checking in:', error);
      alert('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    if (!employee || !todayAttendance) return;

    try {
      const now = new Date().toISOString();

      const { data } = await api.patch(`/attendance/${todayAttendance.id}/`, { 
          check_out: now 
      });

      setTodayAttendance(data);
      await fetchAttendance();
    } catch (error: any) {
      console.error('Error checking out:', error);
      alert('Failed to check out');
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading attendance...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track your daily attendance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Attendance</h2>

            {todayAttendance ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div>
                      <p className="font-medium text-gray-900">Checked In</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(todayAttendance.check_in)}
                      </p>
                    </div>
                  </div>
                  {!todayAttendance.check_out ? (
                    <button
                      onClick={handleCheckOut}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Check Out
                    </button>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-900">Checked Out</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(todayAttendance.check_out)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">You haven't checked in today</p>
                <button
                  onClick={handleCheckIn}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check In Now
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-blue-600">
                  {attendanceRecords.filter((r) => r.status === 'present').length}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Late Check-ins</p>
                <p className="text-2xl font-bold text-orange-600">
                  {attendanceRecords.filter((r) => {
                    if (!r.check_in) return false;
                    const checkInTime = new Date(r.check_in).getHours();
                    return checkInTime >= 10;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
            <div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check In</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check Out</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No attendance records found for this month
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatTime(record.check_in)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatTime(record.check_out)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-700'
                              : record.status === 'absent'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}