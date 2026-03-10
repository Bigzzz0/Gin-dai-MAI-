import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, Image, RefreshControl, Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { SAFETY_CONFIG } from '../../src/types/scan.types';
import { useCallback, useState } from 'react';
import { apiService } from '../../src/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Clock, Info, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react-native';

const getSafetyIcon = (level: string) => {
   if (level === 'SAFE') return <ShieldCheck color="#10b981" size={16} />;
   if (level === 'SUSPICIOUS') return <ShieldQuestion color="#f59e0b" size={16} />;
   return <ShieldAlert color="#ef4444" size={16} />;
};

export default function HistoryScreen() {
    const router = useRouter();
    const { scanHistory, setScanHistory } = useStore();
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiService.getHistory(1, 20);
            if (response.data) {
                const mappedHistory = response.data.map((item: any) => ({
                    id: item.id,
                    imageUrl: item.imageUrl,
                    safetyLevel: item.safetyLevel,
                    foodType: item.foodType,
                    confidence: item.aiConfidence,
                    analysisDetail: item.analysisDetail || '',
                    createdAt: item.createdAt,
                }));
                setScanHistory(mappedHistory);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    }, [setScanHistory]);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

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
            <View style={styles.mainContainer}>
                 <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                         <Info color="#94a3b8" size={48} />
                    </View>
                    <Text style={styles.emptyTitle}>No Scan History</Text>
                    <Text style={styles.emptySubtitle}>Start scanning your food to build up your history and ensure safety.</Text>
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => router.push('/camera')}
                        activeOpacity={0.8}
                    >
                        <Camera color="#fff" size={20} style={{ marginRight: 8 }}/>
                        <Text style={styles.scanButtonText}>Scan Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
             <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
             <View style={styles.container}>
                <View style={styles.headerContainer}>
                   <Text style={styles.headerTitle}>Scan History</Text>
                   <Text style={styles.headerSubtitle}>{scanHistory.length} items logged</Text>
                </View>

                <FlatList
                    data={scanHistory}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={fetchHistory} tintColor="#10b981" />
                    }
                    renderItem={({ item }) => {
                        const config = SAFETY_CONFIG[item.safetyLevel];
                        const confidencePercent = Math.round(item.confidence * 100);

                        return (
                            <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                                {item.imageUrl ? (
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                                        <Camera color="#94a3b8" size={32} />
                                    </View>
                                )}

                                <View style={styles.cardInfo}>
                                    <Text style={styles.foodType} numberOfLines={1}>{item.foodType}</Text>
                                    
                                    <View style={styles.metaRow}>
                                       <View style={[styles.badge, { backgroundColor: config.bgColor + '20' }]}>
                                           {getSafetyIcon(item.safetyLevel)}
                                           <Text style={[styles.badgeText, { color: config.color }]}>
                                               {config.label}
                                           </Text>
                                       </View>
                                       
                                       <View style={styles.confidenceBadge}>
                                            <Text style={styles.confidenceText}>{confidencePercent}%</Text>
                                       </View>
                                    </View>
                                    
                                    <View style={styles.dateRow}>
                                       <Clock color="#94a3b8" size={14} />
                                       <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    headerContainer: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
        marginTop: 4,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    scanButton: {
        flexDirection: 'row',
        backgroundColor: '#10b981',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },

    // Card
    card: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginBottom: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 14,
    },
    thumbnailPlaceholder: {
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    foodType: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    confidenceBadge: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    confidenceText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '500',
    },
});