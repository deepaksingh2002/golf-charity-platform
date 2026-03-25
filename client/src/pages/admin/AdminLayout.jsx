import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Users, Trophy, HeartHandshake, Award, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <BarChart3 size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Draw Control', path: '/admin/draws', icon: <Trophy size={20} /> },
    { name: 'Charities', path: '/admin/charities', icon: <HeartHandshake size={20} /> },
    { name: 'Winners', path: '/admin/winners', icon: <Award size={20} /> }
  ];

  const breadcrumbs = location.pathname.split('/').filter(Boolean);
  
  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between lg:justify-center border-b border-zinc-800 bg-zinc-950">
          <span className="text-xl font-bold text-white tracking-tight">Admin<span className="text-emerald-500">Panel</span></span>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X size={24} /></button>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-violet-600/10 text-violet-400 font-medium border border-violet-500/20' : 'hover:bg-zinc-800 hover:text-white'}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 text-zinc-600 rounded-md hover:bg-zinc-100 cursor-pointer" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:flex items-center space-x-2 text-sm text-zinc-500 capitalize px-2">
               {breadcrumbs.map((crumb, i) => (
                 <React.Fragment key={crumb}>
                   <span>{crumb}</span>
                   {i < breadcrumbs.length - 1 && <ChevronRight size={14} className="mx-1" />}
                 </React.Fragment>
               ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="paid" className="bg-violet-100 text-violet-800 border-violet-200 shadow-sm px-3 shadow-violet-500/10">ROOT ADMIN</Badge>
            <div className="flex items-center space-x-3 pl-4 border-l border-zinc-200">
              <span className="text-sm font-medium text-zinc-700 hidden sm:block">{user?.name}</span>
              <Avatar fallback={user?.name || 'AD'} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
