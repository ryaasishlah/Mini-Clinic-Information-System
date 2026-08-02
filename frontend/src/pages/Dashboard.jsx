import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

      {/* Quick Actions (CTAs) */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/patients" className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 p-4 rounded-xl font-medium transition-colors border border-blue-100">
            <UserPlus size={20} />
            Tambah Pasien Baru
          </Link>
          <Link to="/registrations" className="flex items-center justify-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 p-4 rounded-xl font-medium transition-colors border border-teal-100">
            <ClipboardList size={20} />
            Daftarkan Kunjungan
          </Link>
          <Link to="/queues" className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 p-4 rounded-xl font-medium transition-colors border border-orange-100">
            <Clock size={20} />
            Lihat Antrean Poli
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
