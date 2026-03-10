import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { Camera as CameraIcon, FlipHorizontal, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function CameraScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);
    const { setCurrentImageUri } = useStore();

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
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                });
                if (photo) {
                    setCurrentImageUri(photo.uri);
                    router.push('/preview');
                }
            } catch (error) {
                console.error('Failed to take picture:', error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <SafeAreaView style={styles.overlay}>
                    
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
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomBar}>
                        <View style={styles.controlsRow}>
                            
                            {/* Dummy view for symmetry */}
                            <View style={{ width: 60 }} />

                            {/* Capture Button */}
                            <TouchableOpacity
                                style={styles.captureButtonOuter}
                                onPress={takePicture}
                                activeOpacity={0.8}
                            >
                                <View style={styles.captureButtonInner} />
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

                </SafeAreaView>
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
        justifyContent: 'flex-start',
        paddingTop: Platform.OS === 'android' ? 20 : 0,
    },
    bottomBar: {
        paddingBottom: Platform.OS === 'ios' ? 20 : 40,
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
