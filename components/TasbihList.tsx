import React, { useState } from 'react';
import { Tasbih } from '../types';
import { ChevronLeft, Plus, FolderCog, Pencil, Trash2, X, BookText, Mic, BotMessageSquare, Fingerprint } from 'lucide-react';
import { DAYS_OF_WEEK } from '../constants';
import { toast } from 'react-hot-toast';

interface Props {
  tasbihs: Tasbih[];
  onBack: () => void;
  onSelect: (id: string) => void;
  onAdd: (tasbih: Tasbih) => void;
  onEdit: (tasbih: Tasbih) => void;
  onDelete: (id: string) => void;
}

const TasbihList: React.FC<Props> = ({ tasbihs, onBack, onSelect, onAdd, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showManager, setShowManager] = useState(false);
  
  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [banglaPronunciation, setBanglaPronunciation] = useState('');
  const [banglaTranslation, setBanglaTranslation] = useState('');
  const [manualNeki, setManualNeki] = useState('');
  const [scheduleType, setScheduleType] = useState<'everyday' | 'custom'>('everyday');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const calculateNekiPerCount = (tasbih: Tasbih): number => {
    // 1. Priority: User-defined fixed Neki for default tasbihs.
    switch (tasbih.id) {
        case '1': return 70;
        case '2': return 80;
        case '3': return 90;
        case '4': return 120;
        case '5': return 100;
        case '6': return 300;
    }

    // 2. Priority: Custom tasbihs with arabic text
    if (tasbih.arabicText && tasbih.arabicText.trim().length > 0) {
        const originalText = tasbih.arabicText.trim();
        const cleanText = originalText
            .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
            .replace(/\u0640/g, "")
            .replace(/\s+/g, "")
            .replace(/[^\u0600-\u06FF]/g, "");
        return cleanText.length * 10;
    }

    // 3. Priority: Custom tasbihs with manual Neki
    if (tasbih.manualNeki) {
        return tasbih.manualNeki;
    }
    
    return 0;
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
        setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
        setSelectedDays([...selectedDays, day]);
    }
  };

  const openAddModal = () => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (t: Tasbih) => {
    setEditingId(t.id);
    setName(t.name);
    setArabicText(t.arabicText || '');
    setBanglaPronunciation(t.banglaPronunciation || '');
    setBanglaTranslation(t.banglaTranslation || '');
    setManualNeki(t.manualNeki ? t.manualNeki.toString() : '');
    setScheduleType(Array.isArray(t.schedule) ? 'custom' : 'everyday');
    setSelectedDays(Array.isArray(t.schedule) ? t.schedule : []);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const tasbihData: Tasbih = {
        id: editingId || Date.now().toString(),
        name,
        arabicText: arabicText.trim() || undefined,
        banglaPronunciation: banglaPronunciation.trim() || undefined,
        banglaTranslation: banglaTranslation.trim() || undefined,
        manualNeki: manualNeki ? parseInt(manualNeki) : undefined,
        schedule: scheduleType === 'everyday' ? 'everyday' : selectedDays,
        count: editingId ? tasbihs.find(t => t.id === editingId)?.count || 0 : 0,
        totalCount: editingId ? tasbihs.find(t => t.id === editingId)?.totalCount || 0 : 0,
        todayTime: editingId ? tasbihs.find(t => t.id === editingId)?.todayTime || 0 : 0
    };

    if (editingId) {
        onEdit(tasbihData);
    } else {
        onAdd(tasbihData);
    }
    
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setName('');
    setArabicText('');
    setBanglaPronunciation('');
    setBanglaTranslation('');
    setManualNeki('');
    setScheduleType('everyday');
    setSelectedDays([]);
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    toast((t) => (
      <div className="w-full">
        <p className="font-bold text-lg text-slate-800 mb-4">আপনি কি এই আমল করা বাদ দিতে চান?</p>
        <div className="flex justify-end gap-3">
            <button 
                onClick={() => toast.dismiss(t.id)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
                না
            </button>
            <button 
                onClick={() => {
                    onDelete(id);
                    toast.dismiss(t.id);
                    toast.success('মুছে ফেলা হয়েছে', { duration: 3000 });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
                হ্যাঁ
            </button>
        </div>
      </div>
    ), {
        duration: 5000,
        position: 'top-center',
        style: {
            background: '#fff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            padding: '24px',
            borderRadius: '20px',
            minWidth: '340px',
            maxWidth: '90vw'
        }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-night-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-night-800 p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
          <ChevronLeft />
        </button>
        <h2 className="font-bold text-lg dark:text-white">তাসবীহ তালিকা</h2>
        <div className="flex gap-2">
            <button onClick={() => setShowManager(true)} className="p-2 text-slate-500 hover:text-islamic-600 transition-colors">
                <FolderCog size={20} />
            </button>
            <button onClick={openAddModal} className="p-2 text-islamic-600 font-medium text-sm flex items-center gap-1 bg-islamic-50 dark:bg-islamic-900/30 rounded-lg">
                <Plus size={18} /> যোগ
            </button>
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
        {tasbihs.map((t) => {
          const perCount = calculateNekiPerCount(t);
          const earnedNeki = t.count * perCount;

          return (
            <div 
              key={t.id} 
              className={`bg-white dark:bg-night-800 rounded-xl p-4 shadow-sm relative group active:scale-[0.99] transition-all cursor-pointer ${
                t.count === 0 ? 'border-2 border-red-400 dark:border-red-500' : 'border border-slate-100 dark:border-slate-800'
              }`}
              onClick={() => onSelect(t.id)}
            >
              <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg truncate">{t.name}</h3>
                      {t.arabicText && <p className="text-islamic-600 dark:text-islamic-400 font-serif text-xl mt-1 leading-relaxed truncate">{t.arabicText}</p>}
                  </div>
                  <div className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 dark:text-slate-300 ml-2 whitespace-nowrap">
                      {Array.isArray(t.schedule) ? 'Custom Days' : 'প্রতিদিন'}
                  </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-islamic-700 dark:text-islamic-300 bg-islamic-50 dark:bg-islamic-900/30 px-2 py-1 rounded">
                      আজ: {t.count} বার
                      </span>
                      {earnedNeki > 0 && (
                          <span className="text-xs font-bold text-islamic-600 dark:text-islamic-400 bg-islamic-50 dark:bg-islamic-900/20 px-2 py-1 rounded">
                           +{earnedNeki} নেকি
                          </span>
                      )}
              </div>
            </div>
          );
        })}
        {tasbihs.length === 0 && (
            <div className="text-center py-10 text-slate-400">
                কোনো তাসবীহ নেই। 'যোগ' বাটনে ক্লিক করে শুরু করুন।
            </div>
        )}
      </div>

      {/* File Manager Modal */}
      {showManager && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowManager(false)}
        >
            <div className="bg-white dark:bg-night-800 rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[80vh] border dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><FolderCog size={20}/> ফাইল ম্যানেজার</h3>
                    <button onClick={() => setShowManager(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto p-2 space-y-2">
                    {tasbihs.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-black rounded-xl border border-slate-200 dark:border-slate-700">
                            <span className="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">{t.name}</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setShowManager(false); openEditModal(t); }} 
                                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button 
                                    onClick={() => confirmDelete(t.id)} 
                                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {tasbihs.length === 0 && <p className="text-center text-slate-400 py-4">তালিকা খালি</p>}
                </div>
            </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white dark:bg-night-800 rounded-2xl p-6 w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto no-scrollbar border dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 dark:text-white">{editingId ? 'আমল এডিট করুন' : 'নতুন আমল যোগ করুন'}</h3>
            
            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">আমলের নাম (আবশ্যক)</label>
                    <input 
                    type="text" 
                    placeholder="যেমন: সুবহানাল্লাহ" 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-black dark:text-white"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    />
                </div>

                {/* Schedule */}
                <div>
                     <label className="block text-xs font-bold text-slate-500 mb-2">সময়সূচি</label>
                     <div className="flex gap-2 mb-2 bg-slate-100 dark:bg-black p-1 rounded-lg">
                        <button 
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${scheduleType === 'everyday' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}
                            onClick={() => setScheduleType('everyday')}
                        >প্রতিদিন</button>
                        <button 
                             className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${scheduleType === 'custom' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}
                             onClick={() => setScheduleType('custom')}
                        >নির্দিষ্ট দিন</button>
                     </div>
                     
                     {scheduleType === 'custom' && (
                         <div className="flex flex-wrap gap-2">
                             {DAYS_OF_WEEK.map(day => (
                                 <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`px-3 py-1 text-xs rounded-full border ${selectedDays.includes(day) ? 'bg-islamic-600 text-white border-islamic-600' : 'bg-white dark:bg-black border-slate-200 dark:border-slate-700 dark:text-slate-300'}`}
                                 >
                                     {day}
                                 </button>
                             ))}
                         </div>
                     )}
                </div>

                {/* Arabic */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">আরবি টেক্সট (অপশনাল)</label>
                    <textarea 
                    placeholder="আরবি টেক্সট দিন..." 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-black dark:text-white font-serif h-20 resize-none"
                    value={arabicText}
                    onChange={e => setArabicText(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">আরবি দিলে প্রতি হরফে ১০ নেকি যোগ হবে।</p>
                </div>

                {/* Pronunciation */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">বাংলা উচ্চারণ (অপশনাল)</label>
                    <textarea
                    placeholder="বাংলা উচ্চারণ..." 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-black dark:text-white h-16 resize-none"
                    value={banglaPronunciation}
                    onChange={e => setBanglaPronunciation(e.target.value)}
                    />
                </div>

                {/* Meaning */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">বাংলা অর্থ (অপশনাল)</label>
                    <textarea
                    placeholder="বাংলা অর্থ..." 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-black dark:text-white h-16 resize-none"
                    value={banglaTranslation}
                    onChange={e => setBanglaTranslation(e.target.value)}
                    />
                </div>

                {/* Manual Neki */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">ম্যানুয়াল নেকি (অপশনাল)</label>
                    <input 
                    type="number" 
                    placeholder="প্রতি বারে কত নেকি?" 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-black dark:text-white"
                    value={manualNeki}
                    onChange={e => setManualNeki(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">আরবি না দিলে এখান থেকে নেকি হিসাব হবে।</p>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">বাতিল</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-islamic-600 text-white font-semibold shadow-lg shadow-islamic-600/30">সংরক্ষণ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasbihList;