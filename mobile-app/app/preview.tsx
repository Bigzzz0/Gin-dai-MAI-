import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform,
    Dimensions, Modal, TextInput, KeyboardAvoidingView, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { apiService } from '../src/services/api';
import { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { ScanSearch, Undo2, Ban, PenLine, X, CheckCircle } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOADING_MESSAGES = [
    'Sending image to AI...',
    'Analyzing ingredients & safety...',
    'Looking for harmful additives...',
    'Processing via Gemini Vision...',
    'Almost there, hanging tight...',
];

export default function PreviewScreen() {
    const router = useRouter();
    const { currentImageUri, setScanResult, addScanToHistory } = useStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

    // Note/remark state
    const [userNote, setUserNote] = useState('');
    const [noteDraft, setNoteDraft] = useState('');
    const [noteModalVisible, setNoteModalVisible] = useState(false);

    // Animation values
    const scanLinePosition = useSharedValue(0);

    const scanLineStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: scanLinePosition.value }],
        };
    });

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

        setIsAnalyzing(true);

        try {
            const response = await apiService.analyzeImage(currentImageUri, userNote || undefined);

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
                    <Text style={styles.placeholderText}>No image available to preview</Text>
                </View>
            )}

            <SafeAreaView style={styles.overlay}>
                <View style={{ flex: 1 }} />

                <View style={styles.bottomControls}>
                    {isAnalyzing ? (
                        <BlurView intensity={60} tint="dark" style={styles.loadingCard}>
                            <ActivityIndicator size="large" color="#10b981" />
                            <Text style={styles.loadingText}>{loadingMsg}</Text>
                            <Text style={styles.loadingSubText}>This may take a few seconds...</Text>
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
                                        <Text style={styles.buttonText}>Retake</Text>
                                    </BlurView>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.primaryActionButton}
                                    onPress={handleAnalyze}
                                    activeOpacity={0.8}
                                >
                                    <ScanSearch color="#fff" size={24} />
                                    <Text style={styles.primaryButtonText}>Analyze Food</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </SafeAreaView>

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
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomControls: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 24 : 40,
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
});
