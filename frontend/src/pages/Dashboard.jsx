import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, UserPlus, ClipboardList, Clock, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center">
    <div className={`p-4 rounded-full mr-4 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalPatientsToday: 0,
    totalQueuesToday: 0,
    totalWaitingToday: 0,
    totalCompletedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Ringkasan aktivitas klinik hari ini.</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Pasien Terdaftar" 
          value={stats.totalPatients} 
          icon={<Users size={24} className="text-blue-600" />} 
          colorClass="bg-blue-100"
        />
        <StatCard 
          title="Pasien Baru Hari Ini" 
          value={stats.totalPatientsToday} 
          icon={<UserPlus size={24} className="text-teal-600" />} 
          colorClass="bg-teal-100"
        />
        <StatCard 
          title="Total Antrean Hari Ini" 
          value={stats.totalQueuesToday} 
          icon={<ClipboardList size={24} className="text-purple-600" />} 
          colorClass="bg-purple-100"
        />
        <StatCard 
          title="Pasien Menunggu" 
          value={stats.totalWaitingToday} 
          icon={<Clock size={24} className="text-orange-600" />} 
          colorClass="bg-orange-100"
        />
        <StatCard 
          title="Pasien Selesai Dilayani" 
          value={stats.totalCompletedToday} 
          icon={<CheckCircle size={24} className="text-green-600" />} 
          colorClass="bg-green-100"
        />
      </div>

      {/* Placeholder for future charts or recent activities */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Sistem</h3>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <p className="text-slate-600">
            Selamat datang di Mini Clinic Information System. Gunakan menu di sidebar untuk menavigasi ke fitur-fitur seperti manajemen pasien, pendaftaran, dan rekam medis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
