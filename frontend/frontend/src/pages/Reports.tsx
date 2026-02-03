import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/AppLayout';

export function Reports() {
  const [loading, setLoading] = useState(false);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEmployeeReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees/');
      const reportData = data.map((e: any) => ({
          code: e.employee_code,
          name: `${e.first_name} ${e.last_name}`,
          email: e.email,
          position: e.position,
          joining_date: e.date_of_joining
      }));
      exportToCSV(reportData, `employees_report.csv`);
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Simplified handlers for other reports
  const handleAttendanceReport = async () => { /* Similar logic fetching /attendance/ */ };
  const handleLeaveReport = async () => { /* Similar logic fetching /leaves/ */ };
  const handlePayrollReport = async () => { /* Similar logic fetching /payroll/ */ };

  const reports = [
    {
      title: 'Employee Report',
      description: 'Export complete employee data',
      icon: FileText,
      color: 'blue',
      action: handleEmployeeReport,
    },
    // ... other report objects
  ];

  return (
    <Layout>
       <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                 {/* UI Card Code */}
                 <div className="flex items-start gap-4">
                     <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`text-${report.color}-600`} size={24} />
                     </div>
                     <div>
                         <h3>{report.title}</h3>
                         <button onClick={report.action} className="text-blue-600">Download CSV</button>
                     </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}