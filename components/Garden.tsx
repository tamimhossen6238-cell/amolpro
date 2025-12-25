import React, { useState, useEffect } from 'react';
import { GardenTree, Tasbih } from '../types';
import { Sprout, TreeDeciduous, CalendarDays, Filter } from 'lucide-react';

interface Props {
  trees: GardenTree[];
  tasbihs: Tasbih[]; 
}

const MiniTree = ({ count, darkMode, type = 'tasbih' }: { count: number, darkMode: boolean, type?: 'tasbih' | 'journal' }) => {
    
    // --- SPECIAL JOURNAL FLOWER (INSTEAD OF TREE) ---
    if (type === 'journal') {
        const stemColor = darkMode ? "#065f46" : "#059669"; // Emerald-800 : Emerald-600
        const leafColor = darkMode ? "#10b981" : "#34d399"; // Emerald-500 : Emerald-400
        
        // Flower Petal Colors (Updated to Yellow)
        const petalMain = darkMode ? "#f59e0b" : "#facc15"; // Amber-500 : Yellow-400
        const petalLight = darkMode ? "#fcd34d" : "#fef08a"; // Amber-300 : Yellow-200
        const centerColor = darkMode ? "#78350f" : "#92400e"; // Amber-900 : Amber-800

        return (
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible" style={{ transformOrigin: 'bottom center' }}>
                 <g transform-origin="100 180">
                    {/* Stem - Slight Sway */}
                    <path d="M100,180 Q100,140 100,100" stroke={stemColor} strokeWidth="4" fill="none" strokeLinecap="round" />
                    
                    {/* Leaves */}
                    <path d="M100,140 Q80,130 70,145 Q90,150 100,140" fill={leafColor} opacity="0.9" />
                    <path d="M100,120 Q120,110 130,125 Q110,130 100,120" fill={leafColor} opacity="0.9" />

                    {/* Flower Head */}
                    <g transform="translate(100, 100)">
                        {/* Back Petals */}
                        <circle cx="0" cy="-15" r="15" fill={petalMain} transform="rotate(0)" opacity="0.9" />
                        <circle cx="0" cy="-15" r="15" fill={petalMain} transform="rotate(72)" opacity="0.9" />
                        <circle cx="0" cy="-15" r="15" fill={petalMain} transform="rotate(144)" opacity="0.9" />
                        <circle cx="0" cy="-15" r="15" fill={petalMain} transform="rotate(216)" opacity="0.9" />
                        <circle cx="0" cy="-15" r="15" fill={petalMain} transform="rotate(288)" opacity="0.9" />
                        
                        {/* Inner Petals (Lighter) */}
                        <circle cx="0" cy="-8" r="12" fill={petalLight} transform="rotate(36)" opacity="0.95" />
                        <circle cx="0" cy="-8" r="12" fill={petalLight} transform="rotate(108)" opacity="0.95" />
                        <circle cx="0" cy="-8" r="12" fill={petalLight} transform="rotate(180)" opacity="0.95" />
                        <circle cx="0" cy="-8" r="12" fill={petalLight} transform="rotate(252)" opacity="0.95" />
                        <circle cx="0" cy="-8" r="12" fill={petalLight} transform="rotate(324)" opacity="0.95" />

                        {/* Center */}
                        <circle cx="0" cy="0" r="8" fill={centerColor} />
                        <circle cx="-2" cy="-2" r="2" fill="white" opacity="0.5" />
                    </g>
                    
                    {/* Sparkles around flower */}
                    <circle cx="70" cy="80" r="2" fill="#fbbf24" opacity="0.6">
                        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="130" cy="90" r="1.5" fill="#fbbf24" opacity="0.6">
                        <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
                    </circle>
                 </g>
            </svg>
        );
    }

    // --- STANDARD TASBIH TREE ---
    // Fixed positions for consistent rendering
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

    let currentScale = 0.3; 
    if (count > 0) {
        const progressTo100 = Math.min(count, 100) / 100;
        currentScale = 0.2 + (Math.pow(progressTo100, 2.5) * 0.8);
    }
    currentScale = Math.min(currentScale, 0.85);

    let densityProgress = 0;
    if (count > 100) {
        const rawDensity = Math.min((count - 100) / 400, 1);
        densityProgress = Math.pow(rawDensity, 1.5); 
    }

    // --- COLOR LOGIC (Adjusted for Dark Mode Comfort) ---
    let mainLeafColor = darkMode ? "#22c55e" : "#4ade80"; // Green-500 : Green-400
    let trunkColor = darkMode ? "#5e4b35" : "#8B4513"; // Softer brown for dark mode
    let isMixedLeaves = false;
    let mixedPalette: string[] = [];
    
    // Fruit settings
    let fruitColor = "transparent";
    let visibleFruitCount = 0;
    let isMixedFruit = false;
    
    const total = count;

    // 1. Stage 0-499: Green
    if (total < 500) {
        if (total >= 100) {
             const ratio = (total - 100) / 400;
             const lightness = darkMode ? 50 - (ratio * 20) : 60 - (ratio * 25);
             const saturation = darkMode ? 60 + (ratio * 10) : 70 + (ratio * 15);
             mainLeafColor = `hsl(142, ${saturation}%, ${lightness}%)`;
        }
    }
    // 2. Stage 500-999: Yellow (Warmer in dark mode)
    else if (total >= 500 && total < 1000) {
        mainLeafColor = darkMode ? "#fbbf24" : "#facc15"; // Amber-400 : Yellow-400
    }
    // 3. Stage 1000-1499: Pink (Deep pink in dark mode)
    else if (total >= 1000 && total < 1500) {
        mainLeafColor = darkMode ? "#ec4899" : "#f472b6"; // Pink-500 : Pink-400
    }
    // 4. Stage 1500-2999: Red (Bright Red in dark mode for contrast)
    else if (total >= 1500 && total < 3000) {
        mainLeafColor = darkMode ? "#ef4444" : "#dc2626"; // Red-500 : Red-600
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
    }
    // 6. Stage 5000+: Legendary
    else if (total >= 5000) {
        isMixedLeaves = true;
        mixedPalette = darkMode 
            ? ["#0ea5e9", "#ef4444", "#fbbf24"] // Sky-500, Red-500, Amber-400
            : ["#0ea5e9", "#ef4444", "#fbbf24"]; 
        trunkColor = "#312e81"; 
        visibleFruitCount = FRUIT_POSITIONS.length;
        fruitColor = "#ffffff";
        isMixedFruit = true;
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

    return (
        <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible" style={{ transform: `scale(${currentScale})`, transformOrigin: 'bottom center' }}>
            <g transform-origin="150 280">
                {/* Trunk */}
                <path d="M150,280 Q160,200 145,150 T150,50" stroke={trunkColor} strokeWidth="18" fill="none" strokeLinecap="round" />
                <path d="M150,280 Q130,290 120,300" stroke={trunkColor} strokeWidth="12" fill="none" strokeLinecap="round" />
                <path d="M150,280 Q170,290 180,300" stroke={trunkColor} strokeWidth="12" fill="none" strokeLinecap="round" />

                <g stroke={trunkColor} fill="none" strokeLinecap="round">
                    <path d="M148,180 Q110,160 90,130" strokeWidth="12" />
                    <path d="M152,160 Q190,140 210,110" strokeWidth="11" />
                </g>

                <g stroke={trunkColor} fill="none" strokeLinecap="round" opacity={densityProgress}>
                    <path d="M90,130 Q70,110 60,80" strokeWidth="8" />
                    <path d="M210,110 Q230,90 240,60" strokeWidth="8" />
                    <path d="M148,110 Q120,90 110,60" strokeWidth="8" />
                    <path d="M152,100 Q180,80 190,50" strokeWidth="8" />
                </g>
                
                {/* Leaves - Now individually colored support */}
                <g>
                    <circle cx="150" cy="50" r="45" opacity="0.95" fill={getLeafColor(0)} />
                    <circle cx="90" cy="130" r="35" opacity="0.9" fill={getLeafColor(1)} />
                    <circle cx="210" cy="110" r="38" opacity="0.9" fill={getLeafColor(2)} />
                    <circle cx="120" cy="60" r="35" opacity="0.85" fill={getLeafColor(3)} />
                    <circle cx="180" cy="55" r="38" opacity="0.85" fill={getLeafColor(4)} />

                    <g opacity={Math.min(densityProgress + 0.2, 1)}>
                        <circle cx="60" cy="80" r="32" opacity="0.95" fill={getLeafColor(5)} />
                        <circle cx="240" cy="60" r="34" opacity="0.95" fill={getLeafColor(6)} />
                        <circle cx="110" cy="60" r="30" opacity="0.9" fill={getLeafColor(7)} />
                        <circle cx="190" cy="50" r="30" opacity="0.9" fill={getLeafColor(8)} />
                    </g>
                    <g opacity={densityProgress}>
                        <circle cx="150" cy="80" r="40" opacity="0.8" fill={getLeafColor(9)} />
                        <circle cx="85" cy="100" r="28" opacity="0.85" fill={getLeafColor(10)} />
                        <circle cx="215" cy="80" r="30" opacity="0.85" fill={getLeafColor(11)} />
                        <circle cx="130" cy="30" r="25" opacity="0.9" fill={getLeafColor(12)} />
                        <circle cx="170" cy="30" r="25" opacity="0.9" fill={getLeafColor(13)} />
                    </g>
                </g>

                {visibleFruitCount > 0 && (
                    <g>
                        {FRUIT_POSITIONS.slice(0, visibleFruitCount).map((pos, index) => (
                            <circle 
                                key={index}
                                cx={pos.cx} 
                                cy={pos.cy} 
                                r={pos.r} 
                                fill={getFruitColor(index)}
                            />
                        ))}
                    </g>
                )}
            </g>
        </svg>
    );
};

interface GroupedTrees {
    date: string;
    trees: GardenTree[];
}

const Garden: React.FC<Props> = ({ trees, tasbihs }) => {
  const [gridCols, setGridCols] = useState<number>(() => {
    const savedCols = localStorage.getItem('gardenGridCols');
    return savedCols ? parseInt(savedCols, 10) : 3;
  });

  useEffect(() => {
    localStorage.setItem('gardenGridCols', gridCols.toString());
  }, [gridCols]);

  const toggleGridLayout = () => {
    setGridCols(prev => {
      if (prev === 2) return 3;
      if (prev === 3) return 4;
      return 2; // Cycle from 4 back to 2
    });
  };

  const gridClassMap: { [key: number]: string } = {
      2: 'grid-cols-2 gap-3',
      3: 'grid-cols-3 gap-3',
      4: 'grid-cols-4 gap-2',
  };

  const liveTrees: GardenTree[] = tasbihs
      .filter(t => t.count >= 100)
      .map(t => ({
          id: `live_${t.id}`,
          tasbihName: t.name,
          date: new Date().toISOString(),
          count: t.count,
          isLive: true,
          type: 'tasbih'
      }));

  const allTrees = [...liveTrees, ...[...trees].reverse()];

  const groups: GroupedTrees[] = [];
  
  allTrees.forEach(tree => {
      let dateLabel = '';
      if (tree.isLive) {
          dateLabel = 'আজ';
      } else {
          dateLabel = new Date(tree.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
      }

      let group = groups.find(g => g.date === dateLabel);
      if (!group) {
          group = { date: dateLabel, trees: [] };
          groups.push(group);
      }
      group.trees.push(tree);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-night-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-night-800 p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">
            <Sprout size={20} className="text-islamic-600"/> আমলের বাগান
        </h2>
        <div className="flex items-center gap-2">
            <div className="bg-islamic-50 dark:bg-islamic-900/30 px-3 py-1.5 rounded-full border border-islamic-100 dark:border-islamic-800">
                <span className="text-xs font-bold text-islamic-700 dark:text-islamic-400">মোট গাছ: {allTrees.length}</span>
            </div>
            <button
                onClick={toggleGridLayout}
                className="bg-slate-100 dark:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 shadow-sm active:scale-95 transition-transform"
                aria-label={`Change grid layout to ${gridCols === 4 ? 2 : gridCols + 1} columns`}
            >
                <Filter size={16} />
            </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {allTrees.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-50 dark:from-emerald-900/20 dark:to-green-900/10 rounded-full flex items-center justify-center mb-6">
                    <TreeDeciduous size={48} className="text-emerald-500/50" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">বাগান এখনো খালি</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    যেকোনো তাসবীহ কমপক্ষে ১০০ বার পাঠ করলে অথবা একটি জার্নাল লিখলে তা এখানে গাছ হিসেবে যুক্ত হবে। আজ বেশি বেশি আমল করুন একটি সুন্দর বাগানের জন্য! 🌳
                </p>
            </div>
        ) : (
            groups.map((group) => (
                <div key={group.date}>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <CalendarDays size={16} className="text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">{group.date}</h3>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                        <span className="text-xs text-slate-400 font-mono">({group.trees.length})</span>
                    </div>

                    <div className={`grid ${gridClassMap[gridCols]}`}>
                        {group.trees.map((tree) => (
                            <div key={tree.id} className={`rounded-xl p-2 shadow-sm border flex flex-col items-center relative overflow-hidden group transition-all ${tree.type === 'journal' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800 ring-1 ring-emerald-200 dark:ring-emerald-700' : (tree.isLive ? 'bg-islamic-50/50 dark:bg-islamic-900/10 border-islamic-100 dark:border-islamic-800 ring-1 ring-islamic-200 dark:ring-islamic-700' : 'bg-white dark:bg-night-800 border-islamic-200 dark:border-islamic-900')}`}>
                                {/* Background Decoration */}
                                <div className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent pointer-events-none ${tree.type === 'journal' ? 'from-emerald-50 dark:from-emerald-900/10' : 'from-emerald-50 dark:from-emerald-900/10'}`}></div>
                                
                                {/* Tree Rendering */}
                                <div className="w-full h-24 flex items-end justify-center mb-1 z-10">
                                    <MiniTree count={tree.count} darkMode={document.documentElement.classList.contains('dark')} type={tree.type} />
                                </div>

                                {/* Info */}
                                <div className="text-center z-10 w-full px-1">
                                    <h4 className={`font-bold text-xs truncate ${tree.type === 'journal' ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-100'}`}>{tree.tasbihName}</h4>
                                    <div className={`mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${tree.type === 'journal' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : (tree.isLive ? 'bg-islamic-100 dark:bg-islamic-900 text-islamic-700 dark:text-islamic-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300')}`}>
                                        {tree.type === 'journal' ? 'জার্নাল' : `${tree.count}`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Garden;