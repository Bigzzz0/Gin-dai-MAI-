import axios from 'axios';
import { supabase } from '../lib/supabase';
import { AIScanResult } from '../types/scan.types';

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️  CONFIG — เปลี่ยน LOCAL_IP ให้ตรงกับเครื่องคอมพิวเตอร์ของคุณ
//
//  วิธีหา IP:
//    Windows → เปิด PowerShell แล้วพิมพ์ `ipconfig`
//              ดูบรรทัด "IPv4 Address" ใต้ Wi-Fi Adapter
//    Mac/Linux → พิมพ์ `ifconfig` หรือ `ip addr`
//
//  ตัวอย่าง: 192.168.1.42
// ─────────────────────────────────────────────────────────────────────────────
const LOCAL_IP = '192.168.1.2'; // ← เปลี่ยนตรงนี้!
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${LOCAL_IP}:3000/api/v1`;

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000, // 60 วินาที — Gemini อาจใช้เวลานานถ้า Cold Start
});

// Add a request interceptor to attach the Supabase JWT token
apiClient.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ─── Response Interceptor: จัดการ Error เป็นภาษาไทย ─────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง'));
        }
        if (!error.response) {
            return Promise.reject(
                new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้\nกรุณาตรวจสอบว่า Backend รันอยู่และอยู่ WiFi เดียวกัน')
            );
        }
        const message = error.response?.data?.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่';
        return Promise.reject(new Error(message));
    }
);

// ─── Response Types ───────────────────────────────────────────────────────

export interface AnalyzeResponse {
    success: boolean;
    scanId: string;
    imageUrl: string;
    result: AIScanResult;
}

export interface HistoryItem {
    id: string;
    imageUrl: string;
    foodType: string;
    safetyLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
    aiConfidence: number;
    createdAt: string;
}

export interface HistoryResponse {
    data: HistoryItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─── API Service ──────────────────────────────────────────────────────────

export const apiService = {
    /**
     * ซิงค์ผู้ใช้กับ Backend
     */
    syncUser: async () => {
        const response = await apiClient.post('/auth/sync');
        return response.data;
    },

    /**
     * ส่งรูปภาพไปให้ Backend วิเคราะห์ด้วย Gemini AI
     */
    analyzeImage: async (imageUri: string, note?: string): Promise<AnalyzeResponse> => {
        const formData = new FormData();
        const filename = imageUri.split('/').pop() ?? 'photo.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

        formData.append('file', {
            uri: imageUri,
            name: filename,
            type: mimeType,
        } as any);

        // Append optional user note as a separate form field
        if (note?.trim()) {
            formData.append('note', note.trim());
        }

        const response = await apiClient.post<AnalyzeResponse>(
            '/scans/analyze',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    /**
     * ดึงประวัติการสแกน (paginated)
     */
    getHistory: async (page = 1, limit = 20): Promise<HistoryResponse> => {
        const response = await apiClient.get<HistoryResponse>('/history', {
            params: { page, limit },
        });
        return response.data;
    },

    /**
     * ดูรายละเอียดการสแกนอันใดอันหนึ่ง
     */
    getScanDetail: async (scanId: string) => {
        const response = await apiClient.get(`/history/${scanId}`);
        return response.data;
    },

    /**
     * ลบประวัติการสแกน
     */
    deleteScan: async (scanId: string) => {
        const response = await apiClient.delete(`/history/${scanId}`);
        return response.data;
    },

    /**
     * ส่ง Feedback กรณี AI วิเคราะห์ผิดพลาด
     */
    submitFeedback: async (
        scanId: string,
        issueType: 'WRONG_FOOD_TYPE' | 'WRONG_SAFETY_LEVEL' | 'NOT_FOOD' | 'OTHER',
        comment?: string
    ) => {
        const response = await apiClient.post(`/scans/${scanId}/feedback`, {
            issueType,
            comment: comment?.trim() || undefined,
        });
        return response.data;
    },
};