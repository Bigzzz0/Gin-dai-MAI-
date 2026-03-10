import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { useState } from 'react';

export default function PreviewScreen() {
    const router = useRouter();
    const { currentImageUri } = useStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // In a real implementation, we would crop the image here
    // using expo-image-manipulator

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Simulate API call
        setTimeout(() => {
            setIsAnalyzing(false);
            router.push('/result');
        }, 2000);
    };

    return (
        <View style={styles.container}>
            {currentImageUri ? (
                <Image source={{ uri: currentImageUri }} style={styles.imagePreview} />
            ) : (
                <View style={styles.placeholder}>
                    <Text>ไม่มีรูปภาพที่จะแสดงผล</Text>
                </View>
            )}

            {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={{ marginTop: 10 }}>ระบบกำลังตรวจสอบความสดของเนื้อหมู...</Text>
                </View>
            ) : (
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.buttonCancel} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>ถ่ายใหม่</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonPrimary} onPress={handleAnalyze}>
                        <Text style={styles.buttonTextLight}>สแกนเลย</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    imagePreview: { flex: 1, resizeMode: 'contain' },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingContainer: { padding: 40, alignItems: 'center' },
    buttonsContainer: { flexDirection: 'row', padding: 20, justifyContent: 'space-between' },
    buttonCancel: { backgroundColor: '#ccc', padding: 15, borderRadius: 10, flex: 0.45, alignItems: 'center' },
    buttonPrimary: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, flex: 0.45, alignItems: 'center' },
    buttonText: { fontSize: 16, fontWeight: 'bold' },
    buttonTextLight: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
