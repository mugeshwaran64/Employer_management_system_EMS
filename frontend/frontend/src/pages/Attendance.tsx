import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, Plus } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

export function Attendance() {
  const { employee } = useAuth();
  const isAdmin = employee?.is_admin;
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for Admin
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
     employee_id: '',
     date: new Date().toISOString().split('T')[0],
     check_in: '', // Will add time in submit
     status: 'present'
  });

  useEffect(() => {
    fetchAttendance();
    if(isAdmin) fetchEmployees();
  }, [employee]);

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get('/attendance/');
      setAttendanceRecords(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees/');
      setEmployeesList(data);
    } catch (e) { console.error(e); }
  };

  const handleAdminMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Construct full ISO Date Time string for check_in
        const checkInDateTime = new Date(`${formData.date}T09:00:00`).toISOString();
        
        await api.post('/attendance/', {
            employee_id: formData.employee_id,
            date: formData.date,
            check_in: checkInDateTime,
            status: formData.status
        });
        
        setShowModal(false);
        fetchAttendance();
        alert('Attendance Marked Successfully');
    } catch (error) {
        console.error(error);
        alert('Failed to mark attendance. Check if user already present.');
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();
  const formatTime = (timeStr: string) => timeStr ? new Date(timeStr).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-';

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Attendance Log</h1>
           <p className="text-gray-500">View and track daily presence.</p>
        </div>
        {isAdmin && (
           <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
             <Plus size={18} /> Mark Attendance
           </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium">
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
                <tr key={record.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 font-medium text-gray-900">{formatDate(record.date)}</td>
                   {isAdmin && (
                      <td className="px-6 py-4">
                         {record.employees ? `${record.employees.first_name} ${record.employees.last_name}` : 'Unknown'}
                      </td>
                   )}
                   <td className="px-6 py-4">{formatTime(record.check_in)}</td>
                   <td className="px-6 py-4">{formatTime(record.check_out)}</td>
                   <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {record.status}
                      </span>
                   </td>
                </tr>
             ))}
             {attendanceRecords.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">No records found.</td></tr>
             )}
          </tbody>
        </table>
      </div>

      {/* ADMIN ATTENDANCE MODAL */}
      {showModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
               <h2 className="text-xl font-bold mb-4">Mark Employee Attendance</h2>
               <form onSubmit={handleAdminMarkAttendance} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Select Employee</label>
                     <select 
                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                        required
                     >
                        <option value="">-- Select --</option>
                        {employeesList.map((e: any) => (
                           <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_code})</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Date</label>
                     <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full border p-2 rounded-lg"
                        required 
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Status</label>
                     <select 
                        className="w-full border p-2 rounded-lg"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                     >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                     </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">Cancel</button>
                     <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Mark Present</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </Layout>
  );
}