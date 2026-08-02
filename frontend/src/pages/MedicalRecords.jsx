import { useState } from 'react';
import api from '../services/api';
import { Search } from 'lucide-react';

const MedicalRecords = () => {
  const [patientId, setPatientId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async (e) => {
    e.preventDefault();
    if (!patientId) return;

    try {
      setLoading(true);
      // In real app, you might search by RM number and get patient ID first.
      // Here we assume patientId is known or typed.
      const res = await api.get(`/medical-records/${patientId}`);
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (error) {
      console.error(error);
      alert('Gagal mengambil data rekam medis. Pastikan ID Pasien benar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Riwayat Rekam Medis (SOAP)</h2>
        <p className="text-sm text-slate-500 mt-1">Cari dan lihat riwayat pemeriksaan pasien.</p>
        
        <form onSubmit={fetchRecords} className="mt-6 flex gap-3 max-w-md">
          <input 
            type="text" 
            placeholder="Masukkan ID Pasien..." 
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            required
          />
          <button type="submit" disabled={loading} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center">
            <Search size={16} className="mr-2" /> Cari
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
        {records.length === 0 ? (
          <div className="text-center text-slate-500 mt-10">
            {loading ? 'Mencari data...' : 'Silakan cari berdasarkan ID pasien untuk melihat riwayat.'}
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
                  {record.actions?.length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Tindakan Medis</h4>
                      <ul className="list-disc list-inside text-sm text-slate-600">
                        {record.actions.map(act => <li key={act.id}>{act.actionName} {act.description && `(${act.description})`}</li>)}
                      </ul>
                    </div>
                  )}
                  {record.prescriptions?.length > 0 && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">Resep Obat</h4>
                      <ul className="list-disc list-inside text-sm text-slate-600">
                        {record.prescriptions.map(rx => <li key={rx.id}>{rx.medicineName} - {rx.dosage} ({rx.quantity} buah)</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
