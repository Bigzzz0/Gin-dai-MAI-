import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, ScrollView, Share, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { SAFETY_CONFIG } from '../src/types/scan.types';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, Check, AlertTriangle, ShieldCheck, ShieldAlert, ShieldQuestion, Info, ScanSearch } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

const getHeaderIcon = (level: string) => {
    if (level === 'SAFE') return <ShieldCheck color="#ffffff" size={64} style={styles.headerIconShadow} />;
    if (level === 'SUSPICIOUS') return <ShieldQuestion color="#ffffff" size={64} style={styles.headerIconShadow} />;
    return <ShieldAlert color="#ffffff" size={64} style={styles.headerIconShadow} />;
};

export default function ResultScreen() {
    const router = useRouter();
    const { lastScanResult, lastScanImageUrl, clearScanResult } = useStore();

    const animatedWidth = useSharedValue(0);

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
                <Text style={styles.errorText}>Analysis result not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.navigate('/')}>
                    <Text style={styles.backButtonText}>Return Home</Text>
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
                message: `Food Safety Analysis by Gin dai MAI!\n\n` +
                    `Ingredient: ${lastScanResult.foodType}\n` +
                    `Status: ${config.label}\n` +
                    `Confidence: ${confidencePercent}%\n\n` +
                    `Details: ${lastScanResult.analysisDetail}`,
            });
        } catch {}
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <LinearGradient
                colors={[config.color, config.color + 'cc']} // slight opacity for gradient end
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
                    </View>
                </View>
            )}

            <View style={styles.contentPadding}>
                {/* Confidence Card */}
                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ShieldCheck color="#64748b" size={20} />
                        <Text style={styles.cardTitle}>AI Confidence</Text>
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
                        <Text style={styles.cardTitle}>Analysis Details</Text>
                    </View>
                    <Text style={styles.analysisText}>{lastScanResult.analysisDetail}</Text>
                </Animated.View>

                {/* Bounding Boxes */}
                {lastScanResult.boundingBoxes && lastScanResult.boundingBoxes.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <ScanSearch color="#64748b" size={20} />
                            <Text style={styles.cardTitle}>Detected Items</Text>
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
                            <Text style={styles.warningTitle}>Warning</Text>
                        </View>
                        <Text style={styles.warningText}>
                            Do not consume this ingredient. Please discard or isolate it from other food items immediately.
                        </Text>
                    </View>
                )}

                {/* Bottom Actions */}
                <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={styles.shareButton} 
                        onPress={handleShare}
                        activeOpacity={0.7}
                    >
                        <Share2 color="#3b82f6" size={20} />
                        <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.doneButton} 
                        onPress={handleDone}
                        activeOpacity={0.8}
                    >
                        <Check color="#fff" size={20} />
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View style={{ height: 40 }} />
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
        gap: 16,
    },
    shareButton: {
        flex: 1,
        backgroundColor: '#eff6ff',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    shareButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3b82f6',
    },
    doneButton: {
        flex: 2,
        backgroundColor: '#10b981',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});
