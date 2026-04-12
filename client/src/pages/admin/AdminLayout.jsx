import React from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, Users, Trophy, HeartHandshake, Award, LogOut, ChevronRight, House, FileText } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { logout, selectUser } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../store/api/authApiSlice';

export default function AdminLayout() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [logoutSession] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutSession().unwrap();
    } catch {
      // Ensure local sign-out still happens even if server call fails.
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <BarChart3 size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Draws', path: '/admin/draws', icon: <Trophy size={20} /> },
    { name: 'Charities', path: '/admin/charities', icon: <HeartHandshake size={20} /> },
    { name: 'Winners', path: '/admin/winners', icon: <Award size={20} /> },
    { name: 'Report', path: '/admin/charity-report', icon: <FileText size={20} /> },
  ];

  const breadcrumbs = location.pathname.split('/').filter(Boolean);
  
  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden pb-16 lg:pb-0">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex-col">
        <div className="p-6 flex items-center justify-center border-b border-zinc-800 bg-zinc-950">
          <span className="text-xl font-bold text-white tracking-tight">Admin<span className="text-emerald-500">Panel</span></span>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path} to={item.path} end={item.path === '/admin'}
              className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-violet-600/10 text-violet-400 font-medium border border-violet-500/20' : 'hover:bg-zinc-800 hover:text-white'}`}
            >
              {item.icon}<span>{item.name}</span>
            </NavLink>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer">
            <LogOut size={20} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden lg:pl-64">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <House size={16} />
              <span>Home</span>
            </Link>
            <div className="hidden items-center space-x-2 px-2 text-sm capitalize text-zinc-500 sm:flex">
             {breadcrumbs.map((crumb, i) => (
               <React.Fragment key={crumb}>
                 <span>{crumb}</span>
                 {i < breadcrumbs.length - 1 && <ChevronRight size={14} className="mx-1" />}
               </React.Fragment>
             ))}
            </div>
          </div>
          <div className="sm:hidden font-bold tracking-tight text-zinc-900">Admin</div>
          
          <div className="flex items-center space-x-4 ml-auto">
            <Badge variant="paid" className="bg-violet-100 text-violet-800 border-violet-200 shadow-sm px-3 shadow-violet-500/10 hidden sm:inline-flex">ROOT</Badge>
            <div className="flex items-center space-x-3 sm:pl-4 sm:border-l border-zinc-200">
              <span className="text-sm font-medium text-zinc-700 hidden sm:block">{user?.name}</span>
              <Avatar fallback={user?.name || 'AD'} size="sm" className="sm:h-10 sm:w-10" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
             <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-zinc-950 border-t border-zinc-800 z-50 flex items-center justify-around px-2 py-2 pb-safe">
        <Link
          to="/"
          className="flex flex-col items-center justify-center w-full py-1 text-zinc-500 hover:text-zinc-300"
        >
          <House size={20} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
         {navItems.map(item => (
            <NavLink
              key={item.path} to={item.path} end={item.path === '/admin'}
              className={({ isActive }) => `flex flex-col items-center justify-center w-full py-1 ${isActive ? 'text-violet-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </NavLink>
         ))}
      </nav>
    </div>
  );
}
