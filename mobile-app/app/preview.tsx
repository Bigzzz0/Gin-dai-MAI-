import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { apiService } from '../src/services/api';
import { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { ScanSearch, Undo2, Ban } from 'lucide-react-native';

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

    useEffect(() => {
        let msgInterval: ReturnType<typeof setInterval>;
        if (isAnalyzing) {
            let msgIndex = 0;
            msgInterval = setInterval(() => {
                msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
                setLoadingMsg(LOADING_MESSAGES[msgIndex]);
            }, 3000);
        }
        return () => {
            if (msgInterval) clearInterval(msgInterval);
        };
    }, [isAnalyzing]);

    const handleAnalyze = async () => {
        if (!currentImageUri) {
            Alert.alert('Error', 'No image found. Please retake photo.');
            return;
        }

        setIsAnalyzing(true);

        try {
            const response = await apiService.analyzeImage(currentImageUri);

            setScanResult(response.result, response.scanId, response.imageUrl);

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
                <Image source={{ uri: currentImageUri }} style={styles.imagePreview} />
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
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        position: 'absolute',
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
});
