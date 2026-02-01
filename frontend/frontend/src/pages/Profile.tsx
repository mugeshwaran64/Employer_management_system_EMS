import { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import api from '../lib/api';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { employee, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        phone: employee.phone || '',
        address: employee.address || '',
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    setLoading(true);
    try {
      await api.patch(`/employees/${employee.id}/`, formData);
      await refreshUser();
      setEditing(false);
      alert('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        {/* Profile View/Edit UI */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
             {editing ? (
                 <form onSubmit={handleSubmit}>
                     {/* Input fields for First Name, Last Name, Phone, Address */}
                     <input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="border p-2 rounded mb-2 w-full"/>
                     <input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="border p-2 rounded mb-2 w-full"/>
                     <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                     <button type="button" onClick={() => setEditing(false)} className="ml-2 text-gray-600">Cancel</button>
                 </form>
             ) : (
                 <div>
                     <h2 className="text-xl font-semibold">{employee.first_name} {employee.last_name}</h2>
                     <p>{employee.email}</p>
                     <button onClick={() => setEditing(true)} className="text-blue-600 mt-4">Edit Profile</button>
                 </div>
             )}
        </div>
      </div>
    </Layout>
  );
}