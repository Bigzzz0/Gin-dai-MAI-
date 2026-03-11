import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { Camera as CameraIcon, FlipHorizontal, X, Grid3X3, Zap, ZapOff } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export default function CameraScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('auto');
    const [zoom, setZoom] = useState(0);
    const [permission, requestPermission] = useCameraPermissions();
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const { setCurrentImageUri } = useStore();
    const [showGrid, setShowGrid] = useState(false);
    const insets = useSafeAreaInsets();

    // Animation for capture button
    const captureScale = useSharedValue(1);

    const animatedCaptureStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: captureScale.value }],
        };
    });

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <CameraIcon color="#10b981" size={64} style={{ marginBottom: 20 }} />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>We need your permission to scan food items for safety analysis.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission} activeOpacity={0.8}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            captureScale.value = withSpring(0.9, { damping: 10, stiffness: 400 });
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                });

                captureScale.value = withSpring(1);

                if (photo) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setCurrentImageUri(photo.uri);
                    router.push('/crop');
                }
            } catch (error) {
                console.error('Failed to take picture:', error);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                captureScale.value = withSpring(1);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} flash={flash} zoom={zoom} ref={cameraRef}>
                {showGrid && (
                    <View style={styles.gridOverlay}>
                        <View style={styles.gridRow}>
                            <View style={styles.gridCell} />
                            <View style={styles.gridCell} />
                            <View style={styles.gridCell} />
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridCell} />
                            <View style={styles.gridCell} />
                            <View style={styles.gridCell} />
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridCell} />
                            <View style={styles.gridCell} />
                            <View style={styles.gridCell} />
                        </View>
                    </View>
                )}

                <View style={[styles.overlay, { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }]}>

                    {/* Top Bar */}
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.back()}
                            activeOpacity={0.7}
                        >
                            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                                <X color="#fff" size={24} />
                            </BlurView>
                        </TouchableOpacity>

                        <View style={styles.topRightControls}>
                            <TouchableOpacity
                                style={[styles.iconButton, { marginRight: 12 }]}
                                onPress={() => setFlash(f => f === 'off' ? 'on' : f === 'on' ? 'auto' : 'off')}
                                activeOpacity={0.7}
                            >
                                <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                                    {flash === 'off' && <ZapOff color="#fff" size={22} />}
                                    {flash === 'on' && <Zap color="#10b981" size={22} />}
                                    {flash === 'auto' && <Zap color="#fbbf24" size={22} />}
                                </BlurView>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => setShowGrid(!showGrid)}
                                activeOpacity={0.7}
                            >
                                <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                                    <Grid3X3 color={showGrid ? "#10b981" : "#fff"} size={22} />
                                </BlurView>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.bottomArea}>
                        {/* Zoom Control */}
                        <View style={styles.zoomContainer}>
                            <TouchableOpacity
                                style={styles.zoomButton}
                                onPress={() => setZoom(z => z === 0 ? 0.02 : 0)}
                            >
                                <BlurView intensity={30} tint="dark" style={styles.zoomBlur}>
                                    <Text style={styles.zoomText}>{zoom === 0 ? '1x' : '2x'}</Text>
                                </BlurView>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Controls */}
                        <View style={styles.bottomBar}>
                            <View style={styles.controlsRow}>

                                {/* Dummy view for symmetry */}
                                <View style={{ width: 50 }} />

                                {/* Capture Button */}
                                <TouchableOpacity
                                    onPress={takePicture}
                                    activeOpacity={0.9}
                                >
                                    <Animated.View style={[styles.captureButtonOuter, animatedCaptureStyle]}>
                                        <View style={styles.captureButtonInner} />
                                    </Animated.View>
                                </TouchableOpacity>

                                {/* Flip Camera Button */}
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={toggleCameraFacing}
                                    activeOpacity={0.7}
                                >
                                    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                                        <FlipHorizontal color="#fff" size={24} />
                                    </BlurView>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View>

                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 20 : 0,
    },
    topRightControls: {
        flexDirection: 'row',
    },
    bottomArea: {
        alignItems: 'stretch',
    },
    bottomBar: {
        marginBottom: Platform.OS === 'ios' ? 0 : 20,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
    },
    blurContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    captureButtonOuter: {
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#fff',
    },
    gridOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    gridRow: {
        flex: 1,
        flexDirection: 'row',
    },
    gridCell: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    zoomContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    zoomButton: {
        height: 38,
        width: 38,
        borderRadius: 19,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    zoomBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    zoomText: {
        color: '#fff',
        fontFamily: 'Kanit_700Bold',
        fontSize: 13,
    },
    // Permission Screen
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8fafc',
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 12,
    },
    permissionText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    permissionButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
