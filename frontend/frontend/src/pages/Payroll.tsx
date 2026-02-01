import { useEffect, useState } from 'react';
import { Download, DollarSign } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import type { Payroll as PayrollType } from '../types';

export function Payroll() {
  const { employee } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollType[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollType | null>(null);
  const [showPayslip, setShowPayslip] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = employee?.is_admin;

  useEffect(() => {
    fetchPayrolls();
  }, [employee]);

  const fetchPayrolls = async () => {
    if (!employee) return;

    try {
      const { data } = await api.get('/payroll/');
      
      let filteredData = data;
      if (!isAdmin) {
          filteredData = data.filter((p: any) => p.employee_id === employee.id);
      }
      setPayrolls(filteredData || []);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewPayslip = (payroll: PayrollType) => {
    setSelectedPayroll(payroll);
    setShowPayslip(true);
  };

  const downloadPayslip = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading payroll...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Same UI code as before */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage employee payroll' : 'View your payslips'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {isAdmin && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Period</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Basic Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Allowances</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Deductions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Net Salary</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-gray-500">
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  payrolls.map((payroll) => (
                    <tr key={payroll.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {isAdmin && (
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">
                            {payroll.employees?.first_name} {payroll.employees?.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{payroll.employees?.employee_code}</p>
                        </td>
                      )}
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {payroll.month} {payroll.year}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatCurrency(payroll.basic_salary)}</td>
                      <td className="py-3 px-4 text-green-600">{formatCurrency(payroll.allowances)}</td>
                      <td className="py-3 px-4 text-red-600">{formatCurrency(payroll.deductions)}</td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">
                        {formatCurrency(payroll.net_salary)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payroll.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => viewPayslip(payroll)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Payslip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPayslip && selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 print:p-0">
              <div className="flex items-center justify-between mb-6 print:hidden">
                <h2 className="text-2xl font-bold text-gray-900">Payslip</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadPayslip}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={20} />
                    Download
                  </button>
                  <button
                    onClick={() => setShowPayslip(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg p-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900">Company Name</h1>
                  <p className="text-gray-600">Employee Payslip</p>
                </div>
                {/* Payslip details logic remains same, just ensuring data access is correct */}
                 <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-gray-600">Employee Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedPayroll.employees?.first_name} {selectedPayroll.employees?.last_name}
                    </p>
                  </div>
                  {/* ... rest of payslip UI ... */}
                 </div>
                 {/* ... Earnings section ... */}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}