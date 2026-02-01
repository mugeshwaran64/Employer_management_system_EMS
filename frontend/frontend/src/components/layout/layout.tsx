// src/components/layout/Layout.tsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Make sure this path is also correct!
import { 
  LayoutDashboard, Users, CalendarCheck, FileText, 
  CreditCard, UserCircle, LogOut, Building2 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { signOut, employee } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    signOut();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users, adminOnly: true },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
    { name: 'Leaves', href: '/leaves', icon: FileText },
    { name: 'Payroll', href: '/payroll', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: Building2, adminOnly: true },
    { name: 'Profile', href: '/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">HR System</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigation.map((item) => {
            if (item.adminOnly && !employee?.is_admin) return null;
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:bg-red-500/10 rounded-lg">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}