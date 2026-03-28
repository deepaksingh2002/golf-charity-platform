import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Target, Trophy, CreditCard, HeartHandshake, LogOut, Shield } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { logout, selectCurrentUser } from '../../store/authSlice';

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Scores', path: '/dashboard/scores', icon: <Target size={20} /> },
    { name: 'Draws', path: '/dashboard/draws', icon: <Trophy size={20} /> },
    { name: 'Plan', path: '/dashboard/subscription', icon: <CreditCard size={20} /> },
    { name: 'Charity', path: '/dashboard/charity', icon: <HeartHandshake size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden pb-16 lg:pb-0">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-300 flex-col">
        <div className="p-6 flex items-center justify-center border-b border-zinc-800">
          <span className="text-xl font-bold text-white tracking-tight">Golf<span className="text-emerald-500">Charity</span></span>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path} to={item.path} end={item.path === '/dashboard'}
              className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-zinc-800 text-white font-medium' : 'hover:bg-zinc-900 hover:text-white'}`}
            >
              {item.icon}<span>{item.name}</span>
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer">
            <LogOut size={20} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden lg:pl-64">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 z-30 shrink-0">
          <div className="lg:hidden text-xl font-bold text-zinc-900 tracking-tight">Golf<span className="text-emerald-500">Charity</span></div>
          <div className="ml-auto flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100"
              >
                <Shield size={16} />
                <span>Open Admin Panel</span>
              </Link>
            )}
            <Badge variant={user?.subscriptionStatus === 'active' ? 'active' : 'inactive'} className="hidden sm:inline-flex">
              {user?.subscriptionStatus === 'active' ? 'Active' : 'Inactive'}
            </Badge>
            <div className="flex items-center space-x-3 sm:pl-4 sm:border-l border-zinc-200">
              <span className="text-sm font-medium text-zinc-700 hidden sm:block">{user?.name}</span>
              <Avatar fallback={user?.name} size="sm" className="sm:h-10 sm:w-10" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto h-full">
             <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-zinc-200 z-50 flex items-center justify-around px-2 py-2 pb-safe">
         {navItems.map(item => (
            <NavLink
              key={item.path} to={item.path} end={item.path === '/dashboard'}
              className={({ isActive }) => `flex flex-col items-center justify-center w-full py-1 ${isActive ? 'text-emerald-600' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </NavLink>
         ))}
         {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex flex-col items-center justify-center w-full py-1 text-violet-600"
            >
              <Shield size={20} />
              <span className="text-[10px] mt-1 font-medium">Admin</span>
            </Link>
         )}
      </nav>
    </div>
  );
}
