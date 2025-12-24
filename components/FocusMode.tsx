import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Tasbih } from '../types';
import { ChevronLeft, Pause } from 'lucide-react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface Props {
  tasbih: Tasbih;
  onUpdate: (count: number, increment: number) => void;
  onTimeUpdate: (time: number) => void;
  onBack: () => void;
  darkMode: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

// Fixed Fruit Positions for consistent rendering
const FRUIT_POSITIONS = [
    { cx: 150, cy: 50, r: 6 }, { cx: 120, cy: 60, r: 7 }, { cx: 180, cy: 55, r: 6 },
    { cx: 90, cy: 130, r: 5 }, { cx: 210, cy: 110, r: 6 }, { cx: 140, cy: 90, r: 7 },
    { cx: 160, cy: 110, r: 6 }, { cx: 110, cy: 80, r: 5 }, { cx: 190, cy: 75, r: 6 },
    { cx: 70, cy: 90, r: 5 }, { cx: 230, cy: 80, r: 6 }, { cx: 130, cy: 130, r: 5 },
    { cx: 170, cy: 130, r: 6 }, { cx: 100, cy: 110, r: 5 }, { cx: 200, cy: 90, r: 6 },
    { cx: 150, cy: 30, r: 5 }, { cx: 120, cy: 40, r: 5 }, { cx: 180, cy: 40, r: 5 },
    { cx: 80, cy: 110, r: 5 }, { cx: 220, cy: 95, r: 6 }, { cx: 150, cy: 150, r: 6 },
    { cx: 135, cy: 70, r: 7 }, { cx: 165, cy: 70, r: 7 }, { cx: 60, cy: 80, r: 4 },
    { cx: 240, cy: 60, r: 4 }, { cx: 100, cy: 50, r: 5 }, { cx: 200, cy: 50, r: 5 },
    { cx: 150, cy: 75, r: 8 }, { cx: 115, cy: 100, r: 6 }, { cx: 185, cy: 100, r: 6 }
];

const FocusMode: React.FC<Props> = ({ tasbih, onUpdate, onTimeUpdate, onBack, darkMode }) => {
  // Local state for immediate UI feedback
  const [sessionCount, setSessionCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(tasbih.count);
  const [totalDisplayCount, setTotalDisplayCount] = useState(tasbih.totalCount);
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  
  // Timer States
  const [duration, setDuration] = useState(tasbih.todayTime || 0); 
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Refs for Batching Updates (The optimization magic)
  const pendingIncrementRef = useRef(0);
  const lastSavedCountRef = useRef(tasbih.count);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onUpdateRef = useRef(onUpdate);

  const isGeneralTasbih = tasbih.id === 'general_tasbih';

  // Keep refs in sync
  useEffect(() => { onTimeUpdateRef.current = onTimeUpdate; }, [onTimeUpdate]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  // Sync Logic: periodically flush pending updates to parent
  const flushUpdates = useCallback(() => {
    if (pendingIncrementRef.current > 0) {
        const newCount = lastSavedCountRef.current + pendingIncrementRef.current;
        const increment = pendingIncrementRef.current;
        
        onUpdateRef.current(newCount, increment);
        
        lastSavedCountRef.current = newCount;
        pendingIncrementRef.current = 0;
    }
  }, []);

  // Flush on unmount or back
  useEffect(() => {
    const interval = setInterval(flushUpdates, 2000); // Batch update every 2 seconds
    return () => {
        clearInterval(interval);
        flushUpdates(); // Save remaining taps on exit
    };
  }, [flushUpdates]);

  const handleBack = () => {
      flushUpdates();
      onBack();
  };

  // --- ENHANCED GROWTH LOGIC ---
  
  // Determine which count controls the tree growth
  // For General Tasbih: Use sessionCount (Resets every entry)
  // For Specific Tasbih: Use totalDisplayCount (Accumulated history)
  const growthBasisCount = isGeneralTasbih ? sessionCount : totalDisplayCount;

  // 1. Scale (Size): Grows from 0 to 100 count. 
  let currentScale = 0;
  if (growthBasisCount > 0) {
      const progressTo100 = Math.min(growthBasisCount, 100) / 100;
      currentScale = 0.2 + (Math.pow(progressTo100, 2.5) * 0.8);
  }

  // Check if tree is large enough to move text up
  const isTreeLarge = currentScale > 0.5;

  // 2. Density (Branches/Leaves): Increases from 100 to 500 count.
  let densityProgress = 0;
  if (growthBasisCount > 100) {
      const rawDensity = Math.min((growthBasisCount - 100) / 400, 1);
      densityProgress = Math.pow(rawDensity, 1.5); 
  }
  
  // Memoize stars
  const stars = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1 + 'px',
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      animationDuration: Math.random() * 3 + 2 + 's',
      animationDelay: Math.random() * 2 + 's',
    }));
  }, []);

  // Timer Ticking Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
        interval = setInterval(() => {
            setDuration(prev => {
                const newTime = prev + 1;
                // We can throttle time updates too, but 1sec is acceptable
                onTimeUpdateRef.current(newTime);
                return newTime;
            });
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Idle Timer Logic (Auto Stop)
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
        setIsTimerRunning(false); 
    }, 5000); 
  };

  useEffect(() => {
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, []);

  const handleSessionMilestone = (count: number) => {
     toast.success(`মাশআল্লাহ! ${count} বার পূর্ণ হয়েছে`, {
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
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Start/Resume Timer on Tap
    if (!isTimerRunning) setIsTimerRunning(true);
    resetIdleTimer();
    
    // Haptic
    if (navigator.vibrate) navigator.vibrate(50);
    
    // UPDATE LOCAL STATE IMMEDIATELY (Visuals)
    const newSessionCount = sessionCount + 1;
    setSessionCount(newSessionCount);
    setDisplayCount(prev => prev + 1);
    setTotalDisplayCount(prev => prev + 1);

    // BUFFER THE UPDATE (Performance)
    pendingIncrementRef.current += 1;

    // Check for Session-Based Milestone for General Tasbih
    if (isGeneralTasbih && newSessionCount > 0 && newSessionCount % 100 === 0) {
        handleSessionMilestone(newSessionCount);
    }

    // Tree Pulse Animation Trigger
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 150);

    // Particle Effect - Limit active particles to avoid DOM overload
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const newParticle = {
        id: Date.now(),
        x: rect.left + rect.width / 2,
        y: rect.top + 20 
      };
      setParticles(prev => {
          const next = [...prev, newParticle];
          if (next.length > 15) return next.slice(next.length - 15); // Keep max 15 particles
          return next;
      });
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 800);
    }
  };

  const handleManualPause = () => {
      setIsTimerRunning(false);
  };

  const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- NEW TREE COLOR LOGIC (Matching Garden.tsx for consistency) ---
  const getTreeStyle = () => {
    let mainLeafColor = darkMode ? "#22c55e" : "#4ade80"; 
    let trunkColor = darkMode ? "#5e4b35" : "#8B4513";
    let isMixedLeaves = false;
    let mixedPalette: string[] = [];
    
    // Fruit settings
    let fruitColor = "transparent";
    let visibleFruitCount = 0;
    let isMixedFruit = false;
    let filter = "none";
    
    const total = growthBasisCount; // Use the basis count (Session or Total)

    // 1. Stage 0-499: Green
    if (total < 500) {
        if (total >= 100) {
             const ratio = (total - 100) / 400;
             const lightness = darkMode ? 50 - (ratio * 20) : 60 - (ratio * 25);
             const saturation = darkMode ? 60 + (ratio * 10) : 70 + (ratio * 15);
             mainLeafColor = `hsl(142, ${saturation}%, ${lightness}%)`;
        }
    }
    // 2. Stage 500-999: Yellow
    else if (total >= 500 && total < 1000) {
        mainLeafColor = darkMode ? "#fbbf24" : "#facc15"; 
    }
    // 3. Stage 1000-1499: Pink
    else if (total >= 1000 && total < 1500) {
        mainLeafColor = darkMode ? "#ec4899" : "#f472b6"; 
    }
    // 4. Stage 1500-2999: Red
    else if (total >= 1500 && total < 3000) {
        mainLeafColor = darkMode ? "#ef4444" : "#dc2626"; 
        visibleFruitCount = Math.min(Math.floor((total - 1500) / 100), FRUIT_POSITIONS.length);
        fruitColor = "#fcd34d"; 
    }
    // 5. Stage 3000-4999: Mixed 
    else if (total >= 3000 && total < 5000) {
        isMixedLeaves = true;
        mixedPalette = darkMode 
            ? ["#fbbf24", "#ec4899", "#22c55e"] 
            : ["#facc15", "#f472b6", "#4ade80"];
        trunkColor = darkMode ? "#4a3b2a" : "#5D4037";
        visibleFruitCount = FRUIT_POSITIONS.length;
        fruitColor = "#fff"; 
        filter = "drop-shadow(0 0 5px rgba(251, 191, 36, 0.4))";
    }
    // 6. Stage 5000+: Legendary
    else if (total >= 5000) {
        isMixedLeaves = true;
        mixedPalette = darkMode 
            ? ["#0ea5e9", "#ef4444", "#fbbf24"]
            : ["#0ea5e9", "#ef4444", "#fbbf24"]; 
        trunkColor = "#312e81"; 
        visibleFruitCount = FRUIT_POSITIONS.length;
        fruitColor = "#ffffff";
        isMixedFruit = true;
        filter = "drop-shadow(0 0 10px rgba(14, 165, 233, 0.5))";
    }

    const getLeafColor = (index: number) => {
        if (!isMixedLeaves) return mainLeafColor;
        return mixedPalette[index % mixedPalette.length];
    };

    const getFruitColor = (index: number) => {
        if (isMixedFruit) {
             const colors = ["#fff", "#fef08a", "#bae6fd"];
             return colors[index % colors.length];
        }
        return fruitColor;
    };

    return { trunkColor, filter, getLeafColor, getFruitColor, visibleFruitCount };
  };

  const { trunkColor, filter, getLeafColor, getFruitColor, visibleFruitCount } = getTreeStyle();

  return (
    <div className={`fixed inset-0 w-full h-full flex flex-col overflow-hidden ${darkMode ? 'bg-night-900' : 'bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50'}`}>
      
      <style>{`
        @keyframes sway {
            0% { transform: rotate(-1deg); }
            50% { transform: rotate(1deg); }
            100% { transform: rotate(-1deg); }
        }
        @keyframes shimmer {
            0% { opacity: 0.9; }
            50% { opacity: 1; }
            100% { opacity: 0.9; }
        }
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes flyParticle {
            0% { transform: translate(-50%, 0) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -220px) scale(0.2); opacity: 0; }
        }
        @keyframes idleRedPulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); border-color: rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); border-color: rgba(239, 68, 68, 0.1); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); border-color: rgba(239, 68, 68, 0); }
        }
        @keyframes fruitPop {
            0% { transform: scale(0); }
            60% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
      `}</style>

      {/* Atmospheric Particles - Z-Index 0 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {darkMode ? (
            <>
                {/* Static Stars with Twinkle Animation */}
                {stars.map((star) => (
                    <div key={star.id} className="absolute bg-white rounded-full" 
                         style={{ 
                             width: star.size, 
                             height: star.size, 
                             top: star.top, 
                             left: star.left,
                             animation: `twinkle ${star.animationDuration} infinite ease-in-out`,
                             animationDelay: star.animationDelay
                         }} 
                    />
                ))}
                
                {/* Crescent Moon */}
                <div className="absolute top-16 right-8 w-16 h-16 rounded-full shadow-[-8px_4px_0_2px_#fff] rotate-[-25deg] opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"></div>
            </>
        ) : (
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-300 rounded-full blur-[80px] opacity-40"></div>
        )}
      </div>

      {/* Header - Z-Index 50 (Always on top) */}
      <div className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-center text-slate-800 dark:text-white">
        <button onClick={handleBack} className="p-2 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full active:scale-95 transition-transform"><ChevronLeft /></button>
      </div>

      {/* TOP INFO CARD - Z-Index 40 (Moved to Top) */}
      <div 
        className="absolute left-0 w-full z-40 flex flex-col items-center justify-start px-6 text-center transition-all duration-700 ease-in-out"
        style={{
            top: isTreeLarge ? '16px' : '48px',
            transform: isTreeLarge ? 'scale(0.85)' : 'scale(1)',
            opacity: 1
        }}
      >
           {tasbih.arabicText && (
                <div className="text-2xl md:text-3xl font-serif text-islamic-800 dark:text-islamic-100 drop-shadow-sm leading-normal animate-fade-in py-1">
                    {tasbih.arabicText}
                </div>
            )}
            <div className="bg-white/30 dark:bg-night-800/60 backdrop-blur-md rounded-xl py-1 px-3 inline-block border border-white/40 dark:border-white/10 shadow-sm">
                <h2 className="text-base text-slate-800 dark:text-slate-100 font-bold">{tasbih.name}</h2>
                {tasbih.banglaMeaning && <p className="text-[10px] text-slate-700 dark:text-slate-300">{tasbih.banglaMeaning}</p>}
            </div>
      </div>

      {/* --- TREE VISUALIZATION CONTAINER - Z-Index 20 --- */}
      <div className="absolute inset-0 z-20 flex items-end justify-center pb-52 pointer-events-none">
             
             {/* Particles (Z-Index 10: Behind Tree) */}
             {particles.map(p => (
                 <div 
                    key={p.id}
                    className="absolute w-4 h-4 rounded-full z-10"
                    style={{
                        left: '50%', 
                        bottom: '50px', // Relative to tree container bottom
                        backgroundColor: '#4ade80',
                        boxShadow: '0 0 10px currentColor',
                        animation: 'flyParticle 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
                    }}
                 />
             ))}

             {/* Ground */}
             <div className={`absolute bottom-0 w-80 h-16 rounded-[100%] blur-md transition-colors duration-1000 ${darkMode ? 'bg-night-800' : 'bg-emerald-700/20'}`}></div>
             
             {/* THE TREE SVG (Z-Index 20: Front of Particles) */}
             {growthBasisCount > 0 && (
                 <div 
                    className="transition-transform duration-500 ease-out will-change-transform origin-bottom mb-4 z-20"
                    style={{
                        transform: `scale(${currentScale}) ${isPulsing ? 'scale(1.03)' : ''}`,
                        filter: filter,
                        height: '320px',
                        width: '320px'
                    }}
                 >
                    <svg 
                        viewBox="0 0 300 300" 
                        className="w-full h-full drop-shadow-2xl overflow-visible"
                    >
                        {/* Wind Sway Group */}
                        <g transform-origin="150 280" style={{ animation: 'sway 6s ease-in-out infinite' }}>
                            
                            {/* Trunk */}
                            <path 
                                d="M150,280 Q160,200 145,150 T150,50" 
                                stroke={trunkColor} 
                                strokeWidth="18" 
                                fill="none" 
                                strokeLinecap="round"
                                className="transition-colors duration-1000"
                            />
                            
                            {/* Roots */}
                            <path d="M150,280 Q130,290 120,300" stroke={trunkColor} strokeWidth="12" fill="none" strokeLinecap="round" className="transition-colors duration-1000"/>
                            <path d="M150,280 Q170,290 180,300" stroke={trunkColor} strokeWidth="12" fill="none" strokeLinecap="round" className="transition-colors duration-1000"/>

                            {/* Main Branches */}
                            <g stroke={trunkColor} fill="none" strokeLinecap="round" className="transition-colors duration-1000">
                                <path d="M148,180 Q110,160 90,130" strokeWidth="12" />
                                <path d="M152,160 Q190,140 210,110" strokeWidth="11" />
                            </g>

                            {/* Secondary Branches (Density dependent - grows with counts 100-500) */}
                            <g stroke={trunkColor} fill="none" strokeLinecap="round" opacity={densityProgress} className="transition-opacity duration-1000">
                                <path d="M90,130 Q70,110 60,80" strokeWidth="8" />
                                <path d="M210,110 Q230,90 240,60" strokeWidth="8" />
                                <path d="M148,110 Q120,90 110,60" strokeWidth="8" />
                                <path d="M152,100 Q180,80 190,50" strokeWidth="8" />
                            </g>
                            
                            {/* Leaves Group - Now with individual color functions */}
                            <g style={{ animation: 'shimmer 3s ease-in-out infinite' }}>
                                {/* Tips of Main Trunk and Branches (Always Visible) */}
                                <circle cx="150" cy="50" r="45" opacity="0.95" fill={getLeafColor(0)} />
                                <circle cx="90" cy="130" r="35" opacity="0.9" fill={getLeafColor(1)} />
                                <circle cx="210" cy="110" r="38" opacity="0.9" fill={getLeafColor(2)} />
                                <circle cx="120" cy="60" r="35" opacity="0.85" fill={getLeafColor(3)} />
                                <circle cx="180" cy="55" r="38" opacity="0.85" fill={getLeafColor(4)} />

                                {/* Density Leaves */}
                                <g opacity={Math.min(densityProgress + 0.2, 1)}>
                                    <circle cx="60" cy="80" r="32" opacity="0.95" fill={getLeafColor(5)} />
                                    <circle cx="240" cy="60" r="34" opacity="0.95" fill={getLeafColor(6)} />
                                    <circle cx="110" cy="60" r="30" opacity="0.9" fill={getLeafColor(7)} />
                                    <circle cx="190" cy="50" r="30" opacity="0.9" fill={getLeafColor(8)} />
                                </g>

                                {/* Bushy Effect */}
                                <g opacity={densityProgress}>
                                    <circle cx="150" cy="80" r="40" opacity="0.8" fill={getLeafColor(9)} />
                                    <circle cx="85" cy="100" r="28" opacity="0.85" fill={getLeafColor(10)} />
                                    <circle cx="215" cy="80" r="30" opacity="0.85" fill={getLeafColor(11)} />
                                    <circle cx="130" cy="30" r="25" opacity="0.9" fill={getLeafColor(12)} />
                                    <circle cx="170" cy="30" r="25" opacity="0.9" fill={getLeafColor(13)} />
                                </g>
                            </g>

                            {/* FRUITS RENDERING */}
                            {visibleFruitCount > 0 && (
                                <g className="transition-colors duration-1000" style={{ animation: 'shimmer 2s infinite alternate' }}>
                                    {FRUIT_POSITIONS.slice(0, visibleFruitCount).map((pos, index) => (
                                        <circle 
                                            key={index}
                                            cx={pos.cx} 
                                            cy={pos.cy} 
                                            r={pos.r} 
                                            fill={getFruitColor(index)}
                                            style={{ animation: `fruitPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`, transformOrigin: `${pos.cx}px ${pos.cy}px` }}
                                        />
                                    ))}
                                </g>
                            )}
                        </g>
                    </svg>
                 </div>
             )}
      </div>

      {/* --- CONTROLS SECTION - Z-Index 50 (Fixed Bottom) --- */}
      <div className="absolute bottom-0 left-0 w-full z-50 pb-2 px-4">
            
            {/* Helper Text - Moved Above */}
            <p className="text-center text-[10px] text-slate-500 dark:text-slate-500 font-medium tracking-wide mb-2 opacity-60 h-4">
                {isIdle && <span className="text-red-500 font-bold animate-pulse">স্মরণ করুন ও ট্যাপ করুন</span>}
            </p>

            <div className={`flex items-end ${isGeneralTasbih ? 'justify-center' : 'justify-between'} max-w-sm mx-auto`}>
                
                {/* Left Counter: Timer (Hidden for General Tasbih) */}
                {!isGeneralTasbih && (
                    <div className="mb-6 bg-white/80 dark:bg-night-800/80 backdrop-blur-sm rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-lg min-w-[80px] text-center relative">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">সময়</span>
                        <span className="block text-xl font-bold font-mono text-slate-800 dark:text-white">{formatTime(duration)}</span>
                        
                        {/* Pause Button (Visible only if running) */}
                        {isTimerRunning && (
                            <button 
                                onClick={handleManualPause}
                                className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900 text-red-600 rounded-full shadow-sm hover:scale-110 transition-transform"
                            >
                                <Pause size={10} fill="currentColor" />
                            </button>
                        )}
                    </div>
                )}

                {/* Center: Tap Button */}
                <div className="relative">
                    {/* Fixed Size Container to prevent layout shift */}
                    <button 
                        ref={buttonRef}
                        onClick={handleTap}
                        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                        className={`
                            relative w-44 h-44 rounded-full flex items-center justify-center group overflow-hidden outline-none select-none touch-manipulation
                            border-4
                            ${isIdle 
                                ? 'animate-[idleRedPulse_1.5s_infinite] border-red-500' 
                                : darkMode 
                                    ? 'border-slate-700 shadow-[0_15px_35px_rgba(0,0,0,0.6)]' 
                                    : 'border-white shadow-[0_15px_35px_rgba(16,185,129,0.25)]'
                            }
                            ${darkMode
                                ? 'bg-gradient-to-b from-slate-800 to-black'
                                : 'bg-gradient-to-b from-white to-slate-100'
                            }
                        `}
                    >
                         {/* Scale Animation Wrapper (Internal only) */}
                         <div className="w-full h-full rounded-full flex items-center justify-center transition-transform duration-100 group-active:scale-95">
                            {/* Inner Ring */}
                            <div className={`
                                w-36 h-36 rounded-full flex items-center justify-center
                                ${darkMode 
                                    ? 'bg-night-900 shadow-[inset_0_4px_15px_rgba(0,0,0,0.5)]' 
                                    : 'bg-slate-50 shadow-[inset_0_4px_15px_rgba(0,0,0,0.05)]'
                                }
                            `}>
                                {/* Center Jewel/Button */}
                                <div className={`
                                    w-28 h-28 rounded-full flex items-center justify-center
                                    ${darkMode
                                        ? 'bg-gradient-to-br from-islamic-900 to-black border border-islamic-800'
                                        : 'bg-gradient-to-br from-islamic-500 to-islamic-600 border border-islamic-400'
                                    }
                                    shadow-inner
                                `}>
                                    <div className="text-white opacity-90 font-bold text-4xl tracking-tight drop-shadow-md font-mono">{sessionCount}</div>
                                </div>
                            </div>
                         </div>
                    </button>
                </div>

                {/* Right Counter: Daily Total (Hidden for General Tasbih) */}
                {!isGeneralTasbih && (
                    <div className="mb-6 bg-white/80 dark:bg-night-800/80 backdrop-blur-sm rounded-2xl p-3 border border-slate-200 dark:border-slate-700 shadow-lg min-w-[70px] text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">আজকে</span>
                        <span className="block text-xl font-bold font-mono text-slate-800 dark:text-white">{displayCount}</span>
                    </div>
                )}
            </div>
      </div>
    </div>
  );
};

export default FocusMode;