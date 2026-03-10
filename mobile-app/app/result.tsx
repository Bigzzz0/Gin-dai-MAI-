import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ResultScreen() {
    const router = useRouter();

    // Mock Result Data
    const result = {
        safetyLevel: 'DANGEROUS',
        foodType: 'เนื้อหมู',
        analysisDetail: 'พบลักษณะตุ่มขาวคล้ายพยาธิเม็ดสาคูในเนื้อหมู ไม่ควรรับประทานดิบ ควรเปลี่ยนวัตถุดิบชิ้นใหม่เพื่อหลีกเลี่ยงพยาธิตืดหมู',
    };

    const getStatusColor = () => {
        switch (result.safetyLevel) {
            case 'SAFE': return '#4CAF50';
            case 'SUSPICIOUS': return '#FFC107';
            case 'DANGEROUS': return '#F44336';
            default: return '#9e9e9e';
        }
    };

    const getStatusText = () => {
        switch (result.safetyLevel) {
            case 'SAFE': return 'ปลอดภัย (SAFE)';
            case 'SUSPICIOUS': return 'น่าสงสัย (SUSPICIOUS)';
            case 'DANGEROUS': return 'อันตราย (DANGEROUS)';
            default: return 'ไม่ทราบ (UNKNOWN)';
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.header, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.headerText}>{getStatusText()}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>ประเภทวัตถุดิบ:</Text>
                <Text style={styles.value}>{result.foodType}</Text>

                <Text style={[styles.label, { marginTop: 20 }]}>รายละเอียดการวิเคราะห์:</Text>
                <Text style={styles.description}>{result.analysisDetail}</Text>
            </View>

            <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.navigate('/')}
            >
                <Text style={styles.doneButtonText}>กลับหน้าแรก</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    card: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 10, elevation: 3 },
    label: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    value: { fontSize: 18, color: '#555', marginTop: 5 },
    description: { fontSize: 16, color: '#555', marginTop: 5, lineHeight: 24 },
    doneButton: { backgroundColor: '#2196F3', margin: 20, padding: 15, borderRadius: 10, alignItems: 'center' },
    doneButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' }
});
