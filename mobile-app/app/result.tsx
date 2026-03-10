import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, ScrollView, Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { SAFETY_CONFIG } from '../src/types/scan.types';

export default function ResultScreen() {
    const router = useRouter();
    const { lastScanResult, lastScanImageUrl, clearScanResult } = useStore();

    // ถ้าไม่มีผลลัพธ์ (เช่น เปิดหน้านี้ตรงๆ โดยไม่ผ่าน preview)
    if (!lastScanResult) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>ไม่พบผลการวิเคราะห์</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.navigate('/')}>
                    <Text style={styles.backButtonText}>กลับหน้าแรก</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const config = SAFETY_CONFIG[lastScanResult.safetyLevel];
    const confidencePercent = Math.round(lastScanResult.confidence * 100);

    const handleDone = () => {
        clearScanResult();
        router.navigate('/');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🍽️ ผลการตรวจสอบอาหาร "กินได้ไหม!"\n\n` +
                    `วัตถุดิบ: ${lastScanResult.foodType}\n` +
                    `ผล: ${config.label}\n` +
                    `ความมั่นใจ: ${confidencePercent}%\n\n` +
                    `รายละเอียด: ${lastScanResult.analysisDetail}`,
            });
        } catch {}
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header แสดงสีตามความปลอดภัย */}
            <View style={[styles.header, { backgroundColor: config.color }]}>
                <Text style={styles.headerEmoji}>{config.emoji}</Text>
                <Text style={styles.headerLabel}>{config.label}</Text>
                <Text style={styles.headerFoodType}>{lastScanResult.foodType}</Text>
            </View>

            {/* รูปภาพที่สแกน */}
            {lastScanImageUrl && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: lastScanImageUrl }}
                        style={styles.scannedImage}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Confidence Score */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>ความมั่นใจของ AI</Text>
                <View style={styles.confidenceBar}>
                    <View
                        style={[
                            styles.confidenceFill,
                            {
                                width: `${confidencePercent}%` as any,
                                backgroundColor: config.color,
                            }
                        ]}
                    />
                </View>
                <Text style={[styles.confidenceText, { color: config.color }]}>
                    {confidencePercent}%
                </Text>
            </View>

            {/* รายละเอียดการวิเคราะห์ */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>รายละเอียดการวิเคราะห์</Text>
                <Text style={styles.analysisText}>{lastScanResult.analysisDetail}</Text>
            </View>

            {/* Bounding Boxes (ถ้ามี) */}
            {lastScanResult.boundingBoxes && lastScanResult.boundingBoxes.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>สิ่งที่ตรวจพบ</Text>
                    {lastScanResult.boundingBoxes.map((box, index) => (
                        <View key={index} style={styles.boundingBoxItem}>
                            <View style={[styles.dot, { backgroundColor: config.color }]} />
                            <Text style={styles.boundingBoxLabel}>{box.label}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* คำเตือนพิเศษสำหรับ DANGEROUS */}
            {lastScanResult.safetyLevel === 'DANGEROUS' && (
                <View style={styles.warningCard}>
                    <Text style={styles.warningTitle}>คำเตือน</Text>
                    <Text style={styles.warningText}>
                        ห้ามรับประทานวัตถุดิบนี้! กรุณาทิ้งหรือแยกออกจากวัตถุดิบอื่นทันที
                    </Text>
                </View>
            )}

            {/* ปุ่มด้านล่าง */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Text style={styles.shareButtonText}>📤 แชร์</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                    <Text style={styles.doneButtonText}>เสร็จสิ้น</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 24,
    },
    errorEmoji: { fontSize: 48 },
    errorText: { fontSize: 18, color: '#666' },
    backButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Header
    header: {
        paddingVertical: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
        gap: 8,
    },
    headerEmoji: { fontSize: 48 },
    headerLabel: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerFoodType: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },

    // Image
    imageContainer: {
        marginHorizontal: 20,
        marginTop: -20,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    scannedImage: {
        width: '100%',
        height: 200,
    },

    // Cards
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 16,
        padding: 20,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    analysisText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 24,
    },

    // Confidence
    confidenceBar: {
        height: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 6,
    },
    confidenceFill: {
        height: '100%',
        borderRadius: 5,
    },
    confidenceText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'right',
    },

    // Bounding Boxes
    boundingBoxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    boundingBoxLabel: {
        fontSize: 15,
        color: '#444',
    },

    // Warning
    warningCard: {
        backgroundColor: '#fff3cd',
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 6,
    },
    warningText: {
        fontSize: 14,
        color: '#856404',
        lineHeight: 22,
    },

    // Buttons
    buttonRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    shareButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    shareButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    doneButton: {
        flex: 2,
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
});
