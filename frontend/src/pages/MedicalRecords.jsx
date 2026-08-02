import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, X, Trash2, Pill, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MedicalRecords = () => {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    actions: [],
    prescriptions: []
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
      actions: [],
      prescriptions: []
    });
  };

  const addAction = () => {
    setFormData(prev => ({ ...prev, actions: [...prev.actions, { actionName: '', description: '' }] }));
  };

  const removeAction = (index) => {
    setFormData(prev => ({ ...prev, actions: prev.actions.filter((_, i) => i !== index) }));
  };

  const updateAction = (index, field, value) => {
    const newActions = [...formData.actions];
    newActions[index][field] = value;
    setFormData(prev => ({ ...prev, actions: newActions }));
  };

  const addPrescription = () => {
    setFormData(prev => ({ ...prev, prescriptions: [...prev.prescriptions, { medicineName: '', dosage: '', quantity: 1, notes: '' }] }));
  };

  const removePrescription = (index) => {
    setFormData(prev => ({ ...prev, prescriptions: prev.prescriptions.filter((_, i) => i !== index) }));
  };

  const updatePrescription = (index, field, value) => {
    const newPrescriptions = [...formData.prescriptions];
    newPrescriptions[index][field] = value;
    setFormData(prev => ({ ...prev, prescriptions: newPrescriptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/medical-records', formData);
      setIsModalOpen(false);
      toast.success('Pemeriksaan berhasil disimpan!');
      if (patientId) {
        document.getElementById('btn-cari').click();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pemeriksaan');
    } finally {
      setIsSubmitting(false);
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

        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
          <button 
            onClick={openModal}
            className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} className="mr-2" /> Input Pemeriksaan
          </button>
        )}
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
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{record.subjective}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Objective (Pemeriksaan Fisik)</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>Tekanan Darah: <span className="font-medium">{record.objectiveBloodPressure || '-'}</span></li>
                      <li>Suhu: <span className="font-medium">{record.objectiveTemperature ? `${record.objectiveTemperature} °C` : '-'}</span></li>
                      <li>Berat Badan: <span className="font-medium">{record.objectiveWeight ? `${record.objectiveWeight} kg` : '-'}</span></li>
                      <li>Tinggi Badan: <span className="font-medium">{record.objectiveHeight ? `${record.objectiveHeight} cm` : '-'}</span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Assessment (Diagnosa)</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{record.assessmentDiagnosis}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Plan (Rencana Terapi)</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{record.planTherapy}</p>
                  </div>
                  
                  {/* Tindakan Medis */}
                  {record.actions && record.actions.length > 0 && (
                    <div className="md:col-span-2 mt-2 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center"><Activity size={16} className="mr-2"/> Tindakan Medis</h4>
                      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                        {record.actions.map(act => (
                          <li key={act.id}><span className="font-medium">{act.actionName}</span> {act.description && `— ${act.description}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Resep Obat */}
                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div className="md:col-span-2 mt-2 bg-teal-50/50 p-4 rounded-lg border border-teal-100">
                      <h4 className="text-sm font-bold text-teal-800 mb-3 flex items-center"><Pill size={16} className="mr-2"/> Resep Obat</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-teal-700 uppercase bg-teal-100/50">
                            <tr>
                              <th className="px-4 py-2 rounded-tl-lg">Nama Obat</th>
                              <th className="px-4 py-2">Dosis</th>
                              <th className="px-4 py-2">Jumlah</th>
                              <th className="px-4 py-2 rounded-tr-lg">Catatan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {record.prescriptions.map(rx => (
                              <tr key={rx.id} className="border-b border-teal-100/50 last:border-0">
                                <td className="px-4 py-2 font-medium text-slate-800">{rx.medicineName}</td>
                                <td className="px-4 py-2 text-slate-600">{rx.dosage}</td>
                                <td className="px-4 py-2 text-slate-600">{rx.quantity}</td>
                                <td className="px-4 py-2 text-slate-600">{rx.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-slate-100 p-6 sticky top-0 bg-white z-20">
              <h3 className="text-lg font-semibold text-slate-800">Formulir Rekam Medis (SOAP, Tindakan, Resep)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Pasien (Sedang Diperiksa) *</label>
                <select required value={formData.registrationId} onChange={(e) => setFormData({...formData, registrationId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-teal-500">
                  <option value="">-- Pilih Pasien --</option>
                  {activeRegistrations.map(reg => (
                    <option key={reg.id} value={reg.id}>{reg.patient?.medicalRecordNumber} - {reg.patient?.name} (Poli: {reg.polyclinic?.name})</option>
                  ))}
                </select>
                {activeRegistrations.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Tidak ada pasien dengan status IN_PROGRESS atau CHECK_IN.</p>
                )}
              </div>

              {/* SOAP SECTION */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">1. S.O.A.P</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">S - Subjective (Keluhan Utama) *</label>
                      <textarea required rows="3" value={formData.subjective} onChange={(e) => setFormData({...formData, subjective: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">A - Assessment (Diagnosa) *</label>
                      <textarea required rows="3" value={formData.assessmentDiagnosis} onChange={(e) => setFormData({...formData, assessmentDiagnosis: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"></textarea>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">O - Objective (Fisik / Vital Sign)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Tensi Darah</label>
                          <input type="text" placeholder="120/80" value={formData.objectiveBloodPressure} onChange={(e) => setFormData({...formData, objectiveBloodPressure: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Suhu (°C)</label>
                          <input type="number" step="0.1" placeholder="36.5" value={formData.objectiveTemperature} onChange={(e) => setFormData({...formData, objectiveTemperature: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Berat (kg)</label>
                          <input type="number" step="0.1" placeholder="60.5" value={formData.objectiveWeight} onChange={(e) => setFormData({...formData, objectiveWeight: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Tinggi (cm)</label>
                          <input type="number" step="0.1" placeholder="170" value={formData.objectiveHeight} onChange={(e) => setFormData({...formData, objectiveHeight: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">P - Plan (Rencana) *</label>
                      <textarea required rows="2" value={formData.planTherapy} onChange={(e) => setFormData({...formData, planTherapy: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONS SECTION */}
              <div className="bg-blue-50/30 p-5 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-blue-800 uppercase tracking-wider">2. Tindakan Medis</h4>
                  <button type="button" onClick={addAction} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-medium flex items-center transition-colors">
                    <Plus size={14} className="mr-1"/> Tambah Tindakan
                  </button>
                </div>
                {formData.actions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Belum ada tindakan yang ditambahkan.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.actions.map((act, index) => (
                      <div key={index} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex-1">
                          <input required type="text" placeholder="Nama Tindakan (misal: Jahit Luka)" value={act.actionName} onChange={(e) => updateAction(index, 'actionName', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md text-sm mb-2 focus:ring-2 focus:ring-blue-500" />
                          <textarea rows="1" placeholder="Keterangan (opsional)" value={act.description} onChange={(e) => updateAction(index, 'description', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <button type="button" onClick={() => removeAction(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PRESCRIPTION SECTION */}
              <div className="bg-teal-50/30 p-5 rounded-xl border border-teal-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-teal-800 uppercase tracking-wider">3. Resep Obat</h4>
                  <button type="button" onClick={addPrescription} className="text-xs bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1.5 rounded-lg font-medium flex items-center transition-colors">
                    <Plus size={14} className="mr-1"/> Tambah Obat
                  </button>
                </div>
                {formData.prescriptions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Belum ada obat yang diresepkan.</p>
                ) : (
                  <div className="space-y-3">
                    {formData.prescriptions.map((rx, index) => (
                      <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-start bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <div className="w-full md:w-1/3">
                          <input required type="text" placeholder="Nama Obat (misal: Paracetamol)" value={rx.medicineName} onChange={(e) => updatePrescription(index, 'medicineName', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div className="w-full md:w-1/4">
                          <input required type="text" placeholder="Dosis (misal: 3x1)" value={rx.dosage} onChange={(e) => updatePrescription(index, 'dosage', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div className="w-full md:w-1/6">
                          <input required type="number" min="1" placeholder="Jml" value={rx.quantity} onChange={(e) => updatePrescription(index, 'quantity', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input type="text" placeholder="Catatan (opsional)" value={rx.notes} onChange={(e) => updatePrescription(index, 'notes', e.target.value)} className="w-full p-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-teal-500" />
                          <button type="button" onClick={() => removePrescription(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 sticky bottom-0 bg-white z-10 pb-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Seluruh Rekam Medis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicalRecords;
