import { create } from 'zustand';
import { AIScanResult } from '../types/scan.types';

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
    // รูปปัจจุบันที่กำลังจะสแกน
    currentImageUri: string | null;
    setCurrentImageUri: (uri: string | null) => void;

    // ผลลัพธ์จาก AI (เก็บไว้ส่งต่อจาก preview → result)
    lastScanResult: AIScanResult | null;
    lastScanId: string | null;
    lastScanImageUrl: string | null;
    setScanResult: (result: AIScanResult, scanId: string, imageUrl: string) => void;
    clearScanResult: () => void;

    // ประวัติการสแกน
    scanHistory: ScanHistoryItem[];
    setScanHistory: (history: ScanHistoryItem[]) => void;
    addScanToHistory: (scan: ScanHistoryItem) => void;
}

export const useStore = create<AppState>((set) => ({
    currentImageUri: null,
    setCurrentImageUri: (uri) => set({ currentImageUri: uri }),

    lastScanResult: null,
    lastScanId: null,
    lastScanImageUrl: null,
    setScanResult: (result, scanId, imageUrl) =>
        set({ lastScanResult: result, lastScanId: scanId, lastScanImageUrl: imageUrl }),
    clearScanResult: () =>
        set({ lastScanResult: null, lastScanId: null, lastScanImageUrl: null }),

    scanHistory: [],
    setScanHistory: (history) => set({ scanHistory: history }),
    addScanToHistory: (scan) =>
        set((state) => ({ scanHistory: [scan, ...state.scanHistory] })),
}));