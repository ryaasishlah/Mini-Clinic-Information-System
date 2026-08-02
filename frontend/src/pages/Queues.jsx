import { useState, useEffect } from 'react';
import api from '../services/api';
import { Volume2, CheckCircle, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';

const Queues = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const res = await api.get('/queues');
      if (res.data.success) {
        setQueues(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    // Maybe poll every 10 seconds in real app
    const interval = setInterval(fetchQueues, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCall = async (id, queueNumber, polyclinicName) => {
    try {
      await api.put(`/queues/${id}/call`);
      toast.success(`Nomor antrean ${queueNumber} dipanggil`);
      fetchQueues();
      
      // Text-to-Speech (Web Speech API)
      if ('speechSynthesis' in window) {
        const text = `Nomor antrean, ${queueNumber.split('').join(', ')}, silakan menuju, ${polyclinicName}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.85; // slightly slower for clarity
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      toast.error('Gagal memanggil antrean');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/queues/${id}/status`, { status });
      toast.success('Status antrean diupdate');
      fetchQueues();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Manajemen Antrean Hari Ini</h2>
        <p className="text-sm text-slate-500 mt-1">Panggil dan atur antrean pasien secara real-time.</p>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && queues.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 py-10">Memuat data...</div>
          ) : queues.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 py-10">Belum ada antrean hari ini.</div>
          ) : (
            queues.map(queue => (
              <div key={queue.id} className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${
                queue.status === 'WAITING' ? 'border-orange-500' :
                queue.status === 'CALLED' ? 'border-blue-500' :
                queue.status === 'COMPLETED' ? 'border-green-500' : 'border-slate-300'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tight">{queue.queueNumber}</h3>
                    <p className="text-sm font-medium text-slate-600 mt-1">{queue.registration?.polyclinic?.name}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    queue.status === 'WAITING' ? 'bg-orange-100 text-orange-700' :
                    queue.status === 'CALLED' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                    queue.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {queue.status}
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-800">{queue.registration?.patient?.name}</p>
                  <p className="text-xs text-slate-500">{queue.registration?.patient?.medicalRecordNumber}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCall(queue.id, queue.queueNumber, queue.registration?.polyclinic?.name)}
                    disabled={queue.status === 'COMPLETED'}
                    className="flex-1 flex items-center justify-center py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Volume2 size={16} className="mr-2" /> Panggil
                  </button>
                  {queue.status !== 'COMPLETED' && (
                    <>
                      <button 
                        onClick={() => handleStatus(queue.id, 'COMPLETED')}
                        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        title="Selesai"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleStatus(queue.id, 'SKIPPED')}
                        className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Lewati"
                      >
                        <SkipForward size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Queues;
