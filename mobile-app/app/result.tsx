import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, ScrollView, Share, Platform,
    Modal, TextInput, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { apiService } from '../src/services/api';
import { SAFETY_CONFIG } from '../src/types/scan.types';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Check, AlertTriangle, ShieldCheck, ShieldAlert, ShieldQuestion, Info, ScanSearch, Flag, X } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useEffect, useState, useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const getHeaderIcon = (level: string) => {
    if (level === 'SAFE') return <ShieldCheck color="#ffffff" size={64} style={styles.headerIconShadow} />;
    if (level === 'SUSPICIOUS') return <ShieldQuestion color="#ffffff" size={64} style={styles.headerIconShadow} />;
    return <ShieldAlert color="#ffffff" size={64} style={styles.headerIconShadow} />;
};

type IssueType = 'WRONG_FOOD_TYPE' | 'WRONG_SAFETY_LEVEL' | 'NOT_FOOD' | 'OTHER';

const ISSUE_OPTIONS: { type: IssueType; label: string }[] = [
    { type: 'WRONG_FOOD_TYPE', label: 'ชนิดอาหารผิด' },
    { type: 'WRONG_SAFETY_LEVEL', label: 'ระดับความปลอดภัยผิด' },
    { type: 'NOT_FOOD', label: 'ไม่ใช่อาหาร' },
    { type: 'OTHER', label: 'อื่นๆ' },
];

export default function ResultScreen() {
    const router = useRouter();
    const { lastScanResult, lastScanImageUrl, lastScanId, clearScanResult } = useStore();
    const viewShotRef = useRef<ViewShot>(null);

    const animatedWidth = useSharedValue(0);

    // Feedback modal state
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackDone, setFeedbackDone] = useState(false);

    useEffect(() => {
        if (lastScanResult) {
            animatedWidth.value = withSpring(Math.round(lastScanResult.confidence * 100), { damping: 15, stiffness: 90 });
        }
    }, [lastScanResult, animatedWidth]);

    const barStyle = useAnimatedStyle(() => {
        return {
            width: `${animatedWidth.value}%`,
        };
    });

    if (!lastScanResult) {
        return (
            <View style={styles.errorContainer}>
                <AlertTriangle color="#ef4444" size={48} style={{ marginBottom: 16 }} />
                <Text style={styles.errorText}>ไม่พบผลการวิเคราะห์</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.navigate('/')}>
                    <Text style={styles.backButtonText}>กลับสู่หน้าหลัก</Text>
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
            if (viewShotRef.current && viewShotRef.current.capture) {
                const uri = await viewShotRef.current.capture();
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                    await Sharing.shareAsync(uri, {
                        dialogTitle: 'ผลการวิเคราะห์จาก Gin dai MAI!',
                        mimeType: 'image/jpeg',
                    });
                } else {
                    Alert.alert('ขออภัย', 'ไม่สามารถแชร์รูปภาพในอุปกรณ์นี้ได้');
                }
            }
        } catch (err) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถแชร์ผลลัพธ์ได้');
        }
    };

    const handleOpenFeedback = () => {
        setSelectedIssue(null);
        setFeedbackComment('');
        setFeedbackDone(false);
        setFeedbackVisible(true);
    };

    const handleSubmitFeedback = async () => {
        if (!selectedIssue) {
            Alert.alert('กรุณาเลือก', 'กรุณาเลือกประเภทความผิดพลาดก่อนส่ง');
            return;
        }
        if (!lastScanId) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลการสแกน');
            return;
        }

        setIsSubmittingFeedback(true);
        try {
            await apiService.submitFeedback(lastScanId, selectedIssue, feedbackComment || undefined);
            setFeedbackDone(true);
        } catch (err: any) {
            Alert.alert('เกิดข้อผิดพลาด', err.message ?? 'ไม่สามารถส่ง feedback ได้ กรุณาลองใหม่');
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <LinearGradient
                colors={[config.color, config.color + 'cc']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {getHeaderIcon(lastScanResult.safetyLevel)}
                <Text style={styles.headerLabel}>{config.label}</Text>
                <Text style={styles.headerFoodType}>{lastScanResult.foodType}</Text>
            </LinearGradient>

            {/* Image Container */}
            {lastScanImageUrl && (
                <View style={styles.imageWrapper}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: lastScanImageUrl }}
                            style={styles.scannedImage}
                            resizeMode="cover"
                        />
                        {lastScanResult?.boundingBoxes?.map((box, index) => {
                            // Gemini returns coordinates in [0, 1000] range
                            const top = `${(box.y_min / 1000) * 100}%` as any;
                            const left = `${(box.x_min / 1000) * 100}%` as any;
                            const height = `${((box.y_max - box.y_min) / 1000) * 100}%` as any;
                            const width = `${((box.x_max - box.x_min) / 1000) * 100}%` as any;

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.boundingBoxOverlay,
                                        {
                                            top,
                                            left,
                                            width,
                                            height,
                                            borderColor: config.color,
                                        }
                                    ]}
                                >
                                    <View style={[styles.boundingBoxLabelContainer, { backgroundColor: config.color }]}>
                                        <Text style={styles.boundingBoxOverlayLabel}>{box.label}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            <View style={styles.contentPadding}>
                {/* Confidence Card */}
                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ShieldCheck color="#64748b" size={20} />
                        <Text style={styles.cardTitle}>ความมั่นใจของ AI</Text>
                    </View>
                    <View style={styles.confidenceBarContainer}>
                        <View style={styles.confidenceBar}>
                            <Animated.View
                                style={[
                                    styles.confidenceFill,
                                    barStyle,
                                    { backgroundColor: config.color }
                                ]}
                            />
                        </View>
                        <Text style={[styles.confidenceText, { color: config.color }]}>
                            {confidencePercent}%
                        </Text>
                    </View>
                </Animated.View>

                {/* Analysis Details */}
                <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Info color="#64748b" size={20} />
                        <Text style={styles.cardTitle}>รายละเอียดการวิเคราะห์</Text>
                    </View>
                    <Text style={styles.analysisText}>{lastScanResult.analysisDetail}</Text>
                </Animated.View>

                {/* Bounding Boxes */}
                {lastScanResult.boundingBoxes && lastScanResult.boundingBoxes.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <ScanSearch color="#64748b" size={20} />
                            <Text style={styles.cardTitle}>รายการที่ตรวจพบ</Text>
                        </View>
                        {lastScanResult.boundingBoxes.map((box, index) => (
                            <View key={index} style={styles.boundingBoxItem}>
                                <View style={[styles.dot, { backgroundColor: config.color }]} />
                                <Text style={styles.boundingBoxLabel}>{box.label}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Warning for DANGEROUS */}
                {lastScanResult.safetyLevel === 'DANGEROUS' && (
                    <View style={styles.warningCard}>
                        <View style={styles.cardHeader}>
                            <AlertTriangle color="#b45309" size={20} />
                            <Text style={styles.warningTitle}>คำเตือน</Text>
                        </View>
                        <Text style={styles.warningText}>
                            ห้ามรับประทานส่วนผสมนี้ โปรดทิ้งหรือแยกออกจากอาหารอื่นทันที
                        </Text>
                    </View>
                )}
            </View>
            </ViewShot>

            <View style={styles.contentPadding}>
                {/* Bottom Actions */}
                <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                        activeOpacity={0.7}
                    >
                        <Share2 color="#3b82f6" size={20} />
                        <Text style={styles.shareButtonText}>แชร์</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={handleOpenFeedback}
                        activeOpacity={0.7}
                    >
                        <Flag color="#ef4444" size={18} />
                        <Text style={styles.reportButtonText}>รายงาน</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.doneButton}
                        onPress={handleDone}
                        activeOpacity={0.8}
                    >
                        <Check color="#fff" size={20} />
                        <Text style={styles.doneButtonText}>เสร็จสิ้น</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View style={{ height: 40 }} />

            {/* Feedback Modal */}
            <Modal
                visible={feedbackVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setFeedbackVisible(false)}
            >
                <View style={styles.feedbackOverlay}>
                    <View style={styles.feedbackContainer}>
                        <View style={styles.modalHandle} />

                        {feedbackDone ? (
                            /* Success state */
                            <View style={styles.feedbackSuccess}>
                                <Check color="#10b981" size={48} />
                                <Text style={styles.feedbackSuccessTitle}>ขอบคุณสำหรับ Feedback!</Text>
                                <Text style={styles.feedbackSuccessSubtitle}>
                                    รายงานของคุณจะถูกนำไปปรับปรุง AI ในอนาคต
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeFeedbackButton}
                                    onPress={() => setFeedbackVisible(false)}
                                >
                                    <Text style={styles.closeFeedbackButtonText}>ปิด</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {/* Header */}
                                <View style={styles.feedbackHeader}>
                                    <Flag color="#ef4444" size={20} />
                                    <Text style={styles.feedbackTitle}>ผลลัพธ์ไม่ถูกต้อง?</Text>
                                    <TouchableOpacity onPress={() => setFeedbackVisible(false)}>
                                        <X color="#94a3b8" size={22} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.feedbackSubtitle}>
                                    เลือกประเภทความผิดพลาดที่พบ เพื่อช่วยปรับปรุง AI
                                </Text>

                                {/* Issue Type Selection */}
                                <View style={styles.issueGrid}>
                                    {ISSUE_OPTIONS.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.type}
                                            style={[
                                                styles.issuePill,
                                                selectedIssue === opt.type && styles.issuePillSelected,
                                            ]}
                                            onPress={() => setSelectedIssue(opt.type)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.issuePillText,
                                                selectedIssue === opt.type && styles.issuePillTextSelected,
                                            ]}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Optional comment */}
                                <TextInput
                                    style={styles.feedbackInput}
                                    placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
                                    placeholderTextColor="#94a3b8"
                                    value={feedbackComment}
                                    onChangeText={setFeedbackComment}
                                    multiline
                                    maxLength={200}
                                    textAlignVertical="top"
                                />

                                <TouchableOpacity
                                    style={[
                                        styles.submitFeedbackButton,
                                        (!selectedIssue || isSubmittingFeedback) && styles.submitFeedbackButtonDisabled,
                                    ]}
                                    onPress={handleSubmitFeedback}
                                    disabled={!selectedIssue || isSubmittingFeedback}
                                    activeOpacity={0.8}
                                >
                                    <Flag color="#fff" size={18} />
                                    <Text style={styles.submitFeedbackButtonText}>
                                        {isSubmittingFeedback ? 'กำลังส่ง...' : 'ส่งรายงาน'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8fafc',
    },
    errorText: {
        fontSize: 18,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16
    },

    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 60,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        gap: 12,
    },
    headerIconShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    headerLabel: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 28,
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    headerFoodType: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },

    contentPadding: {
        paddingHorizontal: 20,
    },

    imageWrapper: {
        alignItems: 'center',
        marginTop: -40,
        marginBottom: 20,
        zIndex: 10,
    },
    imageContainer: {
        width: '90%',
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#fff',
    },
    scannedImage: {
        width: '100%',
        height: 220,
    },

    card: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 16,
        color: '#0f172a',
    },
    analysisText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 16,
        color: '#475569',
        lineHeight: 26,
    },

    confidenceBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    confidenceBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    confidenceFill: {
        height: '100%',
        borderRadius: 4,
    },
    confidenceText: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 18,
        minWidth: 48,
    },

    boundingBoxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    boundingBoxLabel: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 16,
        color: '#475569',
    },
    boundingBoxOverlay: {
        position: 'absolute',
        borderWidth: 2,
        borderRadius: 4,
    },
    boundingBoxLabelContainer: {
        position: 'absolute',
        top: -18,
        left: -2,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    boundingBoxOverlayLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Kanit_700Bold',
    },

    warningCard: {
        backgroundColor: '#fef3c7',
        padding: 24,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    warningTitle: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 16,
        color: '#b45309',
    },
    warningText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 15,
        color: '#92400e',
        lineHeight: 24,
        marginTop: -8,
    },

    buttonRow: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 10,
    },
    shareButton: {
        flex: 1,
        backgroundColor: '#eff6ff',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    shareButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3b82f6',
    },
    reportButton: {
        flex: 1,
        backgroundColor: '#fff1f2',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        borderWidth: 1,
        borderColor: '#fecdd3',
    },
    reportButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ef4444',
    },
    doneButton: {
        flex: 2,
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    doneButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },

    // Feedback Modal
    feedbackOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    feedbackContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        gap: 14,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 4,
    },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    feedbackTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    feedbackSubtitle: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 20,
    },
    issueGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    issuePill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    issuePillSelected: {
        backgroundColor: '#fff1f2',
        borderColor: '#ef4444',
    },
    issuePillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    issuePillTextSelected: {
        color: '#ef4444',
    },
    feedbackInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        padding: 14,
        fontSize: 14,
        color: '#0f172a',
        minHeight: 80,
        lineHeight: 20,
    },
    submitFeedbackButton: {
        backgroundColor: '#ef4444',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    submitFeedbackButtonDisabled: {
        backgroundColor: '#fca5a5',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitFeedbackButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    // Success state
    feedbackSuccess: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 12,
    },
    feedbackSuccessTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
    },
    feedbackSuccessSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
    },
    closeFeedbackButton: {
        marginTop: 8,
        backgroundColor: '#10b981',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 14,
    },
    closeFeedbackButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
