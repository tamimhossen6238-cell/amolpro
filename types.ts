

export interface Tasbih {
    id: string;
    name: string;
    arabicText?: string;
    banglaPronunciation?: string; // Bangla Uccharon
    banglaTranslation?: string; // Bangla Ortho
    schedule: 'everyday' | string[]; // 'everyday' or array of days ['Sat', 'Sun']
    count: number; // Today's count
    totalCount: number;
    manualNeki?: number; // Optional manual override
    todayTime?: number; // Time spent today in seconds
}

export interface TargetAmol {
    id: string;
    name: string;
    description: string;
    neki: number;
    completed: boolean;
    arabicText?: string; 
    banglaPronunciation?: string; // New field for Uccharon
    banglaTranslation?: string; // New field for Ortho
}

export interface JournalEntry {
    id: string;
    date: string;
    text: string;
    timestamp: number;
}

export interface DailyHistory {
    date: string;       // YYYY-MM-DD
    totalTime: number;  // Seconds
    totalNeki: number;
    tasbihCounts?: Record<string, number>; // Key: TasbihID, Value: Count
}

export interface GardenTree {
    id: string;
    tasbihName: string;
    date: string;
    count: number; // Snapshot of totalCount to render the tree exactly as it was
    isLive?: boolean; // To distinguish today's active trees
    type?: 'tasbih' | 'journal'; // New field to identify tree type
}

export interface Stats {
    totalNeki: number;
    totalXP: number;
    level: number;
    streak: number;
    lastActiveDate: string;
    todayNeki: number;
    todayJournalCount: number;
    lastHadithDate: string; // To ensure one hadith per day
    shownHadithIndices: number[]; // To track history and prevent repeats
    lastWeeklyReportDate?: string; // Track last weekly report generation
    lastMonthlyReportDate?: string; // Track last monthly report generation
    todayActivityPerformed?: boolean;
}

export interface InboxMessage {
    id: string;
    title: string;
    body: string;
    date: string;
    read: boolean;
    type: 'report' | 'reminder' | 'info' | 'weekly_report' | 'claim';
    claimAmount?: number;
    targetName?: string;
}

export enum View {
    HOME = 'HOME',
    TASBIH_LIST = 'TASBIH_LIST',
    FOCUS_MODE = 'FOCUS_MODE',
    GENERAL_TASBIH = 'GENERAL_TASBIH',
    TARGET_LIST = 'TARGET_LIST',
    JOURNAL = 'JOURNAL',
    GARDEN = 'GARDEN',
    ANALYSIS = 'ANALYSIS',
    INBOX = 'INBOX'
}

export interface AppState {
    view: View;
    activeTasbihId: string | null;
}