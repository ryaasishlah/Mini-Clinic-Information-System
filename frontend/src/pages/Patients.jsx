import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [formData, setFormData] = useState({
    nik: '', name: '', gender: 'Laki-laki', birthDate: '', phone: '', address: ''
  });

  const fetchPatients = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      const res = await api.get(`/patients?page=${page}&limit=${pagination.limit}&search=${searchQuery}`);
      if (res.data.success) {
        setPatients(res.data.data.patients);
        setPagination(res.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch patients', error);
      toast.error('Gagal mengambil data pasien');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1, search);
  }, [search]); // re-fetch on search change

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPatients(newPage, search);
    }
  };

  const openModal = (patient = null) => {
    if (patient) {
      setCurrentPatient(patient);
      setFormData({
        nik: patient.nik,
        name: patient.name,
        gender: patient.gender,
        birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : '',
        phone: patient.phone || '',
        address: patient.address || ''
      });
    } else {
      setCurrentPatient(null);
      setFormData({ nik: '', name: '', gender: 'Laki-laki', birthDate: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPatient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentPatient) {
        await api.put(`/patients/${currentPatient.id}`, formData);
        toast.success('Data pasien berhasil diubah!');
      } else {
        await api.post('/patients', formData);
        toast.success('Pasien baru berhasil ditambahkan!');
      }
      closeModal();
      fetchPatients(pagination.page, search);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data pasien');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        toast.success('Pasien berhasil dihapus!');
        fetchPatients(pagination.page, search);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Gagal menghapus pasien');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Header & Actions */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Data Pasien</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola data master pasien klinik.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari NIK, Nama, No. RM..."
              value={search}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 bg-slate-50"
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} className="mr-2" /> Tambah Pasien
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10">
              <th className="p-4 font-medium">No. RM</th>
              <th className="p-4 font-medium">NIK</th>
              <th className="p-4 font-medium">Nama Pasien</th>
              <th className="p-4 font-medium">L/P</th>
              <th className="p-4 font-medium">No. Telp</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500">Memuat data...</td></tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <Search size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-1">Belum ada pasien</h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-sm">Data pasien kosong atau tidak ditemukan. Silakan tambahkan pasien baru untuk memulai.</p>
                    <button 
                      onClick={() => openModal()}
                      className="flex items-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus size={16} className="mr-2" /> Tambah Pasien Baru
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-medium text-teal-700">{patient.medicalRecordNumber}</td>
                  <td className="p-4 text-slate-600">{patient.nik}</td>
                  <td className="p-4 font-medium text-slate-800">{patient.name}</td>
                  <td className="p-4 text-slate-600">{patient.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                  <td className="p-4 text-slate-600">{patient.phone || '-'}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openModal(patient)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-block mr-2"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(patient.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors inline-block"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
        <div>
          Menampilkan {(pagination.page - 1) * pagination.limit + (patients.length > 0 ? 1 : 0)} hingga {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
        </div>
        <div className="flex gap-1">
          <button 
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="px-3 py-1 bg-teal-50 text-teal-700 font-medium rounded-md border border-teal-100">
            {pagination.page}
          </span>
          <button 
            disabled={pagination.page >= pagination.totalPages}
      {/* Pagination UI */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <p className="text-sm text-slate-500">
            Menampilkan halaman {pagination.page} dari {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="px-3 py-1 text-sm border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button 
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="px-3 py-1 text-sm border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-slate-800">
                {currentPatient ? 'Edit Pasien' : 'Tambah Pasien Baru'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIK *</label>
                <input 
                  type="text" required value={formData.nik} onChange={(e) => setFormData({...formData, nik: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pasien *</label>
                <input 
                  type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select 
                    value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir *</label>
                  <input 
                    type="date" required value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon</label>
                <input 
                  type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <textarea 
                  rows="3" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                ></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
