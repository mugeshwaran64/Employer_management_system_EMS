import { useEffect, useState } from 'react';
import { Plus, Check, X, Clock } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';

export function Attendance() {
  const { employee } = useAuth();
  const isAdmin = employee?.is_admin;
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'present' });

  useEffect(() => { fetchAttendance(); if(isAdmin) fetchEmployees(); }, [employee]);

  const fetchAttendance = async () => {
    try { const { data } = await api.get('/attendance/'); setAttendanceRecords(data); } catch (e) { console.error(e); }
  };
  const fetchEmployees = async () => {
    try { const { data } = await api.get('/employees/'); setEmployeesList(data); } catch (e) { console.error(e); }
  };

  const handleAdminMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.post('/attendance/', { ...formData, check_in: new Date(`${formData.date}T09:00:00`).toISOString() });
        setShowModal(false); fetchAttendance(); alert('Success');
    } catch (error) { alert('Failed'); }
  };

  const formatTime = (time: string) => time ? new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Log</h1>
        {isAdmin && (
           <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white p-2 rounded-full md:px-4 md:py-2 md:rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/30">
             <Plus size={20} /> <span className="hidden md:inline">Mark Attendance</span>
           </button>
        )}
      </div>

      {/* --- DESKTOP VIEW (TABLE) --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
             <tr>
               <th className="px-6 py-4">Date</th>
               {isAdmin && <th className="px-6 py-4">Employee</th>}
               <th className="px-6 py-4">Check In</th>
               <th className="px-6 py-4">Check Out</th>
               <th className="px-6 py-4">Status</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {attendanceRecords.map((record: any) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4 font-semibold text-gray-700">{new Date(record.date).toLocaleDateString()}</td>
                   {isAdmin && <td className="px-6 py-4">{record.employees?.first_name} {record.employees?.last_name}</td>}
                   <td className="px-6 py-4 text-gray-500 font-mono">{formatTime(record.check_in)}</td>
                   <td className="px-6 py-4 text-gray-500 font-mono">{formatTime(record.check_out)}</td>
                   <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {record.status}
                      </span>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW (CARDS) --- */}
      <div className="md:hidden space-y-4">
         {attendanceRecords.map((record: any) => (
            <div key={record.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${record.status === 'present' ? 'border-green-500' : 'border-red-500'}`}>
               <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">{new Date(record.date).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {record.status}
                  </span>
               </div>
               {isAdmin && <p className="text-sm text-gray-600 mb-2 font-medium">{record.employees?.first_name} {record.employees?.last_name}</p>}
               <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center gap-1"><Clock size={14}/> In: {formatTime(record.check_in)}</div>
                  <div className="flex items-center gap-1"><Clock size={14}/> Out: {formatTime(record.check_out)}</div>
               </div>
            </div>
         ))}
      </div>

      {/* Modal remains the same */}
      {showModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
               <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
               <form onSubmit={handleAdminMarkAttendance} className="space-y-4">
                  {/* ... Inputs same as before ... */}
                   <select className="w-full border p-3 rounded-xl bg-gray-50" onChange={(e) => setFormData({...formData, employee_id: e.target.value})} required>
                      <option value="">Select Employee</option>
                      {employeesList.map((e: any) => <option key={e.id} value={e.id}>{e.first_name}</option>)}
                   </select>
                   <input type="date" className="w-full border p-3 rounded-xl bg-gray-50" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                   <div className="flex gap-3">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-medium">Cancel</button>
                      <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30">Submit</button>
                   </div>
               </form>
            </div>
         </div>
      )}
    </Layout>
  );
}