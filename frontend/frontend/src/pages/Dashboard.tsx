import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, Briefcase, MapPin, Phone, Mail, Clock, UserCircle } from 'lucide-react';
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

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-bl-full -mr-4 -mt-4 opacity-20 group-hover:scale-110 transition-transform`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-4xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg} text-white shadow-lg`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Dashboard Overview' : `Welcome back, ${employee?.first_name}!`}
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Staff" value={stats.total} icon={Users} bg="bg-blue-600" />
              <StatCard title="Present Today" value={stats.present} icon={Calendar} bg="bg-green-500" />
              <StatCard title="Active" value={stats.active} icon={Briefcase} bg="bg-purple-500" />
            </div>

            {/* Responsive Employee List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Team Directory</h2>
              </div>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr><th className="px-6 py-4">Employee</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employeesList.map((emp: any) => (
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{emp.first_name} {emp.last_name}</td>
                        <td className="px-6 py-4 capitalize">{emp.role}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${emp.status==='active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{emp.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards Stack */}
              <div className="md:hidden p-4 space-y-4">
                {employeesList.map((emp: any) => (
                  <div key={emp.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                           {emp.first_name[0]}
                        </div>
                        <div>
                           <h4 className="font-bold text-gray-900">{emp.first_name} {emp.last_name}</h4>
                           <p className="text-xs text-gray-500 capitalize">{emp.role}</p>
                        </div>
                     </div>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${emp.status==='active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{emp.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                <div className="relative z-10">
                   <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                      <UserCircle size={32} />
                   </div>
                   <h2 className="text-3xl font-bold">{employee?.first_name} {employee?.last_name}</h2>
                   <p className="text-blue-100 mt-1">{employee?.position || 'Employee'}</p>
                   <div className="mt-8 pt-8 border-t border-blue-500/30 grid grid-cols-2 gap-4">
                      <div><p className="text-xs text-blue-200 uppercase">Emp Code</p><p className="font-semibold">{employee?.employee_code}</p></div>
                      <div><p className="text-xs text-blue-200 uppercase">Joined</p><p className="font-semibold">{employee?.date_of_joining}</p></div>
                   </div>
                </div>
             </div>
             <StatCard title="Current Salary" value={`$${employee?.salary}`} icon={DollarSign} bg="bg-green-500" />
          </div>
        )}
      </div>
    </Layout>
  );
}