import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Users, CalendarCheck, 
  CreditCard, UserCircle, LogOut, Menu, X 
} from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { signOut, employee } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = employee?.is_admin;

  const handleSignOut = () => { signOut(); navigate('/login'); };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Employees', href: '/employees', icon: Users, show: isAdmin },
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck, show: true },
    { name: 'Payroll', href: '/payroll', icon: CreditCard, show: true },
    { name: 'My Profile', href: '/profile', icon: UserCircle, show: true },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-blue-400">EMS Portal</h1>
        <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">
          {isAdmin ? 'Admin Workspace' : 'Employee Portal'}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-3 mt-6">
        {navigation.map((item) => (
          item.show && (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                location.pathname.startsWith(item.href)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
              }`}
            >
              <item.icon size={20} className={location.pathname.startsWith(item.href) ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 px-4 py-3 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg text-blue-400">EMS Portal</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-slate-800 rounded-lg">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed h-full z-10">
        <NavContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900 animate-in slide-in-from-left duration-300">
          <NavContent />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 mt-16 md:mt-0 transition-all">
        {children}
      </main>
    </div>
  );
}