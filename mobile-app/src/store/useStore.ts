import { create } from 'zustand';

export interface ScanHistoryItem {
    id: string;
    imageUrl: string;
    safetyLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
    foodType: string;
    confidence: number;
    analysisDetail: string;
    createdAt: string;
}

interface AppState {
    currentImageUri: string | null;
    setCurrentImageUri: (uri: string | null) => void;
    scanHistory: ScanHistoryItem[];
    setScanHistory: (history: ScanHistoryItem[]) => void;
    addScanToHistory: (scan: ScanHistoryItem) => void;
}

export const useStore = create<AppState>((set) => ({
    currentImageUri: null,
    setCurrentImageUri: (uri) => set({ currentImageUri: uri }),
    scanHistory: [],
    setScanHistory: (history) => set({ scanHistory: history }),
    addScanToHistory: (scan) =>
        set((state) => ({ scanHistory: [scan, ...state.scanHistory] })),
}));
