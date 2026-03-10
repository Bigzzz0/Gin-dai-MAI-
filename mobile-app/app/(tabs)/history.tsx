import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, Image, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { SAFETY_CONFIG } from '../../src/types/scan.types';

export default function HistoryScreen() {
    const router = useRouter();
    const { scanHistory } = useStore();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (scanHistory.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>ยังไม่มีประวัติการสแกน</Text>
                <Text style={styles.emptySubtitle}>ถ่ายรูปวัตถุดิบเพื่อเริ่มต้นใช้งาน</Text>
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => router.push('/camera')}
                >
                    <Text style={styles.scanButtonText}>📷 สแกนเลย</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>ประวัติการสแกน ({scanHistory.length} รายการ)</Text>

            <FlatList
                data={scanHistory}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                    const config = SAFETY_CONFIG[item.safetyLevel];
                    const confidencePercent = Math.round(item.confidence * 100);

                    return (
                        <View style={styles.card}>
                            {/* รูปภาพ */}
                            {item.imageUrl ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.thumbnail}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                                    <Text style={{ fontSize: 24 }}>🍽️</Text>
                                </View>
                            )}

                            {/* ข้อมูล */}
                            <View style={styles.cardInfo}>
                                <Text style={styles.foodType}>{item.foodType}</Text>
                                <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
                                    <Text style={[styles.badgeText, { color: config.color }]}>
                                        {config.label}
                                    </Text>
                                </View>
                                <Text style={styles.confidence}>
                                    ความมั่นใจ: {confidencePercent}%
                                </Text>
                                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                            </View>

                            {/* สีแถบด้านขวา */}
                            <View style={[styles.colorBar, { backgroundColor: config.color }]} />
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 24,
        backgroundColor: '#f5f5f5',
    },
    emptyEmoji: { fontSize: 56 },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#999',
        textAlign: 'center',
    },
    scanButton: {
        marginTop: 8,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Card
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    thumbnail: {
        width: 90,
        height: 90,
    },
    thumbnailPlaceholder: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        padding: 12,
        gap: 4,
    },
    foodType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        marginTop: 2,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    confidence: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    date: {
        fontSize: 12,
        color: '#bbb',
    },
    colorBar: {
        width: 5,
    },
});