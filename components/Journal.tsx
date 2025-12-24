import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { PenLine, Calendar, FolderOpen, Save, Quote, ChevronRight, FileText } from 'lucide-react';

interface Props {
  entries: JournalEntry[];
  onAdd: (text: string) => void;
}

const Journal: React.FC<Props> = ({ entries, onAdd }) => {
  const [text, setText] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
    setShowHistory(true); // Switch to history after saving
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-night-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-night-800 p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <PenLine size={20} className="text-islamic-600"/> জার্নাল
        </h2>
        {showHistory && (
            <button 
                onClick={() => setShowHistory(false)}
                className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors active:scale-95"
            >
                <PenLine size={14}/> নতুন লিখুন
            </button>
        )}
      </div>

      <div className="p-4">
        {showHistory ? (
            <div className="max-w-lg mx-auto animate-fade-in">
                <div className="flex items-center justify-center mb-6">
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        পূর্বের ভালো কাজ সমূহ ({entries.length})
                    </span>
                </div>

                {entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 bg-white dark:bg-night-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 mx-4">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                            <FolderOpen size={32} className="opacity-40 text-slate-500"/>
                        </div>
                        <p className="font-bold text-lg text-slate-600 dark:text-slate-300">কোনো জার্নাল নেই</p>
                        <p className="text-xs mt-2 opacity-60 text-center">আপনার মনের কথাগুলো লিখে রাখতে 'নতুন লিখুন' বাটনে চাপ দিন</p>
                    </div>
                ) : (
                    <div className="space-y-4 pb-10">
                        {entries.map(entry => (
                            <div key={entry.id} className="bg-white dark:bg-night-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-3 border-b border-slate-50 dark:border-slate-700/50 pb-2">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold">
                                        <div className="bg-islamic-50 dark:bg-islamic-900/30 p-1.5 rounded-md text-islamic-600">
                                            <Calendar size={14}/>
                                        </div>
                                        <span>{entry.date}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                                        {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="relative pl-2">
                                    <Quote size={12} className="absolute -top-1 -left-1 text-slate-200 dark:text-slate-700 transform -scale-x-100" />
                                    <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                                        {entry.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
                {/* Input Area */}
                <div className="bg-white dark:bg-night-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-islamic-500 rounded-full"></span>
                        আজকের ভালো কাজ বা অনুভূতি লিখুন
                    </label>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="আজ আমি..."
                        className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white resize-none focus:ring-2 focus:ring-islamic-500 outline-none transition-all placeholder:text-slate-400 leading-relaxed"
                    ></textarea>
                    
                    <div className="flex justify-between items-center mt-4">
                         <span className="text-xs text-slate-400 font-mono">{text.length} characters</span>
                         <button 
                            onClick={handleSave}
                            disabled={!text.trim()}
                            className="bg-islamic-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-islamic-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-islamic-700 active:scale-95 transition-all"
                         >
                            <Save size={18} /> সংরক্ষণ
                         </button>
                    </div>
                </div>

                {/* VISIBLE FILE CARD FOR HISTORY */}
                <div 
                    onClick={() => setShowHistory(true)}
                    className="bg-white dark:bg-night-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
                >
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                        <FileText size={24} className="drop-shadow-sm" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">পূর্বের ভালো কাজ সমূহ</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{entries.length} টি এন্ট্রি জমা আছে</p>
                    </div>
                    <div className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        <ChevronRight size={20} />
                    </div>
                </div>

                {/* Motivation Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <h4 className="text-blue-700 dark:text-blue-300 font-bold text-sm mb-2 flex items-center gap-2">
                        <div className="bg-white dark:bg-blue-800/50 p-1 rounded-full"><PenLine size={12}/></div>
                        কেন লিখবেন?
                    </h4>
                    <p className="text-blue-600 dark:text-blue-200 text-xs leading-relaxed opacity-90">
                        প্রতিদিন অন্তত একটি ভালো কাজ বা অনুভূতি লিখে রাখলে তা আপনাকে মানসিকভাবে প্রশান্তি দেবে এবং ভালো কাজের প্রতি আরও উৎসাহিত করবে।
                    </p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Journal;