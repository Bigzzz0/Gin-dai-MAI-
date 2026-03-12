import axios from 'axios';
import { supabase } from '../lib/supabase';
import { AIScanResult } from '../types/scan.types';
import NetInfo from '@react-native-community/netinfo';
import { OfflineCache } from './offlineCache';

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
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${process.env.EXPO_PUBLIC_LOCAL_IP}:3000/api/v1`;

// Network check utility
export const checkNetwork = async (): Promise<{ connected: boolean; type: string }> => {
  try {
    const state = await NetInfo.fetch();
    return {
      connected: state.isConnected ?? false,
      type: state.type || 'unknown',
    };
  } catch {
    return { connected: false, type: 'unknown' };
  }
};

// Network error class
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

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
     * @param imageUri - URI ของรูปภาพ
     * @param note - หมายเหตุเพิ่มเติม (optional)
     * @param latitude - ละติจูด (optional)
     * @param longitude - ลองจิจูด (optional)
     * @param offlineMode - ถ้า true จะบันทึก cache เมื่อออฟไลน์
     */
    analyzeImage: async (
        imageUri: string, 
        note?: string, 
        latitude?: number, 
        longitude?: number,
        offlineMode: boolean = true
    ): Promise<AnalyzeResponse | { cached: true; id: string }> => {
        // Check network connectivity first
        const network = await checkNetwork();
        
        if (!network.connected) {
            // Offline mode - save to cache
            if (offlineMode) {
                const tempId = `temp_${Date.now()}`;
                await OfflineCache.saveScan({
                    id: tempId,
                    imageUrl: '',
                    imageUri,
                    status: 'pending',
                });
                return { cached: true, id: tempId };
            }
            throw new NetworkError('ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาเปิด WiFi หรือข้อมูลมือถือ');
        }

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

        // Append optional location data
        if (latitude !== undefined && longitude !== undefined) {
            formData.append('latitude', latitude.toString());
            formData.append('longitude', longitude.toString());
        }

        // Native fetch is highly recommended for FormData in React Native
        const { data: { session } } = await supabase.auth.getSession();

        try {
            const response = await fetch(`${API_BASE_URL}/scans/analyze`, {
                method: 'POST',
                body: formData,
                headers: {
                    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                let errResult;
                try {
                    errResult = await response.json();
                } catch {
                    throw new Error('การเชื่อมต่อผิดพลาด กรุณาลองใหม่อีกครั้ง');
                }
                throw new Error(errResult?.error || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
            }

            return await response.json();
        } catch (error: any) {
            // If network error and offline mode enabled, save to cache
            if (offlineMode && (error.code === 'ECONNABORTED' || !network.connected)) {
                const tempId = `temp_${Date.now()}`;
                await OfflineCache.saveScan({
                    id: tempId,
                    imageUrl: '',
                    imageUri,
                    status: 'pending',
                });
                return { cached: true, id: tempId };
            }
            throw error;
        }
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

    /**
     * ดึงข้อมูลโปรไฟล์ผู้ใช้
     */
    getProfile: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    /**
     * อัปเดตโปรไฟล์ผู้ใช้
     */
    updateProfile: async (name?: string, avatarUrl?: string) => {
        const response = await apiClient.put('/auth/profile', { name, avatarUrl });
        return response.data;
    },

    /**
     * อัปโหลดรูปโปรไฟล์ไปยัง Supabase Storage
     */
    uploadAvatar: async (uri: string, userId: string) => {
        const formData = new FormData();
        const filename = `avatar_${Date.now()}.jpg`;
        
        formData.append('file', {
            uri,
            name: filename,
            type: 'image/jpeg',
        } as any);

        const { data: { session } } = await supabase.auth.getSession();
        
        // Upload directly to Supabase Storage
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(`${userId}/${filename}`, formData as any, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${userId}/${filename}`);

        return publicUrl;
    },
};