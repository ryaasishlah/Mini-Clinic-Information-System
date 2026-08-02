import { useState, useEffect } from 'react';
import api from '../services/api';
import { CalendarCheck, Plus, CheckCircle, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [polyclinics, setPolyclinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', doctorId: '', polyclinicId: '', paymentType: 'Umum', initialComplaint: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations');
      if (res.data.success) {
        setRegistrations(res.data.data.registrations);
      }
    } catch (error) {
      console.error('Failed to fetch registrations', error);
      toast.error('Gagal mengambil data pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [resPatients, resPolyclinics, resDoctors] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/master/polyclinics'),
        api.get('/master/doctors')
      ]);
      
      if (resPatients.data.success) setPatients(resPatients.data.data.patients);
      if (resPolyclinics.data.success) setPolyclinics(resPolyclinics.data.data);
      if (resDoctors.data.success) setDoctors(resDoctors.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil master data');
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const openModal = () => {
    fetchMasterData();
    setIsModalOpen(true);
    setFormData({ patientId: '', doctorId: '', polyclinicId: '', paymentType: 'Umum', initialComplaint: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/registrations', formData);
      setIsModalOpen(false);
      toast.success('Pendaftaran pasien berhasil!');
      fetchRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mendaftar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/registrations/${id}`, { status });
      toast.success('Status berhasil diupdate!');
      fetchRegistrations();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pendaftaran Kunjungan</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola pendaftaran pasien ke poli.</p>
        </div>
        <button 
          onClick={openModal}
          className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          <Plus size={16} className="mr-2" /> Daftar Pasien
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10">
              <th className="p-4 font-medium">Tanggal</th>
              <th className="p-4 font-medium">Pasien</th>
              <th className="p-4 font-medium">Poli / Dokter</th>
              <th className="p-4 font-medium">Pembayaran</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">Memuat data...</td></tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <CalendarCheck size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-1">Belum ada kunjungan</h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-sm">Hari ini belum ada pasien yang mendaftar. Silakan daftarkan pasien untuk melihat daftar antrean.</p>
                    <button 
                      onClick={openModal}
                      className="flex items-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus size={16} className="mr-2" /> Daftar Pasien
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-600">{new Date(reg.visitDate).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {reg.patient?.name}<br/>
                    <span className="text-xs text-slate-500 font-normal">{reg.patient?.medicalRecordNumber}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    {reg.polyclinic?.name}<br/>
                    <span className="text-xs text-slate-500">{reg.doctor?.name}</span>
                  </td>
                  <td className="p-4 text-slate-600">{reg.paymentType}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      reg.status === 'WAITING' ? 'bg-orange-100 text-orange-700' :
                      reg.status === 'CHECK_IN' ? 'bg-blue-100 text-blue-700' :
                      reg.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {reg.status === 'WAITING' && (
                      <button onClick={() => handleUpdateStatus(reg.id, 'CHECK_IN')} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors mr-2">Check In</button>
                    )}
                    <button className="text-xs bg-slate-50 text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors">Detail</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Pendaftaran Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Pasien *</label>
                <select required value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500">
                  <option value="">-- Pilih Pasien --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.medicalRecordNumber} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Poli *</label>
                  <select required value={formData.polyclinicId} onChange={(e) => setFormData({...formData, polyclinicId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm">
                    <option value="">-- Pilih Poli --</option>
                    {polyclinics.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dokter *</label>
                  <select required value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm">
                    <option value="">-- Pilih Dokter --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Pembayaran *</label>
                <select required value={formData.paymentType} onChange={(e) => setFormData({...formData, paymentType: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm">
                  <option value="Umum">Umum</option>
                  <option value="BPJS">BPJS</option>
                  <option value="Asuransi Lain">Asuransi Lain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keluhan Awal</label>
                <textarea rows="2" value={formData.initialComplaint} onChange={(e) => setFormData({...formData, initialComplaint: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Mendaftar...' : 'Daftar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registrations;
