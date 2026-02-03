import { useEffect, useState } from 'react';
import { Plus, Download, DollarSign } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

export function Payroll() {
  const { employee } = useAuth();
  const isAdmin = employee?.is_admin;
  
  const [payrolls, setPayrolls] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPayroll, setNewPayroll] = useState({ employee_id: '', month: 'February', year: 2026, basic_salary: '', allowances: 0, deductions: 0 });

  useEffect(() => { fetchPayrolls(); if(isAdmin) fetchEmployees(); }, [employee]);

  const fetchPayrolls = async () => { try { const {data}=await api.get('/payroll/'); setPayrolls(data); } catch(e){} };
  const fetchEmployees = async () => { try { const {data}=await api.get('/employees/'); setEmployeesList(data); } catch(e){} };

  const handleAddPayroll = async (e: any) => {
    e.preventDefault();
    try {
        const basic=parseFloat(newPayroll.basic_salary); const allow=parseFloat(newPayroll.allowances.toString())||0; const deduct=parseFloat(newPayroll.deductions.toString())||0;
        await api.post('/payroll/', { ...newPayroll, employee_id: parseInt(newPayroll.employee_id), basic_salary: basic, allowances: allow, deductions: deduct, net_salary: basic+allow-deduct, status:'paid' });
        setShowModal(false); fetchPayrolls(); alert('Success');
    } catch(err) { alert('Failed'); }
  };

  const formatCurrency = (val: any) => `$${Number(val).toLocaleString()}`;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
        {isAdmin && (
           <button onClick={() => setShowModal(true)} className="bg-green-600 text-white p-2 rounded-full md:px-4 md:py-2 md:rounded-lg flex items-center gap-2 shadow-lg shadow-green-500/30">
             <Plus size={20} /> <span className="hidden md:inline">New Payroll</span>
           </button>
        )}
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
           <thead className="bg-gray-50 text-gray-600">
              <tr>
                 {isAdmin && <th className="px-6 py-4">Employee</th>}
                 <th className="px-6 py-4">Period</th>
                 <th className="px-6 py-4">Basic</th>
                 <th className="px-6 py-4">Net Salary</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4">Action</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
              {payrolls.map((p: any) => (
                 <tr key={p.id} className="hover:bg-gray-50">
                    {isAdmin && <td className="px-6 py-4 font-medium">{p.employees?.first_name}</td>}
                    <td className="px-6 py-4">{p.month} {p.year}</td>
                    <td className="px-6 py-4 text-gray-500">{formatCurrency(p.basic_salary)}</td>
                    <td className="px-6 py-4 font-bold text-green-600 text-base">{formatCurrency(p.net_salary)}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Paid</span></td>
                    <td className="px-6 py-4"><button className="text-blue-600 hover:text-blue-800"><Download size={18}/></button></td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden space-y-4">
         {payrolls.map((p: any) => (
            <div key={p.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -mr-2 -mt-2"></div>
               <div className="flex justify-between items-start mb-4">
                  <div>
                     {isAdmin && <p className="font-bold text-gray-900 text-lg">{p.employees?.first_name} {p.employees?.last_name}</p>}
                     <p className="text-gray-500 font-medium">{p.month} {p.year}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase z-10">Paid</span>
               </div>
               
               <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl mb-4">
                  <div><p className="text-xs text-gray-500">Basic</p><p className="font-semibold">{formatCurrency(p.basic_salary)}</p></div>
                  <div><p className="text-xs text-gray-500">Deductions</p><p className="font-semibold text-red-500">-{formatCurrency(p.deductions)}</p></div>
               </div>

               <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <div><p className="text-xs text-gray-500">Net Salary</p><p className="text-xl font-bold text-green-600">{formatCurrency(p.net_salary)}</p></div>
                  <button className="p-2 bg-blue-50 text-blue-600 rounded-full"><Download size={20}/></button>
               </div>
            </div>
         ))}
      </div>

      {/* Modal remains same - Just style inputs with rounded-xl and bg-gray-50 */}
       {showModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">New Payroll</h2>
                <form onSubmit={handleAddPayroll} className="space-y-3">
                    <select className="w-full border p-3 rounded-xl bg-gray-50" onChange={e => setNewPayroll({...newPayroll, employee_id: e.target.value})} required>
                        <option value="">Select Employee</option>
                        {employeesList.map((e:any) => <option key={e.id} value={e.id}>{e.first_name}</option>)}
                    </select>
                    <input type="number" placeholder="Basic Salary" className="w-full border p-3 rounded-xl bg-gray-50" onChange={e => setNewPayroll({...newPayroll, basic_salary: e.target.value})} required />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-xl shadow-lg shadow-green-500/30">Save</button>
                    </div>
                </form>
             </div>
         </div>
       )}
    </Layout>
  );
}