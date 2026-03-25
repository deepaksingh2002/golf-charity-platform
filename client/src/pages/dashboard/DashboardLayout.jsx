import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Trophy, CreditCard, HeartHandshake, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Scores', path: '/dashboard/scores', icon: <Target size={20} /> },
    { name: 'Draws', path: '/dashboard/draws', icon: <Trophy size={20} /> },
    { name: 'Subscription', path: '/dashboard/subscription', icon: <CreditCard size={20} /> },
    { name: 'My Charity', path: '/dashboard/charity', icon: <HeartHandshake size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-300 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between lg:justify-center border-b border-zinc-800">
          <span className="text-xl font-bold text-white tracking-tight">Golf<span className="text-emerald-500">Charity</span></span>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X size={24} /></button>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-zinc-800 text-white font-medium' : 'hover:bg-zinc-900 hover:text-white'}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 z-30 shrink-0">
          <button className="lg:hidden p-2 text-zinc-600 rounded-md hover:bg-zinc-100 cursor-pointer" onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center space-x-4">
            <Badge variant={user?.subscriptionStatus === 'active' ? 'active' : 'inactive'}>
              {user?.subscriptionStatus === 'active' ? 'Active Subscriber' : 'Inactive'}
            </Badge>
            <div className="flex items-center space-x-3 pl-4 border-l border-zinc-200">
              <span className="text-sm font-medium text-zinc-700 hidden sm:block">{user?.name}</span>
              <Avatar fallback={user?.name} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
