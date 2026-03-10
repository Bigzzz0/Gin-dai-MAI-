import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { apiService } from '../src/services/api';
import { useState } from 'react';

// ข้อความแสดงระหว่างรอ AI วิเคราะห์ (สุ่มแสดง เพิ่มความรู้สึกมีชีวิตชีวา)
const LOADING_MESSAGES = [
    'กำลังส่งรูปไปให้ AI วิเคราะห์...',
    'AI กำลังตรวจสอบความปลอดภัย...',
    'กำลังค้นหาสัญญาณอันตราย...',
    'ประมวลผลด้วย Gemini Vision...',
    'เกือบเสร็จแล้ว รอแป๊บนึง...',
];

export default function PreviewScreen() {
    const router = useRouter();
    const { currentImageUri, setScanResult, addScanToHistory } = useStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

    const handleAnalyze = async () => {
        if (!currentImageUri) {
            Alert.alert('ข้อผิดพลาด', 'ไม่พบรูปภาพ กรุณาถ่ายรูปใหม่');
            return;
        }

        setIsAnalyzing(true);

        // หมุนข้อความ loading ทุก 3 วินาที
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
            setLoadingMsg(LOADING_MESSAGES[msgIndex]);
        }, 3000);

        try {
            const response = await apiService.analyzeImage(currentImageUri);

            // บันทึกผลลัพธ์ลง Store เพื่อส่งต่อไปหน้า Result
            setScanResult(response.result, response.scanId, response.imageUrl);

            // เพิ่มลงประวัติ
            addScanToHistory({
                id: response.scanId,
                imageUrl: response.imageUrl,
                safetyLevel: response.result.safetyLevel,
                foodType: response.result.foodType,
                confidence: response.result.confidence,
                analysisDetail: response.result.analysisDetail,
                createdAt: new Date().toISOString(),
            });

            router.push('/result');

        } catch (error: any) {
            Alert.alert(
                'วิเคราะห์ไม่สำเร็จ',
                error.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
                [{ text: 'ตกลง' }]
            );
        } finally {
            clearInterval(msgInterval);
            setIsAnalyzing(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* รูปภาพที่จะวิเคราะห์ */}
            {currentImageUri ? (
                <Image source={{ uri: currentImageUri }} style={styles.imagePreview} />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>📷 ไม่มีรูปภาพที่จะแสดงผล</Text>
                </View>
            )}

            {/* Loading State */}
            {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>{loadingMsg}</Text>
                    <Text style={styles.loadingSubText}>อาจใช้เวลาสักครู่ขึ้นอยู่กับการเชื่อมต่อ</Text>
                </View>
            ) : (
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={styles.buttonCancel}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.buttonTextDark}>🔄 ถ่ายใหม่</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buttonPrimary}
                        onPress={handleAnalyze}
                    >
                        <Text style={styles.buttonTextLight}>🔍 สแกนเลย!</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imagePreview: {
        flex: 1,
        resizeMode: 'contain',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    placeholderText: {
        color: '#666',
        fontSize: 16,
    },
    loadingContainer: {
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
        gap: 10,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    loadingSubText: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
    buttonsContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: '#fff',
    },
    buttonCancel: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonPrimary: {
        flex: 1,
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonTextDark: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonTextLight: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
