import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, Briefcase, MapPin, Phone, Mail } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';

export function Dashboard() {
  const { employee } = useAuth();
  const isAdmin = employee?.is_admin;
  const [stats, setStats] = useState({ total: 0, active: 0, present: 0 });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [employee]);

  const fetchData = async () => {
    try {
      if (isAdmin) {
        // Admin: Fetch All Employees & Today's Attendance
        const [empRes, attRes] = await Promise.all([
          api.get('/employees/'),
          api.get(`/attendance/?date=${new Date().toISOString().split('T')[0]}`)
        ]);
        setEmployeesList(empRes.data);
        setStats({
          total: empRes.data.length,
          active: empRes.data.filter((e: any) => e.status === 'active').length,
          present: attRes.data.length
        });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const StatCard = ({ title, value, icon: Icon, color, subText }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        {subText && <p className={`text-xs mt-2 ${color === 'blue' ? 'text-blue-600' : 'text-green-600'}`}>{subText}</p>}
      </div>
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Overview' : `Hello, ${employee?.first_name} 👋`}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Manage your organization efficiently.' : 'Here is your daily activity summary.'}
          </p>
        </div>

        {/* --- ADMIN VIEW --- */}
        {isAdmin ? (
          <>
            {/* 1. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Employees" value={stats.total} icon={Users} color="blue" subText={`${stats.active} Active Accounts`} />
              <StatCard title="Present Today" value={stats.present} icon={Calendar} color="green" subText="Daily Attendance" />
              <StatCard title="Departments" value="4" icon={Briefcase} color="purple" subText="Operational Units" />
            </div>

            {/* 2. Professional Employee Directory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Employee Directory</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Role & Dept</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employeesList.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                              {emp.first_name[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                              <p className="text-xs text-gray-500">{emp.employee_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 font-medium capitalize">{emp.role}</p>
                          <p className="text-xs text-gray-500">{emp.departments?.name || 'General'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          <div className="flex flex-col gap-1">
                             <span className="flex items-center gap-2"><Mail size={12}/> {emp.email}</span>
                             <span className="flex items-center gap-2"><Phone size={12}/> {emp.phone || '-'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          // --- EMPLOYEE VIEW ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8"></div>
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                    {employee?.first_name[0]}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{employee?.first_name} {employee?.last_name}</h2>
                  <p className="text-gray-500 font-medium">{employee?.position || 'Employee'}</p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-gray-100">
                     <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Employee ID</p>
                        <p className="font-semibold text-gray-900">{employee?.employee_code}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Joined</p>
                        <p className="font-semibold text-gray-900">{employee?.date_of_joining || '-'}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Salary Card */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                     <DollarSign size={28} />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">Current Salary</h3>
                     <p className="text-sm text-gray-500">Monthly Compensation</p>
                  </div>
               </div>
               <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-3xl font-extrabold text-gray-900">
                    ${parseFloat(employee?.salary || '0').toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Basic Pay</p>
               </div>
               <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Department</span>
                     <span className="font-medium">{employee?.department_id || 'IT'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Location</span>
                     <span className="font-medium">{employee?.address || 'Office'}</span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}