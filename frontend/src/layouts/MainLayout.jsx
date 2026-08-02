import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  CalendarCheck, 
  ClipboardList, 
  LogOut 
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
    { name: 'Pasien', path: '/patients', icon: <Users size={20} />, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
    { name: 'Pendaftaran', path: '/registrations', icon: <CalendarCheck size={20} />, roles: ['ADMIN', 'RECEPTIONIST'] },
    { name: 'Antrean', path: '/queues', icon: <ClipboardList size={20} />, roles: ['ADMIN', 'RECEPTIONIST', 'DOCTOR'] },
    { name: 'Pemeriksaan', path: '/medical-records', icon: <Stethoscope size={20} />, roles: ['ADMIN', 'DOCTOR'] },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <h1 className="text-white text-xl font-bold tracking-wider">Mini Clinic</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.filter(item => item.roles.includes(user?.role)).map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-bold uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 border border-slate-700 rounded-lg text-sm font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200"
          >
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.name || 'Sistem Informasi Klinik'}
          </h2>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
