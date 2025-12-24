import React, { useState, useEffect, useRef } from 'react';
import { View, Tasbih, TargetAmol, JournalEntry, Stats, InboxMessage, DailyHistory, GardenTree } from './types';
import { DEFAULT_TASBIHS, DEFAULT_TARGETS, WELCOME_MESSAGE, DEMO_REPORT_MESSAGE, DISCLAIMER_MESSAGE, LEVEL_THRESHOLD, ISLAMIC_DATABASE } from './constants';
import Dashboard from './components/Dashboard';
import TasbihList from './components/TasbihList';
import FocusMode from './components/FocusMode';
import TargetList from './components/TargetList';
import Journal from './components/Journal';
import Analysis from './components/Analysis';
import Inbox from './components/Inbox';
import Garden from './components/Garden';
import BottomNav from './components/BottomNav';
import { Toaster, toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function App() {
  // State
  const [view, setView] = useState<View>(View.HOME);
  const [activeTasbihId, setActiveTasbihId] = useState<string | null>(null);
  
  const [tasbihs, setTasbihs] = useState<Tasbih[]>(() => {
    const saved = localStorage.getItem('tasbihs');
    return saved ? JSON.parse(saved) : DEFAULT_TASBIHS;
  });

  // Special State for General Tasbih (Common Tasbih)
  const [generalTasbih, setGeneralTasbih] = useState<Tasbih>(() => {
    const saved = localStorage.getItem('generalTasbih');
    return saved ? JSON.parse(saved) : {
        id: 'general_tasbih',
        name: 'তাসবীহ পাঠ',
        schedule: 'everyday',
        count: 0,
        totalCount: 0,
        todayTime: 0
    };
  });

  // Refs to track session for Inbox reporting
  const generalSessionStart = useRef<{ count: number, time: number } | null>(null);

  const [targets, setTargets] = useState<TargetAmol[]>(() => {
    const saved = localStorage.getItem('targets');
    return saved ? JSON.parse(saved) : DEFAULT_TARGETS;
  });

  const [journal, setJournal] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('journal');
    return saved ? JSON.parse(saved) : [];
  });

  const [garden, setGarden] = useState<GardenTree[]>(() => {
    const saved = localStorage.getItem('garden');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem('stats');
    const parsed = saved ? JSON.parse(saved) : {};
    
    // Get local date string for initial state to prevent immediate mismatch
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset*60*1000));
    const localDateStr = localDate.toISOString().split('T')[0];

    return {
      totalNeki: parsed.totalNeki || 0,
      totalXP: parsed.totalXP || 0,
      level: parsed.level || 1,
      streak: parsed.streak || 0,
      lastActiveDate: parsed.lastActiveDate || localDateStr,
      todayNeki: parsed.todayNeki || 0,
      todayJournalCount: parsed.todayJournalCount || 0,
      lastHadithDate: parsed.lastHadithDate || '',
      shownHadithIndices: parsed.shownHadithIndices || [] 
    };
  });

  // History State for Analysis
  const [history, setHistory] = useState<DailyHistory[]>(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : [];
  });

  const [inbox, setInbox] = useState<InboxMessage[]>(() => {
    const saved = localStorage.getItem('inbox');
    let messages = saved ? JSON.parse(saved) : [WELCOME_MESSAGE, DISCLAIMER_MESSAGE, DEMO_REPORT_MESSAGE];
    
    // Auto-delete messages older than 48 hours
    const cutoffTime = Date.now() - (48 * 60 * 60 * 1000);
    messages = messages.filter((m: InboxMessage) => new Date(m.date).getTime() > cutoffTime);
    
    return messages;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Effects for Persistance
  useEffect(() => { localStorage.setItem('tasbihs', JSON.stringify(tasbihs)); }, [tasbihs]);
  useEffect(() => { localStorage.setItem('generalTasbih', JSON.stringify(generalTasbih)); }, [generalTasbih]);
  useEffect(() => { localStorage.setItem('targets', JSON.stringify(targets)); }, [targets]);
  useEffect(() => { localStorage.setItem('journal', JSON.stringify(journal)); }, [journal]);
  useEffect(() => { localStorage.setItem('garden', JSON.stringify(garden)); }, [garden]);
  useEffect(() => { localStorage.setItem('stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('inbox', JSON.stringify(inbox)); }, [inbox]);
  useEffect(() => { localStorage.setItem('history', JSON.stringify(history)); }, [history]);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // DAILY LOGIC: Reports & Hadiths & Garden Snapshot
  useEffect(() => {
    const now = new Date();
    // Use local time for date string to ensure midnight reset works for user's timezone
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset*60*1000));
    const todayStr = localDate.toISOString().split('T')[0];

    // --- 0. AUTO DELETE OLD MESSAGES CHECK (Periodic Check) ---
    const cutoffTime = Date.now() - (48 * 60 * 60 * 1000);
    setInbox(prev => prev.filter(m => new Date(m.date).getTime() > cutoffTime));
    
    // --- 1. DAILY REPORT & RESET LOGIC (Triggered on Date Change - Midnight Local) ---
    if (stats.lastActiveDate !== todayStr) {
      // Include General Tasbih in reports/history
      const allTasbihsIncludingGeneral = [...tasbihs, generalTasbih];
      
      const activeTasbihs = allTasbihsIncludingGeneral.filter(t => t.count > 0);
      const completedTargets = targets.filter(t => t.completed);
      const totalTimeSeconds = allTasbihsIncludingGeneral.reduce((acc, t) => acc + (t.todayTime || 0), 0);
      
      // --- GARDEN SNAPSHOT LOGIC ---
      // Plant trees for yesterday's activity IF count >= 100
      const gardenCandidates = activeTasbihs.filter(t => t.count >= 100);
      let newTrees: GardenTree[] = [];
      
      if (gardenCandidates.length > 0) {
        newTrees = gardenCandidates.map(t => ({
            id: `${stats.lastActiveDate}_${t.id}`, // Unique ID: Date + TasbihID
            tasbihName: t.name,
            date: stats.lastActiveDate, // The date they were active (yesterday)
            count: t.count // Snapshot of the TOTAL count at that moment
        }));
        
        setGarden(prev => [...prev, ...newTrees]);
      }

      // --- HISTORY ARCHIVING ---
      // We are about to reset stats, so save yesterday's stats to history
      const historyEntry: DailyHistory = {
          date: stats.lastActiveDate,
          totalTime: totalTimeSeconds,
          totalNeki: stats.todayNeki
      };
      
      setHistory(prev => {
          // Avoid duplicates if logic runs multiple times
          const filtered = prev.filter(h => h.date !== stats.lastActiveDate);
          return [...filtered, historyEntry];
      });

      // --- REPORT GENERATION ---
      const minutes = Math.floor(totalTimeSeconds / 60);
      const seconds = totalTimeSeconds % 60;
      const timeString = `${minutes} মিনিট ${seconds} সেকেন্ড`;
      const todayJournalXP = stats.todayJournalCount * 100;

      let dailyReportBody = `আসসালামু আলাইকুম,\nগতকালের আমলের রিপোর্ট:\n\n`;
      dailyReportBody += `📿 **তাসবীহ পাঠ:**\n`;
      if (activeTasbihs.length > 0) {
        activeTasbihs.forEach(t => { dailyReportBody += `- ${t.name}: ${t.count} বার\n`; });
      } else { dailyReportBody += `কোনো তাসবীহ পাঠ করা হয়নি।\n`; }

      dailyReportBody += `\n🎯 **টার্গেট পূরণ:**\n`;
      if (completedTargets.length > 0) {
        completedTargets.forEach(t => { dailyReportBody += `- ${t.name}\n`; });
      } else { dailyReportBody += `কোনো টার্গেট পূরণ করা হয়নি।\n`; }
      
      // Daily Tree Report
      if (newTrees.length > 0) {
          dailyReportBody += `\n🌳 **বাগান আপডেট:**\nগতকাল ${newTrees.length} টি গাছ রোপন করা হয়েছে:\n`;
          newTrees.forEach(t => {
            dailyReportBody += `- ${t.tasbihName}\n`;
          });
      } else {
        dailyReportBody += `\n🌳 **বাগান আপডেট:**\nগতকাল কোনো গাছ রোপন করা হয়নি (প্রতি ১০০ বারে ১টি গাছ)।`;
      }

      dailyReportBody += `\n\n⏱ **মোট সময় ব্যয়:** ${timeString}`;
      dailyReportBody += `\n✨ **অর্জিত নেকি:** ${stats.todayNeki}`;
      dailyReportBody += `\n\n📖 **ভালো কাজ:** ${stats.todayJournalCount} টি (${todayJournalXP} XP)`;

      const dailyMsg: InboxMessage = {
        id: Date.now().toString() + '_daily',
        title: 'দৈনিক রিপোর্ট',
        body: dailyReportBody,
        date: new Date().toISOString(),
        read: false,
        type: 'report'
      };
      
      let newMessages = [dailyMsg];
      
      // Weekly Report (Friday)
      if (now.getDay() === 5) { 
         const totalJournalXP = journal.length * 100;
         
         // Weekly Tree Calculation
         const oneWeekAgo = new Date();
         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
         const allHistoryTrees = [...garden, ...newTrees];
         const weeklyTrees = allHistoryTrees.filter(t => new Date(t.date) > oneWeekAgo);
         
         let weeklyTreeStats = "";
         if (weeklyTrees.length > 0) {
             const treeCounts: Record<string, number> = {};
             weeklyTrees.forEach(t => {
                 treeCounts[t.tasbihName] = (treeCounts[t.tasbihName] || 0) + 1;
             });
             weeklyTreeStats = `\n🌳 **সাপ্তাহিক গাছ রোপন:** ${weeklyTrees.length} টি\n`;
             Object.entries(treeCounts).forEach(([name, count]) => {
                 weeklyTreeStats += `- ${name}: ${count} টি\n`;
             });
         } else {
             weeklyTreeStats = `\n🌳 **সাপ্তাহিক গাছ রোপন:** ০ টি\n`;
         }

         const weeklyMsg: InboxMessage = {
            id: Date.now().toString() + '_weekly',
            title: 'সাপ্তাহিক রিপোর্ট (জুমা মুবারক)',
            body: `আসসালামু আলাইকুম,\nজুমা মুবারক! আপনার আমলের অগ্রগতি:\n\n✨ **সর্বমোট নেকি:** ${stats.totalNeki}\n📜 **মোট ভালো কাজ:** ${journal.length} টি (${totalJournalXP} XP)\n🔥 **বর্তমান স্ট্রীক:** ${stats.streak} দিন\n${weeklyTreeStats}\nআল্লাহ আপনার সকল ইবাদত কবুল করুন।`,
            date: new Date().toISOString(),
            read: false,
            type: 'weekly_report'
         };
         newMessages.push(weeklyMsg);
      }

      // Monthly Report (1st of Month)
      if (now.getDate() === 1) {
          const totalJournalXP = journal.length * 100;
          
          // Monthly Tree Calculation
          const oneMonthAgo = new Date();
          oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
          const allHistoryTrees = [...garden, ...newTrees];
          const monthlyTrees = allHistoryTrees.filter(t => new Date(t.date) > oneMonthAgo);

          let monthlyTreeStats = "";
          if (monthlyTrees.length > 0) {
              const treeCounts: Record<string, number> = {};
              monthlyTrees.forEach(t => {
                  treeCounts[t.tasbihName] = (treeCounts[t.tasbihName] || 0) + 1;
              });
              monthlyTreeStats = `\n🌳 **মাসিক গাছ রোপন:** ${monthlyTrees.length} টি\n`;
              Object.entries(treeCounts).forEach(([name, count]) => {
                  monthlyTreeStats += `- ${name}: ${count} টি\n`;
              });
          } else {
              monthlyTreeStats = `\n🌳 **মাসিক গাছ রোপন:** ০ টি\n`;
          }

          const monthlyMsg: InboxMessage = {
            id: Date.now().toString() + '_monthly',
            title: 'মাসিক রিপোর্ট',
            body: `আসসালামু আলাইকুম,\nনতুন মাসের শুভেচ্ছা! আপনার আমলনামার সংক্ষিপ্ত সারসংক্ষেপ:\n\n📊 **লেভেল অর্জন:** ${stats.level}\n📜 **মোট ভালো কাজ:** ${journal.length} টি (${totalJournalXP} XP)\n✨ **মোট নেকি:** ${stats.totalNeki}\n${monthlyTreeStats}\nনতুন মাসে নতুন উদ্যমে ইবাদত শুরু করুন।`,
            date: new Date().toISOString(),
            read: false,
            type: 'report'
         };
         newMessages.push(monthlyMsg);
      }

      setInbox(prev => [...newMessages, ...prev]);

      // --- RESET COUNTERS ---
      setTasbihs(prev => prev.map(t => ({ ...t, count: 0, todayTime: 0 })));
      setGeneralTasbih(prev => ({ ...prev, count: 0, todayTime: 0 }));
      setTargets(prev => prev.map(t => ({ ...t, completed: false })));

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = stats.streak;
      if (stats.lastActiveDate === yesterdayStr) {
        newStreak += 1;
      } else if (stats.lastActiveDate !== todayStr) {
        newStreak = 1; 
      }

      setStats(prev => ({
        ...prev,
        lastActiveDate: todayStr,
        todayNeki: 0,
        todayJournalCount: 0,
        streak: newStreak
      }));
    }

    // --- 2. DAILY HADITH LOGIC (Random & Non-repeating) ---
    if (stats.lastHadithDate !== todayStr) {
        const scheduleTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0);
        if (now >= scheduleTime) {
            const totalItems = ISLAMIC_DATABASE.length;
            let currentShown = stats.shownHadithIndices || [];

            if (currentShown.length >= totalItems) {
                currentShown = [];
            }

            const availableIndices: number[] = [];
            for (let i = 0; i < totalItems; i++) {
                if (!currentShown.includes(i)) {
                    availableIndices.push(i);
                }
            }

            let selectedIndex = 0;
            if (availableIndices.length > 0) {
                const randomPointer = Math.floor(Math.random() * availableIndices.length);
                selectedIndex = availableIndices[randomPointer];
            }

            const content = ISLAMIC_DATABASE[selectedIndex];
            const hadithMsg: InboxMessage = {
                id: Date.now().toString() + '_hadith',
                title: 'আজকের বাণী',
                body: `${content.text}\n\n— ${content.source}`,
                date: scheduleTime.toISOString(), 
                read: false,
                type: 'info'
            };

            setInbox(prev => [hadithMsg, ...prev]);
            setStats(prev => ({
                ...prev,
                shownHadithIndices: currentShown.length >= totalItems ? [selectedIndex] : [...currentShown, selectedIndex],
                lastHadithDate: todayStr
            }));
        }
    }

  }, [stats.lastActiveDate, stats.lastHadithDate, tasbihs, generalTasbih, targets]);

  // Helpers

  const calculateNeki = (tasbih: Tasbih): number => {
      if (tasbih.arabicText && tasbih.arabicText.trim().length > 0) {
          const cleanText = tasbih.arabicText.replace(/\s/g, '');
          return cleanText.length * 10;
      }
      if (tasbih.manualNeki && tasbih.manualNeki > 0) {
          return tasbih.manualNeki;
      }
      // Default for General Tasbih: 0 Neki
      if (tasbih.id === 'general_tasbih') {
          return 0;
      }
      return 0;
  };

  const addNeki = (amount: number) => {
    if (amount === 0) return;
    setStats(prev => {
      const newTotalNeki = prev.totalNeki + amount;
      const newLevel = Math.floor(newTotalNeki / LEVEL_THRESHOLD) + 1;
      return {
        ...prev,
        totalNeki: newTotalNeki,
        todayNeki: prev.todayNeki + amount,
        level: newLevel
      };
    });
  };

  const checkMilestone = (prevCount: number, newCount: number) => {
      const crossedMilestone = Math.floor(prevCount / 100) < Math.floor(newCount / 100);
      if (crossedMilestone) {
          const currentMilestone = Math.floor(newCount / 100) * 100;
          toast.success(`মাশআল্লাহ! ${currentMilestone} বার পূর্ণ হয়েছে`, {
              style: {
                  background: '#16a34a',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '18px'
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#16a34a',
              },
          });
          
          const duration = 2000;
          const end = Date.now() + duration;

          (function frame() {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#22c55e', '#facc15', '#f472b6']
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#22c55e', '#facc15', '#f472b6']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          }());
      }
  };

  const handleTasbihUpdate = (id: string, newCount: number, increment: number) => {
    setTasbihs(prev => prev.map(t => t.id === id ? { ...t, count: newCount, totalCount: t.totalCount + increment } : t));
    const tasbih = tasbihs.find(t => t.id === id);
    if (tasbih && increment > 0) {
      const nekiValue = calculateNeki(tasbih);
      addNeki(increment * nekiValue);
      checkMilestone(tasbih.count, newCount);
    }
  };

  const handleGeneralTasbihUpdate = (newCount: number, increment: number) => {
      setGeneralTasbih(prev => {
          const updated = { ...prev, count: newCount, totalCount: prev.totalCount + increment };
          return updated;
      });
      // No Neki calculation for General Tasbih
  };

  const handleTasbihTimeUpdate = (id: string, newTime: number) => {
      setTasbihs(prev => prev.map(t => t.id === id ? { ...t, todayTime: newTime } : t));
  };

  const handleGeneralTimeUpdate = (newTime: number) => {
      setGeneralTasbih(prev => ({ ...prev, todayTime: newTime }));
  };

  const handleTasbihEdit = (updatedTasbih: Tasbih) => {
    setTasbihs(prev => prev.map(t => t.id === updatedTasbih.id ? updatedTasbih : t));
  };

  const handleTargetAdd = (target: TargetAmol) => {
    setTargets(prev => [...prev, target]);
  };

  const handleTargetEdit = (updatedTarget: TargetAmol) => {
    setTargets(prev => prev.map(t => t.id === updatedTarget.id ? updatedTarget : t));
  };

  const handleTargetDelete = (id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const toggleTarget = (id: string) => {
    const target = targets.find(t => t.id === id);
    if (!target) return;
    if (!target.completed) {
      setTargets(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
      addNeki(target.neki);
      const infoMsg: InboxMessage = {
        id: Date.now().toString() + '_target_done',
        title: 'টার্গেট সম্পন্ন',
        body: `আলহামদুলিল্লাহ, আপনি ${target.name} টার্গেট পূরন করেছেন। আল্লাহ নিশ্চ্যয়ই আপনাকে এর প্রতিদান দিবেন ☺️`,
        date: new Date().toISOString(),
        read: false,
        type: 'info',
      };
      setInbox(prev => [infoMsg, ...prev]);
      toast.success(`${target.neki} নেকি যোগ হয়েছে!`);
      confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });
    } 
  };

  const handleClaimNeki = (msgId: string, amount: number) => {
      addNeki(amount);
      setInbox(prev => prev.filter(m => m.id !== msgId));
      toast.success(`${amount} নেকি যোগ হয়েছে!`);
      confetti({ particleCount: 30, spread: 70, origin: { y: 0.6 } });
  };

  const handleDeleteMultiple = (ids: string[]) => {
     setInbox(prev => prev.filter(m => !ids.includes(m.id)));
     toast.success(`${ids.length} টি মেসেজ মুছে ফেলা হয়েছে`);
  };

  const addJournalEntry = (text: string) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('bn-BD'),
      text,
      timestamp: Date.now()
    };
    setJournal(prev => [newEntry, ...prev]);
    setStats(prev => ({ 
        ...prev, 
        todayJournalCount: prev.todayJournalCount + 1,
        totalXP: prev.totalXP + 100
    }));
    toast.success("জার্নাল যুক্ত হয়েছে (+১০০ XP)");
  };

  // --- GENERAL TASBIH SESSION MANAGEMENT ---
  const enterGeneralTasbih = () => {
      generalSessionStart.current = {
          count: generalTasbih.count,
          time: generalTasbih.todayTime || 0
      };
      setView(View.GENERAL_TASBIH);
  };

  const exitGeneralTasbih = () => {
      if (generalSessionStart.current) {
          const endCount = generalTasbih.count;
          const endTime = generalTasbih.todayTime || 0;
          
          const sessionCount = endCount - generalSessionStart.current.count;
          const sessionTime = endTime - generalSessionStart.current.time;

          if (sessionCount > 0) {
              const minutes = Math.floor(sessionTime / 60);
              const seconds = sessionTime % 60;
              let timeStr = "";
              if (minutes > 0) timeStr += `${minutes} মিনিট `;
              timeStr += `${seconds} সেকেন্ড`;

              const reportMsg: InboxMessage = {
                  id: Date.now().toString() + '_gen_session',
                  title: 'তাসবীহ পাঠ রিপোর্ট',
                  body: `আপনি ${timeStr} সময়ে মোট ${sessionCount} বার সাধারণ তাসবীহ পাঠ করেছেন।`,
                  date: new Date().toISOString(),
                  read: false,
                  type: 'info'
              };
              setInbox(prev => [reportMsg, ...prev]);
          }
          generalSessionStart.current = null;
      }
      setView(View.HOME);
  };

  const renderContent = () => {
    switch (view) {
      case View.HOME:
        return (
          <Dashboard 
            stats={stats} 
            inboxCount={inbox.filter(m => !m.read).length}
            totalJournalCount={journal.length}
            onNavigate={setView}
            onGeneralTasbihClick={enterGeneralTasbih}
            darkMode={darkMode}
            toggleTheme={() => setDarkMode(!darkMode)}
          />
        );
      case View.TASBIH_LIST:
        return (
          <TasbihList 
            tasbihs={tasbihs} 
            onBack={() => setView(View.HOME)} 
            onSelect={(id) => { setActiveTasbihId(id); setView(View.FOCUS_MODE); }}
            onAdd={(tasbih) => setTasbihs([...tasbihs, tasbih])}
            onEdit={handleTasbihEdit}
            onDelete={(id) => setTasbihs(tasbihs.filter(t => t.id !== id))}
          />
        );
      case View.FOCUS_MODE:
        const activeTasbih = tasbihs.find(t => t.id === activeTasbihId);
        if (!activeTasbih) return setView(View.TASBIH_LIST);
        return (
          <FocusMode 
            tasbih={activeTasbih} 
            onUpdate={(count, inc) => handleTasbihUpdate(activeTasbih.id, count, inc)}
            onTimeUpdate={(time) => handleTasbihTimeUpdate(activeTasbih.id, time)}
            onBack={() => setView(View.TASBIH_LIST)}
            darkMode={darkMode}
          />
        );
      case View.GENERAL_TASBIH:
        return (
            <FocusMode 
                tasbih={generalTasbih}
                onUpdate={handleGeneralTasbihUpdate}
                onTimeUpdate={handleGeneralTimeUpdate}
                onBack={exitGeneralTasbih}
                darkMode={darkMode}
            />
        );
      case View.TARGET_LIST:
        return (
          <TargetList 
            targets={targets} 
            onToggle={toggleTarget} 
            onBack={() => setView(View.HOME)}
            onAdd={handleTargetAdd}
            onEdit={handleTargetEdit}
            onDelete={handleTargetDelete}
          />
        );
      case View.JOURNAL:
        return (
          <Journal 
            entries={journal} 
            onAdd={addJournalEntry} 
          />
        );
      case View.GARDEN:
        return (
          <Garden trees={garden} tasbihs={[...tasbihs, generalTasbih]} />
        );
      case View.ANALYSIS:
        return (
          <Analysis stats={stats} tasbihs={[...tasbihs, generalTasbih]} targets={targets} history={history} />
        );
      case View.INBOX:
        return (
          <Inbox 
            messages={inbox} 
            onMarkRead={(id) => setInbox(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))}
            onDelete={(id) => setInbox(prev => prev.filter(m => m.id !== id))}
            onDeleteMultiple={handleDeleteMultiple}
            onBack={() => setView(View.HOME)}
            onClaim={handleClaimNeki}
          />
        );
      default:
        return <Dashboard stats={stats} inboxCount={0} totalJournalCount={journal.length} onNavigate={setView} onGeneralTasbihClick={enterGeneralTasbih} darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative bg-islamic-50 dark:bg-night-900">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {renderContent()}
      </div>
      
      {view !== View.FOCUS_MODE && view !== View.GENERAL_TASBIH && (
        <BottomNav currentView={view} onNavigate={setView} />
      )}
      <Toaster position="top-center" />
    </div>
  );
}