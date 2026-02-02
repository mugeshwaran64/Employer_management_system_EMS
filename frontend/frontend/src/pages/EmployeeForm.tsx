import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/Layout';
import type { Department } from '../types';

export function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Initial State
  const [formData, setFormData] = useState({
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '', // New Password Field
    phone: '',
    department_id: '',
    role: 'employee',
    position: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    date_of_birth: '',
    address: '',
    salary: '',
    is_admin: false,
    status: 'active',
  });

  useEffect(() => {
    fetchDepartments();
    if (isEdit && id) fetchEmployee(id);
  }, [id, isEdit]);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments/');
      setDepartments(data || []);
    } catch (error) { console.error(error); }
  };

  const fetchEmployee = async (employeeId: string) => {
    try {
      const { data } = await api.get(`/employees/${employeeId}/`);
      setFormData({ ...data, password: '', department_id: data.department_id?.toString() || '' });
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary.toString()) || 0,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
      };

      if (isEdit && id) {
        // Edit pannum pothu password empty ah irundha anupa vendam
        if (!payload.password) delete (payload as any).password;
        await api.patch(`/employees/${id}/`, payload);
      } else {
        await api.post('/employees/', payload);
      }
      navigate('/employees');
    } catch (error: any) {
      alert('Error: ' + (error.response?.data?.email || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ... (Handle Change Function same as before) ...
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/employees')} className="p-2 hover:bg-gray-100 rounded"><ArrowLeft/></button>
            <h1 className="text-3xl font-bold">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
            {/* ... Existing Fields (Code, Name, Email) ... */}
            
            {/* NEW PASSWORD FIELD - Only show for Admin creating new user or editing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ... Keep all previous inputs ... */}
                
                {/* Add this INPUT for Password */}
                <div>
                    <label className="block text-sm font-medium mb-1">Login Password {isEdit && '(Leave blank to keep same)'}</label>
                    <input 
                        type="password" name="password" 
                        value={formData.password} onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required={!isEdit} // Required only for new users
                    />
                </div>
                 
                 {/* COPY PASTE ALL OTHER INPUTS FROM PREVIOUS CODE HERE */}
                 <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} className="border p-2 rounded" required />
                 <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} className="border p-2 rounded" required />
                 <input type="email" name="email" placeholder="Email (Login ID)" value={formData.email} onChange={handleChange} className="border p-2 rounded" required />
                 <input type="text" name="employee_code" placeholder="Employee Code" value={formData.employee_code} onChange={handleChange} className="border p-2 rounded" required />
                 <input type="number" name="salary" placeholder="Salary" value={formData.salary} onChange={handleChange} className="border p-2 rounded" />
                 
                 <select name="role" value={formData.role} onChange={handleChange} className="border p-2 rounded">
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                 </select>

                 <div className="flex items-center gap-2">
                    <input type="checkbox" name="is_admin" checked={formData.is_admin} onChange={handleChange} />
                    <label>Is Admin Access?</label>
                 </div>
            </div>

            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                {loading ? 'Saving...' : 'Save Employee'}
            </button>
        </form>
      </div>
    </Layout>
  );
}