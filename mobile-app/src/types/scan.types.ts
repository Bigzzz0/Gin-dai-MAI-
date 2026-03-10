// ─── AI Result Type (ตรงกับ Backend ai.service.ts) ────────────────────────

export interface BoundingBox {
    label: string;
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
}

export interface AIScanResult {
    isFood: boolean;
    foodType: string;
    safetyLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
    confidence: number;
    analysisDetail: string;
    boundingBoxes: BoundingBox[];
}

// ─── Safety Level Helpers ─────────────────────────────────────────────────

export const SAFETY_CONFIG = {
    SAFE: {
        color: '#22c55e',
        bgColor: '#f0fdf4',
        label: 'ปลอดภัย',
    },
    SUSPICIOUS: {
        color: '#f59e0b',
        bgColor: '#fffbeb',
        label: 'น่าสงสัย',
    },
    DANGEROUS: {
        color: '#ef4444',
        bgColor: '#fef2f2',
        label: 'อันตราย',
    },
} as const;