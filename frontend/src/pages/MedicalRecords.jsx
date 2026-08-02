import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MedicalRecords = () => {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRegistrations, setActiveRegistrations] = useState([]);
  const [formData, setFormData] = useState({
    registrationId: '',
    subjective: '',
    objectiveBloodPressure: '',
    objectiveTemperature: '',
    objectiveWeight: '',
    objectiveHeight: '',
    assessmentDiagnosis: '',
    planTherapy: '',
  });

  const fetchRecords = async (e) => {
    e.preventDefault();
    if (!patientId) return;

    try {
      setLoading(true);
      const res = await api.get(`/medical-records/${patientId}`);
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data rekam medis. Pastikan ID Pasien/No. RM benar.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveRegistrations = async () => {
    try {
      const res = await api.get('/registrations?limit=50');
      if (res.data.success) {
        // Filter out completed ones, keep only IN_PROGRESS or CALLED/CHECK_IN to let doctor choose
        const active = res.data.data.registrations.filter(r => r.status !== 'COMPLETED' && r.status !== 'WAITING');
        setActiveRegistrations(active);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = () => {
    fetchActiveRegistrations();
    setIsModalOpen(true);
    setFormData({
      registrationId: '',
      subjective: '',
      objectiveBloodPressure: '',
      objectiveTemperature: '',
      objectiveWeight: '',
      objectiveHeight: '',
      assessmentDiagnosis: '',
      planTherapy: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medical-records', formData);
      setIsModalOpen(false);
      toast.success('Pemeriksaan berhasil disimpan!');
      // Optionally fetch again if patientId matches
      if (patientId) {
        // trigger fetch hack
        document.getElementById('btn-cari').click();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pemeriksaan');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Riwayat Rekam Medis (SOAP)</h2>
          <p className="text-sm text-slate-500 mt-1">Cari riwayat atau input pemeriksaan baru.</p>
          
          <form onSubmit={fetchRecords} className="mt-4 flex gap-3 w-full max-w-md">
            <input 
              type="text" 
              placeholder="Masukkan ID / No RM Pasien..." 
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              required
            />
            <button id="btn-cari" type="submit" disabled={loading} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center">
              <Search size={16} className="mr-2" /> Cari
            </button>
          </form>
        </div>

        {user?.role === 'DOCTOR' || user?.role === 'ADMIN' ? (
          <button 
            onClick={openModal}
            className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} className="mr-2" /> Input Pemeriksaan
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
        {records.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">
            {loading ? 'Mencari data...' : 'Belum ada riwayat rekam medis yang ditampilkan.'}
          </div>
        ) : (
          <div className="space-y-6">
            {records.map(record => (
              <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
                  <div>
                    <h3 className="font-semibold">Kunjungan: {new Date(record.createdAt).toLocaleDateString('id-ID')}</h3>
                    <p className="text-xs text-slate-300">Poli: {record.registration?.polyclinic?.name} | Dokter: {record.registration?.doctor?.name}</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Subjective (Keluhan)</h4>
                    <p className="text-sm text-slate-600">{record.subjective}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Objective (Pemeriksaan Fisik)</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>Tekanan Darah: {record.objectiveBloodPressure || '-'}</li>
                      <li>Suhu: {record.objectiveTemperature ? `${record.objectiveTemperature} °C` : '-'}</li>
                      <li>Berat Badan: {record.objectiveWeight ? `${record.objectiveWeight} kg` : '-'}</li>
                      <li>Tinggi Badan: {record.objectiveHeight ? `${record.objectiveHeight} cm` : '-'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Assessment (Diagnosa)</h4>
                    <p className="text-sm text-slate-600">{record.assessmentDiagnosis}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Plan (Rencana Terapi)</h4>
                    <p className="text-sm text-slate-600">{record.planTherapy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-slate-100 p-6 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-slate-800">Formulir Rekam Medis (SOAP)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Pasien (Sedang Diperiksa) *</label>
                <select required value={formData.registrationId} onChange={(e) => setFormData({...formData, registrationId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50">
                  <option value="">-- Pilih Pasien --</option>
                  {activeRegistrations.map(reg => (
                    <option key={reg.id} value={reg.id}>{reg.patient?.medicalRecordNumber} - {reg.patient?.name} (Poli: {reg.polyclinic?.name})</option>
                  ))}
                </select>
                {activeRegistrations.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Tidak ada pasien dengan status IN_PROGRESS atau CHECK_IN.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">S - Subjective</label>
                    <textarea required rows="3" placeholder="Keluhan utama pasien..." value={formData.subjective} onChange={(e) => setFormData({...formData, subjective: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">A - Assessment</label>
                    <textarea required rows="3" placeholder="Diagnosa dokter..." value={formData.assessmentDiagnosis} onChange={(e) => setFormData({...formData, assessmentDiagnosis: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"></textarea>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">O - Objective (Fisik)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Tensi (mis: 120/80)" value={formData.objectiveBloodPressure} onChange={(e) => setFormData({...formData, objectiveBloodPressure: e.target.value})} className="p-2 border border-slate-200 rounded-lg text-sm" />
                      <input type="number" step="0.1" placeholder="Suhu (°C)" value={formData.objectiveTemperature} onChange={(e) => setFormData({...formData, objectiveTemperature: e.target.value})} className="p-2 border border-slate-200 rounded-lg text-sm" />
                      <input type="number" step="0.1" placeholder="Berat (kg)" value={formData.objectiveWeight} onChange={(e) => setFormData({...formData, objectiveWeight: e.target.value})} className="p-2 border border-slate-200 rounded-lg text-sm" />
                      <input type="number" step="0.1" placeholder="Tinggi (cm)" value={formData.objectiveHeight} onChange={(e) => setFormData({...formData, objectiveHeight: e.target.value})} className="p-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">P - Plan</label>
                    <textarea required rows="3" placeholder="Rencana terapi..." value={formData.planTherapy} onChange={(e) => setFormData({...formData, planTherapy: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm"></textarea>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">Batal</button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm">Simpan Rekam Medis</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicalRecords;
