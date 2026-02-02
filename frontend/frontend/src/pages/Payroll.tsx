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
  
  // Clean Form Data
  const [newPayroll, setNewPayroll] = useState({
      employee_id: '', 
      month: 'February', 
      year: new Date().getFullYear(), 
      basic_salary: '', 
      allowances: 0, 
      deductions: 0
  });

  useEffect(() => {
    fetchPayrolls();
    if (isAdmin) fetchEmployees();
  }, [employee]);

  const fetchPayrolls = async () => {
    try {
        const { data } = await api.get('/payroll/');
        setPayrolls(data);
    } catch (e) { console.error(e); }
  };

  const fetchEmployees = async () => {
    try {
        const { data } = await api.get('/employees/');
        setEmployeesList(data);
    } catch (e) { console.error(e); }
  };

 const handleAddPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation: Check if Employee is selected
    if (!newPayroll.employee_id) {
        alert("Please select an employee.");
        return;
    }

    // 2. Validation: Check if Salary is filled
    if (!newPayroll.basic_salary) {
        alert("Please enter Basic Salary.");
        return;
    }

    try {
        // 3. Conversion: Force Convert Strings to Numbers
        const basic = parseFloat(newPayroll.basic_salary);
        const allow = parseFloat(newPayroll.allowances.toString()) || 0;
        const deduct = parseFloat(newPayroll.deductions.toString()) || 0;
        const empId = parseInt(newPayroll.employee_id);
        const yearInt = parseInt(newPayroll.year.toString());

        // Calculate Net Salary
        const net = basic + allow - deduct;

        // 4. Send Clean Data
        await api.post('/payroll/', {
            employee_id: empId, // Sending ID as Number
            month: newPayroll.month,
            year: yearInt,
            basic_salary: basic,
            allowances: allow,
            deductions: deduct,
            net_salary: net,
            status: 'paid'
        });

        setShowModal(false);
        fetchPayrolls();
        alert('Payroll Added Successfully ✅');
        
        // Optional: Reset form
        setNewPayroll({ ...newPayroll, basic_salary: '', allowances: 0, deductions: 0 });

    } catch (err: any) {
        console.error(err);
        // Show the actual error coming from backend if possible
        const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Ensure all fields are numbers.';
        alert('Failed to add payroll: ' + errorMsg);
    }
  };

  const formatCurrency = (val: any) => `$${Number(val).toLocaleString()}`;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Salary Management</h1>
           <p className="text-gray-500">{isAdmin ? 'Process employee salaries.' : 'View your payslips.'}</p>
        </div>
        {isAdmin && (
           <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
             <Plus size={18}/> New Payroll
           </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
           <thead className="bg-gray-50 text-gray-600 font-medium">
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
                    {isAdmin && (
                        <td className="px-6 py-4 font-medium text-gray-900">
                            {p.employees ? `${p.employees.first_name} ${p.employees.last_name}` : 'Unknown'}
                        </td>
                    )}
                    <td className="px-6 py-4">{p.month} {p.year}</td>
                    <td className="px-6 py-4">{formatCurrency(p.basic_salary)}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(p.net_salary)}</td>
                    <td className="px-6 py-4">
                       <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Paid</span>
                    </td>
                    <td className="px-6 py-4">
                       <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold" onClick={() => window.print()}>
                          <Download size={14}/> Slip
                       </button>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>

      {/* ADD PAYROLL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Process New Salary</h2>
              <form onSubmit={handleAddPayroll} className="space-y-3">
                 <div>
                    <label className="block text-sm font-medium mb-1">Select Employee</label>
                    <select className="w-full border p-2 rounded-lg" onChange={(e) => setNewPayroll({...newPayroll, employee_id: e.target.value})} required>
                       <option value="">-- Select --</option>
                       {employeesList.map((e: any) => (
                          <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                       ))}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Month</label>
                        <select className="w-full border p-2 rounded-lg" onChange={(e) => setNewPayroll({...newPayroll, month: e.target.value})}>
                            <option>February</option><option>March</option><option>April</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <input type="number" value={newPayroll.year} className="w-full border p-2 rounded-lg" onChange={(e) => setNewPayroll({...newPayroll, year: parseInt(e.target.value)})}/>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Basic Salary ($)</label>
                    <input type="number" className="w-full border p-2 rounded-lg" placeholder="0.00" onChange={(e) => setNewPayroll({...newPayroll, basic_salary: e.target.value})} required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Allowances ($)</label>
                        <input type="number" className="w-full border p-2 rounded-lg" placeholder="0" onChange={(e) => setNewPayroll({...newPayroll, allowances: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Deductions ($)</label>
                        <input type="number" className="w-full border p-2 rounded-lg" placeholder="0" onChange={(e) => setNewPayroll({...newPayroll, deductions: Number(e.target.value)})} />
                    </div>
                 </div>
                 <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-2 rounded-lg text-gray-700">Cancel</button>
                    <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Submit</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </Layout>
  );
}