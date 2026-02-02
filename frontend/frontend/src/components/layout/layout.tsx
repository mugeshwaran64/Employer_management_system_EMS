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

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  // CLEAN MENU: Removed Leaves/Reports as requested
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Employees', href: '/employees', icon: Users, show: isAdmin }, // Only Admin
    { name: 'Attendance', href: '/attendance', icon: CalendarCheck, show: true },
    { name: 'My Salary', href: '/payroll', icon: CreditCard, show: true },
    { name: 'My Profile', href: '/profile', icon: UserCircle, show: true },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">EMS</h1>
        <p className="text-slate-400 text-xs mt-1">
          {isAdmin ? 'Admin Portal' : 'Employee Portal'}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navigation.map((item) => (
          item.show && (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname.startsWith(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center">
        <span className="font-bold text-xl">EMS</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col fixed h-full z-10">
        <NavContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900">
          <NavContent />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-16 md:mt-0">
        {children}
      </main>
    </div>
  );
}