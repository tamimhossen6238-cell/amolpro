import React from 'react';
import { View, Stats } from '../types';
import { LEVEL_THRESHOLD } from '../constants';
import { Sun, Moon, Mail, Fingerprint, ClipboardCheck } from 'lucide-react';

interface Props {
  stats: Stats;
  inboxCount: number;
  totalJournalCount: number;
  onNavigate: (view: View) => void;
  onGeneralTasbihClick: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const Dashboard: React.FC<Props> = ({ stats, inboxCount, totalJournalCount, onNavigate, onGeneralTasbihClick, darkMode, toggleTheme }) => {
  const nextLevelNeki = stats.level * LEVEL_THRESHOLD;
  const progress = ((stats.totalNeki - ((stats.level - 1) * LEVEL_THRESHOLD)) / LEVEL_THRESHOLD) * 100;
  
  // Calculate relative progress for current level (can be > 100% momentarily before level up, clipped at 100 for visual)
  const levelProgress = Math.min(Math.max((stats.totalNeki % LEVEL_THRESHOLD) / LEVEL_THRESHOLD * 100, 0), 100);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center py-2">
        <div>
            {/* Greeting removed and Title updated to Green 'Amol' */}
            <h2 className="text-4xl font-extrabold text-islamic-600 dark:text-islamic-500 tracking-wide font-serif drop-shadow-sm">আমল</h2>
        </div>
        <div className="flex gap-3">
             <button onClick={onGeneralTasbihClick} className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform">
                <Fingerprint size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
             <button onClick={() => onNavigate(View.INBOX)} className="relative p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                <Mail size={20} className="text-slate-600 dark:text-slate-300" />
                {inboxCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between text-sm mb-2 font-semibold">
            <span className="text-islamic-600 dark:text-islamic-400">লেভেল {stats.level}</span>
            <span className="text-slate-400">{Math.floor(levelProgress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-islamic-500 to-emerald-400 transition-all duration-1000" style={{ width: `${levelProgress}%` }}></div>
        </div>
        <div className="text-xs text-slate-400 mt-1 text-right">{stats.totalNeki % LEVEL_THRESHOLD} / {LEVEL_THRESHOLD} নেকি</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Neki Card - Green */}
        <div className="bg-gradient-to-br from-islamic-500 to-islamic-600 dark:from-islamic-900 dark:to-emerald-950 dark:border dark:border-islamic-800/50 rounded-2xl p-4 text-white shadow-lg shadow-islamic-500/20 dark:shadow-none">
            <div className="flex justify-between items-start mb-2">
                <div className="text-islamic-100 text-xs font-medium">আজকের নেকি</div>
                <div className="text-islamic-100 dark:text-islamic-300 text-[10px] bg-white/20 dark:bg-black/20 px-1.5 rounded">Total</div>
            </div>
            <div className="flex items-end gap-2">
                 <div className="text-3xl font-bold">{stats.todayNeki}</div>
            </div>
            {/* Total Neki Larger Display */}
            <div className="mt-2 pt-2 border-t border-white/20 dark:border-white/10 flex flex-col">
                 <div className="text-[10px] text-islamic-100 opacity-80">সর্বমোট নেকি</div>
                 <div className="text-xl font-bold tracking-wide">{stats.totalNeki}</div>
            </div>
        </div>

        {/* XP & Journal Card - Aesthetic Dark Mode Blue */}
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 dark:from-sky-900 dark:to-blue-950 dark:border dark:border-sky-800/50 rounded-2xl p-4 text-white shadow-lg shadow-sky-400/20 dark:shadow-none flex flex-col justify-between">
             <div>
                <div className="text-blue-50 dark:text-sky-200 text-xs font-medium mb-1">মোট XP</div>
                <div className="text-2xl font-bold text-white">
                    {stats.totalXP}
                </div>
             </div>
             
             <div className="mt-2 pt-2 border-t border-white/20 dark:border-white/10">
                 <div className="flex justify-between items-end">
                     <div>
                        <div className="text-[10px] text-blue-50 opacity-80">আজকের জার্নাল</div>
                        <div className="text-lg font-bold">{stats.todayJournalCount} টি</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] text-blue-50 opacity-80">সর্বমোট</div>
                        <div className="text-lg font-bold">{totalJournalCount} টি</div>
                     </div>
                 </div>
             </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 dark:text-slate-300">আজকের আমল</h3>
        
        <div onClick={() => onNavigate(View.TASBIH_LIST)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 cursor-pointer active:scale-95 transition-transform group">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:bg-blue-100 transition-colors">
                <Fingerprint size={24} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">দৈনিক তাসবীহ</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">আল্লাহর জিকির দিয়ে দিন শুরু করুন</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-islamic-50 group-hover:text-islamic-600 transition-all">
                <span className="text-islamic-600 dark:text-islamic-400 font-bold text-xs">GO</span>
            </div>
        </div>

        <div onClick={() => onNavigate(View.TARGET_LIST)} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 cursor-pointer active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 dark:text-purple-400">
                <ClipboardCheck size={24} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">টার্গেট আমল</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">প্রতিদিনের নির্ধারিত আমলসমূহ</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;