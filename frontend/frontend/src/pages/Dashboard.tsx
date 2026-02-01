import { useEffect, useState } from 'react';
import { Users, Calendar, FileText, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  activeEmployees: number;
}

export function Dashboard() {
  const { employee } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    activeEmployees: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch all data lists (Since Dashboard stats endpoint isn't created, we calculate client-side for simplicity)
      const [employeesRes, attendanceRes, leavesRes] = await Promise.all([
        api.get('/employees/'),
        api.get(`/attendance/?date=${today}`),
        api.get('/leaves/')
      ]);

      const allEmployees = employeesRes.data;
      const todayAttendance = attendanceRes.data;
      const allLeaves = leavesRes.data;

      setStats({
        totalEmployees: allEmployees.length,
        presentToday: todayAttendance.filter((a: any) => a.status === 'present').length,
        pendingLeaves: allLeaves.filter((l: any) => l.status === 'pending').length,
        activeEmployees: allEmployees.filter((e: any) => e.status === 'active').length,
      });

      // Get recent leaves (last 5)
      setRecentLeaves(allLeaves.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceData = [
    { name: 'Mon', present: 45 },
    { name: 'Tue', present: 48 },
    { name: 'Wed', present: 46 },
    { name: 'Thu', present: 49 },
    { name: 'Fri', present: 47 },
  ];

  const isAdmin = employee?.is_admin;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {employee?.first_name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              <span className="text-green-600 font-medium">{stats.activeEmployees}</span> active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.presentToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {stats.totalEmployees > 0
                ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
                : 0}% attendance rate
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingLeaves}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="text-orange-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Requires approval</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalEmployees > 0
                    ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">This week average</p>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leave Requests</h2>
              <div className="space-y-3">
                {recentLeaves.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent leave requests</p>
                ) : (
                  recentLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {leave.employees?.first_name} {leave.employees?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {leave.leave_type} - {leave.days} days
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          leave.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : leave.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}