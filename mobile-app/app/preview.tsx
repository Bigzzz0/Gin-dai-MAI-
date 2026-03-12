import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, ActivityIndicator, Alert, Platform,
    Dimensions, Modal, TextInput, KeyboardAvoidingView, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { apiService, checkNetwork, NetworkError } from '../src/services/api';
import { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { ScanSearch, Undo2, Ban, PenLine, X, CheckCircle, Crop, MapPin, ShieldAlert, Check, WifiOff } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { getCurrentLocation } from '../src/hooks/useLocation';
import { useDisclaimer } from '../src/hooks/useDisclaimer';
import { useNetwork } from '../src/hooks/useNetwork';
import { NetworkError as NetworkErrorComponent } from '../src/components/NetworkError';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOADING_MESSAGES = [
    'กำลังส่งรูปภาพไปยัง AI...',
    'กำลังวิเคราะห์ส่วนผสมและความปลอดภัย...',
    'กำลังค้นหาสารปรุงแต่งที่เป็นอันตราย...',
    'กำลังประมวลผลด้วย Gemini Vision...',
    'ใกล้เสร็จแล้ว รอสักครู่...',
];

export default function PreviewScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { currentImageUri, setScanResult, addScanToHistory } = useStore();
    const { hasAccepted, acceptDisclaimer } = useDisclaimer();
    const network = useNetwork();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
    const [showNetworkError, setShowNetworkError] = useState(false);

    // Note/remark state
    const [userNote, setUserNote] = useState('');
    const [noteDraft, setNoteDraft] = useState('');
    const [noteModalVisible, setNoteModalVisible] = useState(false);

    // Disclaimer modal state
    const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [pendingAnalyze, setPendingAnalyze] = useState(false);

    // Animation values
    const scanLinePosition = useSharedValue(0);

    const scanLineStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: scanLinePosition.value }],
        };
    });

    // Show network error if not connected
    useEffect(() => {
        if (!network.isConnected && !isAnalyzing) {
            setShowNetworkError(true);
        } else {
            setShowNetworkError(false);
        }
    }, [network.isConnected, isAnalyzing]);

    useEffect(() => {
        let msgInterval: ReturnType<typeof setInterval>;
        if (isAnalyzing) {
            let msgIndex = 0;
            msgInterval = setInterval(() => {
                msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
                setLoadingMsg(LOADING_MESSAGES[msgIndex]);
            }, 3000);

            scanLinePosition.value = 0;
            scanLinePosition.value = withRepeat(
                withSequence(
                    withTiming(SCREEN_HEIGHT, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
        } else {
            scanLinePosition.value = 0;
        }
        return () => {
            if (msgInterval) clearInterval(msgInterval);
        };
    }, [isAnalyzing, scanLinePosition]);

    // Check disclaimer on mount
    useEffect(() => {
        if (hasAccepted === false && currentImageUri) {
            setShowDisclaimerModal(true);
        }
    }, [hasAccepted, currentImageUri]);

    const handleOpenNoteModal = () => {
        setNoteDraft(userNote);
        setNoteModalVisible(true);
    };

    const handleSaveNote = () => {
        setUserNote(noteDraft.trim());
        setNoteModalVisible(false);
    };

    const handleAnalyze = async () => {
        if (!currentImageUri) {
            Alert.alert('Error', 'No image found. Please retake photo.');
            return;
        }

        // Check if user has accepted disclaimer
        if (hasAccepted !== true) {
            setShowDisclaimerModal(true);
            setPendingAnalyze(true);
            return;
        }

        // Check network and show warning if offline but still allow analysis
        const networkStatus = await checkNetwork();
        if (!networkStatus.connected) {
            Alert.alert(
                'ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
                'การวิเคราะห์จะไม่ทำงานในโหมดออฟไลน์ รูปภาพจะถูกบันทึกและจะวิเคราะห์เมื่อมีการเชื่อมต่ออีกครั้ง\n\n' +
                'เครือข่ายปัจจุบัน: ' + networkStatus.type,
                [
                    { text: 'ยกเลิก', style: 'cancel' },
                    { 
                        text: 'บันทึกไว้ก่อน', 
                        onPress: () => {
                            // Save to offline cache
                            router.back();
                            Alert.alert('บันทึกแล้ว', 'รูปภาพจะถูกวิเคราะห์เมื่อมีการเชื่อมต่ออินเทอร์เน็ต');
                        }
                    }
                ]
            );
            return;
        }

        setIsAnalyzing(true);

        try {
            // Get location (optional - won't fail if location is disabled)
            const location = await getCurrentLocation();

            // Resize before sending to API (max width 1080 to save bandwidth and compute)
            const resized = await ImageManipulator.manipulateAsync(
                currentImageUri,
                [{ resize: { width: Math.min(1080, 1080) } }],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );

            const response = await apiService.analyzeImage(
                resized.uri,
                userNote || undefined,
                location.latitude || undefined,
                location.longitude || undefined
            );

            // Check if response is cached (offline mode)
            if ('cached' in response) {
                Alert.alert(
                    'บันทึกแล้ว',
                    'ไม่มีการเชื่อมต่ออินเทอร์เน็ต รูปภาพของคุณถูกบันทึกแล้วและจะวิเคราะห์เมื่อมีการเชื่อมต่ออีกครั้ง',
                    [{ text: 'ตกลง', onPress: () => router.back() }]
                );
                return;
            }

            setScanResult(response.result, response.scanId, response.imageUrl);

            addScanToHistory({
                id: response.scanId,
                imageUrl: response.imageUrl,
                isFood: response.result.isFood,
                safetyLevel: response.result.safetyLevel,
                foodType: response.result.foodType,
                confidence: response.result.confidence,
                analysisDetail: response.result.analysisDetail,
                boundingBoxes: response.result.boundingBoxes || [],
                createdAt: new Date().toISOString(),
                latitude: location.latitude || undefined,
                longitude: location.longitude || undefined,
            });

            router.push('/result');

        } catch (error: any) {
            Alert.alert(
                'Analysis Failed',
                error.message ?? 'Something went wrong. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAcceptDisclaimer = () => {
        acceptDisclaimer(dontShowAgain);
        setShowDisclaimerModal(false);
        if (pendingAnalyze) {
            setPendingAnalyze(false);
            handleAnalyze();
        }
    };

    return (
        <View style={styles.container}>
            {currentImageUri ? (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: currentImageUri }} style={styles.imagePreview} resizeMode="contain" />
                    {isAnalyzing && (
                        <View style={StyleSheet.absoluteFillObject}>
                            <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                            <Animated.View style={[styles.scanLineContainer, scanLineStyle]}>
                                <LinearGradient
                                    colors={['transparent', 'rgba(16, 185, 129, 0.4)', '#10b981']}
                                    style={styles.scanGradient}
                                />
                                <View style={styles.scanLineCore} />
                            </Animated.View>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.placeholder}>
                    <Ban color="#64748b" size={48} style={{ marginBottom: 16 }} />
                    <Text style={styles.placeholderText}>ไม่มีรูปภาพสำหรับแสดงตัวอย่าง</Text>
                </View>
            )}

            {/* Overlay fills the whole screen, content pinned to bottom */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                <View style={{ flex: 1 }} pointerEvents="none" />

                <View style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
                    {isAnalyzing ? (
                        <BlurView intensity={60} tint="dark" style={styles.loadingCard}>
                            <ActivityIndicator size="large" color="#10b981" />
                            <Text style={styles.loadingText}>{loadingMsg}</Text>
                            <Text style={styles.loadingSubText}>อาจใช้เวลาสักครู่...</Text>
                        </BlurView>
                    ) : (
                        <View style={styles.bottomStack}>
                            {/* Note button + preview */}
                            <TouchableOpacity
                                style={[styles.noteButton, userNote ? styles.noteButtonFilled : null]}
                                onPress={handleOpenNoteModal}
                                activeOpacity={0.75}
                            >
                                <PenLine color={userNote ? '#10b981' : 'rgba(255,255,255,0.8)'} size={16} />
                                <Text
                                    style={[styles.noteButtonText, userNote ? styles.noteButtonTextFilled : null]}
                                    numberOfLines={1}
                                >
                                    {userNote ? userNote : 'เพิ่มหมายเหตุให้ AI...'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => router.back()}
                                    activeOpacity={0.7}
                                >
                                    <BlurView intensity={50} tint="dark" style={styles.blurButton}>
                                        <Undo2 color="#fff" size={24} />
                                    </BlurView>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => router.push('/crop')}
                                    activeOpacity={0.7}
                                >
                                    <BlurView intensity={50} tint="dark" style={styles.blurButton}>
                                        <Crop color="#fff" size={24} />
                                    </BlurView>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.primaryActionButton}
                                    onPress={handleAnalyze}
                                    activeOpacity={0.8}
                                >
                                    <ScanSearch color="#fff" size={24} />
                                    <Text style={styles.primaryButtonText}>วิเคราะห์</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* Note Modal */}
            <Modal
                visible={noteModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setNoteModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContainer}>
                        {/* Handle bar */}
                        <View style={styles.modalHandle} />

                        <View style={styles.modalHeader}>
                            <PenLine color="#10b981" size={22} />
                            <Text style={styles.modalTitle}>เพิ่มหมายเหตุให้ AI</Text>
                            <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                                <X color="#94a3b8" size={22} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            ข้อมูลนี้จะถูกส่งต่อท้าย prompt หลักของระบบ เพื่อให้ AI วิเคราะห์ได้แม่นยำขึ้น
                        </Text>

                        <TextInput
                            style={styles.noteInput}
                            placeholder="เช่น อาหารนี้ปรุงสุกแล้ว / หมดอายุไป 3 วัน / เห็ดชนิดนี้เก็บมาจากป่า..."
                            placeholderTextColor="#94a3b8"
                            value={noteDraft}
                            onChangeText={setNoteDraft}
                            multiline
                            maxLength={300}
                            textAlignVertical="top"
                            autoFocus
                        />

                        <Text style={styles.charCount}>{noteDraft.length}/300</Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => { setNoteDraft(''); setUserNote(''); setNoteModalVisible(false); }}
                            >
                                <Text style={styles.clearButtonText}>ล้างหมายเหตุ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveNote}>
                                <CheckCircle color="#fff" size={18} />
                                <Text style={styles.saveButtonText}>บันทึก</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Disclaimer Modal */}
            <Modal
                visible={showDisclaimerModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDisclaimerModal(false)}
            >
                <View style={styles.disclaimerOverlay}>
                    <ScrollView style={styles.disclaimerContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.disclaimerHandle} />

                        <View style={styles.disclaimerIconContainer}>
                            <View style={styles.disclaimerIconCircle}>
                                <ShieldAlert color="#f59e0b" size={40} />
                            </View>
                        </View>

                        <Text style={styles.disclaimerTitle}>ข้อความปฏิเสธความรับผิดชอบ</Text>

                        <View style={styles.disclaimerContent}>
                            <Text style={styles.disclaimerText}>
                                ผลลัพธ์จาก AI เป็นเพียงการคัดกรองความเสี่ยงเบื้องต้น{' '}
                                <Text style={styles.disclaimerHighlight}>ไม่สามารถทดแทนการตรวจสอบทางห้องปฏิบัติการ
                                หรือการวินิจฉัยโดยผู้เชี่ยวชาญได้</Text>
                            </Text>

                            <View style={styles.disclaimerSection}>
                                <Text style={styles.disclaimerSectionTitle}>ข้อจำกัดของระบบ:</Text>
                                <View style={styles.disclaimerItem}>
                                    <ShieldAlert color="#f59e0b" size={16} style={styles.disclaimerItemIcon} />
                                    <Text style={styles.disclaimerItemText}>
                                        ตรวจสอบได้เฉพาะความผิดปกติที่ปรากฏบนพื้นผิวภายนอกเท่านั้น
                                    </Text>
                                </View>
                                <View style={styles.disclaimerItem}>
                                    <ShieldAlert color="#f59e0b" size={16} style={styles.disclaimerItemIcon} />
                                    <Text style={styles.disclaimerItemText}>
                                        ความแม่นยำขึ้นอยู่กับความคมชัดของภาพและแสงสว่าง
                                    </Text>
                                </View>
                                <View style={styles.disclaimerItem}>
                                    <ShieldAlert color="#f59e0b" size={16} style={styles.disclaimerItemIcon} />
                                    <Text style={styles.disclaimerItemText}>
                                        AI อาจให้ผลลัพธ์ที่ผิดพลาดได้ ควรใช้วิจารณญาณในการตัดสินใจ
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.disclaimerSection}>
                                <Text style={styles.disclaimerSectionTitle}>ความรับผิดชอบ:</Text>
                                <Text style={styles.disclaimerItemText}>
                                    ผู้ใช้งานต้องใช้วิจารณญาณของตนเองในการตัดสินใจบริโภคอาหาร
                                    ผู้พัฒนาไม่รับผิดชอบต่อความเสียหายหรืออาการเจ็บป่วยที่อาจเกิดขึ้นจากการนำผลลัพธ์ไปใช้
                                </Text>
                            </View>
                        </View>

                        <View style={styles.disclaimerCheckbox}>
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setDontShowAgain(!dontShowAgain)}
                                activeOpacity={0.7}
                            >
                                {dontShowAgain && (
                                    <View style={styles.checkboxCheck}>
                                        <Check color="#fff" size={14} />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <Text style={styles.checkboxLabel}>ไม่ต้องแสดงข้อความนี้อีก</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.disclaimerAcceptButton}
                            onPress={handleAcceptDisclaimer}
                            activeOpacity={0.8}
                        >
                            <Check color="#fff" size={20} />
                            <Text style={styles.disclaimerAcceptButtonText}>เข้าใจและยอมรับ</Text>
                        </TouchableOpacity>

                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imageContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    scanLineContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 120,
        top: -120,
        zIndex: 10,
    },
    scanGradient: {
        flex: 1,
    },
    scanLineCore: {
        height: 3,
        backgroundColor: '#34d399',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    placeholderText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '500',
    },
    bottomControls: {
        padding: 20,
        paddingTop: 16,
    },
    bottomStack: {
        gap: 12,
    },
    loadingCard: {
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginTop: 8,
    },
    loadingSubText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    noteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    noteButtonFilled: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: '#10b981',
    },
    noteButtonText: {
        flex: 1,
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    noteButtonTextFilled: {
        color: '#10b981',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    blurButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    primaryActionButton: {
        flex: 1.5,
        backgroundColor: '#10b981',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
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
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 20,
    },
    noteInput: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        padding: 16,
        fontSize: 15,
        color: '#0f172a',
        minHeight: 120,
        lineHeight: 22,
    },
    charCount: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'right',
        marginTop: -8,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    clearButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    clearButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },

    // Disclaimer Modal
    disclaimerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    disclaimerContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    },
    disclaimerHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e2e8f0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    disclaimerIconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    disclaimerIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    disclaimerTitle: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 20,
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 16,
    },
    disclaimerContent: {
        marginBottom: 16,
    },
    disclaimerText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 16,
    },
    disclaimerHighlight: {
        fontFamily: 'Kanit_600SemiBold',
        color: '#ef4444',
    },
    disclaimerSection: {
        marginBottom: 12,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
    },
    disclaimerSectionTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#0f172a',
        marginBottom: 8,
    },
    disclaimerItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    disclaimerItemIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    disclaimerItemText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 13,
        color: '#64748b',
        lineHeight: 20,
        flex: 1,
    },
    disclaimerCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxCheck: {
        width: 16,
        height: 16,
        borderRadius: 4,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    disclaimerAcceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    disclaimerAcceptButtonText: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 16,
        color: '#fff',
    },
});
