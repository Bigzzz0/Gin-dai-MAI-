import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    Info,
    Lightbulb,
    MapPin,
    Calendar,
    Clock,
} from 'lucide-react-native';
import { useStore } from '../src/store/useStore';
import { SAFETY_CONFIG } from '../src/types/scan.types';

interface BoundingBox {
    label: string;
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
}

interface AnomalyItem {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    boundingBox?: BoundingBox;
}

export default function AnomalyDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { scanHistory } = useStore();

    // Find the scan from history or use params
    const scan = scanHistory.find((item) => item.id === params.id);

    if (!scan) {
        return (
            <View style={styles.mainContainer}>
                <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
                <View style={styles.container}>
                    <Text style={styles.errorText}>ไม่พบข้อมูลการสแกน</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>กลับ</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const config = SAFETY_CONFIG[scan.safetyLevel];
    const confidencePercent = Math.round(scan.confidence * 100);

    // Parse anomalies from analysis detail
    const parseAnomalies = (): AnomalyItem[] => {
        const anomalies: AnomalyItem[] = [];
        const detail = scan.analysisDetail.toLowerCase();

        // Check for common anomaly types
        if (detail.includes('พยาธิ') || detail.includes('เม็ดสาคู')) {
            anomalies.push({
                type: 'พยาธิ',
                severity: 'HIGH',
                description: 'ตรวจพบสิ่งผิดปกติคล้ายไข่พยาธิหรือเม็ดสาคูในเนื้อสัตว์',
                boundingBox: scan.boundingBoxes?.[0],
            });
        }
        if (detail.includes('เชื้อรา') || detail.includes('รา')) {
            anomalies.push({
                type: 'เชื้อรา',
                severity: 'MEDIUM',
                description: 'ตรวจพบเชื้อราบนพื้นผิวของวัตถุดิบ',
                boundingBox: scan.boundingBoxes?.[0],
            });
        }
        if (detail.includes('เน่า') || detail.includes('เสีย')) {
            anomalies.push({
                type: 'การเน่าเสีย',
                severity: 'HIGH',
                description: 'ตรวจพบสัญญาณของการเน่าเสีย',
                boundingBox: scan.boundingBoxes?.[0],
            });
        }
        if (detail.includes('บลูริง') || detail.includes('วงแหวน')) {
            anomalies.push({
                type: 'หมึกบลูริง',
                severity: 'HIGH',
                description: 'ตรวจพบลวดลายวงแหวนสีน้ำเงิน characteristic ของหมึกบลูริงที่มีพิษร้ายแรง',
                boundingBox: scan.boundingBoxes?.[0],
            });
        }
        if (detail.includes('ฝีหนอง') || detail.includes('หนอง')) {
            anomalies.push({
                type: 'ฝีหนอง',
                severity: 'HIGH',
                description: 'ตรวจพบฝีหนองหรือถุงน้ำในเนื้อสัตว์',
                boundingBox: scan.boundingBoxes?.[0],
            });
        }

        // If no specific anomalies found, create a general one
        if (anomalies.length === 0) {
            anomalies.push({
                type: scan.safetyLevel === 'SAFE' ? 'ไม่พบความผิดปกติ' : 'ความผิดปกติทั่วไป',
                severity: scan.safetyLevel === 'SAFE' ? 'LOW' : 'MEDIUM',
                description: scan.analysisDetail,
            });
        }

        return anomalies;
    };

    const anomalies = parseAnomalies();

    const getSeverityIcon = (severity: string) => {
        if (severity === 'HIGH') return <AlertTriangle color="#ef4444" size={24} />;
        if (severity === 'MEDIUM') return <AlertCircle color="#f59e0b" size={24} />;
        return <CheckCircle2 color="#10b981" size={24} />;
    };

    const getSeverityColor = (severity: string) => {
        if (severity === 'HIGH') return '#ef4444';
        if (severity === 'MEDIUM') return '#f59e0b';
        return '#10b981';
    };

    const getSeverityLabel = (severity: string) => {
        if (severity === 'HIGH') return 'รุนแรง';
        if (severity === 'MEDIUM') return 'ปานกลาง';
        return 'ต่ำ';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRecommendations = () => {
        if (scan.safetyLevel === 'SAFE') {
            return [
                'สามารถนำไปปรุงอาหารได้ตามปกติ',
                'ควรปรุงสุกก่อนรับประทานเพื่อความปลอดภัยสูงสุด',
                'เก็บรักษาในอุณหภูมิที่เหมาะสม',
            ];
        }
        if (scan.safetyLevel === 'SUSPICIOUS') {
            return [
                'ควรตัดส่วนที่ผิดปกติออกก่อนปรุงอาหาร',
                'ปรุงให้สุก 100% ก่อนรับประทาน',
                'หากมีกลิ่นผิดปกติไม่ควรรับประทาน',
            ];
        }
        return [
            'ห้ามรับประทานเด็ดขาด!',
            'ทิ้งทันทีในถังขยะที่ปิดมิดชิด',
            'ล้างมือให้สะอาดหลังสัมผัส',
            'หากเผลอรับประทานและมีอาการผิดปกติ ให้รีบพบแพทย์',
        ];
    };

    return (
        <View style={styles.mainContainer}>
            <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color="#0f172a" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>รายละเอียดความผิดปกติ</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Risk Level Card */}
                <View style={[styles.riskCard, { backgroundColor: config.bgColor }]}>
                    <View style={styles.riskHeader}>
                        <View style={[styles.riskIconContainer, { backgroundColor: config.color + '20' }]}>
                            {scan.safetyLevel === 'SAFE' && <CheckCircle2 color={config.color} size={32} />}
                            {scan.safetyLevel === 'SUSPICIOUS' && <AlertCircle color={config.color} size={32} />}
                            {scan.safetyLevel === 'DANGEROUS' && <AlertTriangle color={config.color} size={32} />}
                        </View>
                        <View style={styles.riskInfo}>
                            <Text style={[styles.riskLabel, { color: config.color }]}>
                                {config.label}
                            </Text>
                            <Text style={styles.confidenceText}>{confidencePercent}% ความมั่นใจ</Text>
                        </View>
                    </View>
                </View>

                {/* Food Image */}
                {scan.imageUrl && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: scan.imageUrl }} style={styles.foodImage} resizeMode="cover" />
                    </View>
                )}

                {/* Food Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ข้อมูลวัตถุดิบ</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>ประเภท:</Text>
                            <Text style={styles.infoValue}>{scan.foodType}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>วันที่สแกน:</Text>
                            <Text style={styles.infoValue}>{formatDate(scan.createdAt)}</Text>
                        </View>
                        {(scan.latitude && scan.longitude) && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>ตำแหน่ง:</Text>
                                <View style={styles.locationBadge}>
                                    <MapPin color="#10b981" size={14} />
                                    <Text style={styles.locationText}>
                                        {scan.latitude.toFixed(4)}, {scan.longitude.toFixed(4)}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Anomalies Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ความผิดปกติที่ตรวจพบ</Text>
                    {anomalies.map((anomaly, index) => (
                        <View key={index} style={styles.anomalyCard}>
                            <View style={styles.anomalyHeader}>
                                <View style={styles.anomalyIconContainer}>
                                    {getSeverityIcon(anomaly.severity)}
                                </View>
                                <View style={styles.anomalyInfo}>
                                    <Text style={styles.anomalyType}>{anomaly.type}</Text>
                                    <View style={styles.severityBadge}>
                                        <View
                                            style={[
                                                styles.severityDot,
                                                { backgroundColor: getSeverityColor(anomaly.severity) },
                                            ]}
                                        />
                                        <Text style={styles.severityText}>
                                            {getSeverityLabel(anomaly.severity)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
                            {anomaly.boundingBox && (
                                <View style={styles.boundingBoxInfo}>
                                    <Info color="#64748b" size={16} />
                                    <Text style={styles.boundingBoxText}>
                                        พิกัด: ({anomaly.boundingBox.x_min}, {anomaly.boundingBox.y_min}) - (
                                        {anomaly.boundingBox.x_max}, {anomaly.boundingBox.y_max})
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Analysis Detail */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>รายละเอียดการวิเคราะห์</Text>
                    <View style={styles.detailCard}>
                        <Text style={styles.detailText}>{scan.analysisDetail}</Text>
                    </View>
                </View>

                {/* Recommendations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>คำแนะนำ</Text>
                    <View style={styles.recommendationCard}>
                        <View style={styles.recommendationIcon}>
                            <Lightbulb color="#f59e0b" size={24} />
                        </View>
                        <View style={styles.recommendations}>
                            {getRecommendations().map((rec, index) => (
                                <View key={index} style={styles.recommendationItem}>
                                    <View style={styles.recommendationBullet} />
                                    <Text style={styles.recommendationText}>{rec}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimerContainer}>
                    <ShieldAlertIcon color="#94a3b8" size={20} />
                    <Text style={styles.disclaimerTitle}>ข้อความปฏิเสธความรับผิดชอบ</Text>
                    <Text style={styles.disclaimerText}>
                        ผลลัพธ์จาก AI เป็นเพียงการคัดกรองความเสี่ยงเบื้องต้น ไม่สามารถทดแทนการตรวจสอบทางห้องปฏิบัติการ
                        หรือการวินิจฉัยโดยผู้เชี่ยวชาญได้
                    </Text>
                </View>

                {/* Bottom Padding */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function ShieldAlertIcon({ color, size }: { color: string; size: number }) {
    return (
        <View style={[styles.shieldIcon, { backgroundColor: color + '20' }]}>
            <AlertTriangle color={color} size={size} />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: '#f8fafc',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 20,
        color: '#0f172a',
    },
    errorText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 40,
    },

    // Risk Card
    riskCard: {
        margin: 20,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
    },
    riskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    riskIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    riskInfo: {
        marginLeft: 16,
        flex: 1,
    },
    riskLabel: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 24,
    },
    confidenceText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },

    // Image
    imageContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    foodImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        backgroundColor: '#e2e8f0',
    },

    // Sections
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 18,
        color: '#0f172a',
        marginBottom: 12,
    },

    // Info Card
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    infoLabel: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#64748b',
    },
    infoValue: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#0f172a',
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    locationText: {
        fontFamily: 'Kanit_500Medium',
        fontSize: 12,
        color: '#10b981',
    },

    // Anomaly Cards
    anomalyCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    anomalyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    anomalyIconContainer: {
        marginRight: 12,
    },
    anomalyInfo: {
        flex: 1,
    },
    anomalyType: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 18,
        color: '#0f172a',
        marginBottom: 4,
    },
    severityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        gap: 6,
    },
    severityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    severityText: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 12,
        color: '#64748b',
    },
    anomalyDescription: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    boundingBoxInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 8,
    },
    boundingBoxText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 12,
        color: '#94a3b8',
    },

    // Detail Card
    detailCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    detailText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },

    // Recommendation Card
    recommendationCard: {
        backgroundColor: '#fffbeb',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fde68a',
        flexDirection: 'row',
        gap: 12,
    },
    recommendationIcon: {
        paddingTop: 2,
    },
    recommendations: {
        flex: 1,
    },
    recommendationItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    recommendationBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#f59e0b',
        marginTop: 8,
        marginRight: 10,
    },
    recommendationText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#92400e',
        lineHeight: 22,
        flex: 1,
    },

    // Disclaimer
    disclaimerContainer: {
        margin: 20,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    shieldIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    disclaimerTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 16,
        color: '#475569',
        marginBottom: 8,
    },
    disclaimerText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 13,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
    },
});
