import React, { useState } from 'react';
import { TargetAmol } from '../types';
import { ChevronLeft, CheckCircle2, Circle, Plus, FolderCog, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Props {
  targets: TargetAmol[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onAdd: (target: TargetAmol) => void;
  onEdit: (target: TargetAmol) => void;
  onDelete: (id: string) => void;
}

const TargetList: React.FC<Props> = ({ targets, onToggle, onBack, onAdd, onEdit, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [showManager, setShowManager] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [neki, setNeki] = useState('');

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (t: TargetAmol) => {
    setEditingId(t.id);
    setName(t.name);
    setDescription(t.description);
    setNeki(t.neki.toString());
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const targetData: TargetAmol = {
        id: editingId || Date.now().toString(),
        name,
        description,
        // Neki is optional now, default to 0 if empty
        neki: neki ? parseInt(neki) : 0,
        completed: editingId ? targets.find(t => t.id === editingId)?.completed || false : false
    };

    if (editingId) {
        onEdit(targetData);
    } else {
        onAdd(targetData);
    }
    
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setNeki('');
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
                    toast.success('মুছে ফেলা হয়েছে');
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

  const confirmToggle = (id: string) => {
    toast((t) => (
      <div className="w-full">
        <p className="font-bold text-lg text-slate-800 mb-4">আপনি কি এই আমলটি সম্পন্ন করেছেন?</p>
        <div className="flex justify-end gap-3">
            <button 
                onClick={() => toast.dismiss(t.id)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
                না
            </button>
            <button 
                onClick={() => {
                    onToggle(id);
                    toast.dismiss(t.id);
                }}
                className="px-4 py-2 bg-islamic-600 text-white rounded-xl font-bold hover:bg-islamic-700 transition-colors"
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

  const handleTargetClick = (target: TargetAmol) => {
    if (target.completed) return;
    confirmToggle(target.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-night-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-night-800 p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
            <ChevronLeft />
            </button>
            <h2 className="font-bold text-lg dark:text-white">টার্গেট আমল</h2>
        </div>
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
      <div className="p-4 space-y-4">
        {targets.map((target) => (
          <div 
            key={target.id} 
            onClick={() => handleTargetClick(target)}
            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                target.completed 
                ? 'bg-islamic-50 dark:bg-islamic-900/10 border-islamic-200 dark:border-islamic-900' 
                : 'bg-white dark:bg-night-800 border-slate-100 dark:border-slate-800 active:scale-[0.98]'
            }`}
          >
            <div className="flex items-start gap-4">
                <div className={`mt-1 transition-colors ${target.completed ? 'text-islamic-500' : 'text-slate-300 dark:text-slate-600'}`}>
                    {target.completed ? <CheckCircle2 size={24} className="fill-current" /> : <Circle size={24} />}
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold text-lg ${target.completed ? 'text-islamic-700 dark:text-islamic-300 line-through decoration-2' : 'text-slate-800 dark:text-slate-100'}`}>
                        {target.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{target.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-md border border-amber-100 dark:border-amber-900/20">
                            +{target.neki} Neki
                        </span>
                    </div>
                </div>
            </div>
          </div>
        ))}

        <div className="mt-8 text-center p-6 bg-white dark:bg-night-800 rounded-2xl border border-slate-100 dark:border-slate-800">
             <h3 className="text-islamic-600 font-bold mb-2">আপনি কি জানেন?</h3>
             <p className="text-sm text-slate-600 dark:text-slate-300">
                যে ব্যক্তি সকালে ও সন্ধ্যায় ১০০ বার 'সুবহানাল্লাহি ওয়া বিহামদিহি' পাঠ করে, কিয়ামতের দিন তার চেয়ে উত্তম আমল নিয়ে কেউ আসবে না।
             </p>
        </div>
      </div>

      {/* File Manager Modal */}
      {showManager && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-night-800 rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[80vh] border dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><FolderCog size={20}/> ফাইল ম্যানেজার</h3>
                    <button onClick={() => setShowManager(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto p-2 space-y-2">
                    {targets.map(t => (
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
                    {targets.length === 0 && <p className="text-center text-slate-400 py-4">তালিকা খালি</p>}
                </div>
            </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-night-800 rounded-2xl p-6 w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto no-scrollbar border dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 dark:text-white">{editingId ? 'টার্গেট এডিট করুন' : 'নতুন টার্গেট যোগ করুন'}</h3>
            
            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">টার্গেটের নাম (আবশ্যক)</label>
                    <input 
                    type="text" 
                    placeholder="যেমন: সূরা ইয়াসিন পাঠ" 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-black dark:text-white"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">বর্ণনা/ফজিলত (অপশনাল)</label>
                    <textarea 
                    placeholder="বর্ণনা দিন..." 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-black dark:text-white h-20 resize-none"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    />
                </div>

                {/* Neki */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">নেকি পরিমাণ (অপশনাল)</label>
                    <input 
                    type="number" 
                    placeholder="উদাঃ 100" 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-black dark:text-white"
                    value={neki}
                    onChange={e => setNeki(e.target.value)}
                    />
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

export default TargetList;