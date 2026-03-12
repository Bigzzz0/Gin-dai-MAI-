import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, Image, RefreshControl, Platform, Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { SAFETY_CONFIG } from '../../src/types/scan.types';
import { useCallback, useState } from 'react';
import { apiService } from '../../src/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Clock, Info, ShieldAlert, ShieldCheck, ShieldQuestion, Trash2 } from 'lucide-react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

const getSafetyIcon = (level: string) => {
   if (level === 'SAFE') return <ShieldCheck color="#10b981" size={16} />;
   if (level === 'SUSPICIOUS') return <ShieldQuestion color="#f59e0b" size={16} />;
   return <ShieldAlert color="#ef4444" size={16} />;
};

export default function HistoryScreen() {
    const router = useRouter();
    const { scanHistory, setScanHistory, setScanResult } = useStore();
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiService.getHistory(1, 20);
            console.log('=== History API Response ===');
            console.log('Response data:', response.data);
            if (response.data) {
                // Simulate slight network delay for skeletons
                setTimeout(() => {
                    const mappedHistory = response.data.map((item: any) => {
                        const historyItem = {
                            id: item.id,
                            imageUrl: item.imageUrl,
                            isFood: item.isFood ?? item.aiResponseJson?.isFood ?? true,
                            safetyLevel: item.safetyLevel,
                            foodType: item.foodType,
                            confidence: item.aiConfidence,
                            analysisDetail: item.aiResponseJson?.analysisDetail || '',
                            boundingBoxes: item.aiResponseJson?.boundingBoxes || [],
                            createdAt: item.createdAt,
                        };
                        console.log('Mapped history item:', {
                            id: historyItem.id,
                            imageUrl: historyItem.imageUrl,
                            safetyLevel: historyItem.safetyLevel,
                        });
                        return historyItem;
                    });
                    setScanHistory(mappedHistory);
                    setLoading(false);
                }, 500);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
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

    const handleDelete = (id: string) => {
        Alert.alert(
            'ลบประวัติ',
            'คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการสแกนนี้?',
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ลบ',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await apiService.deleteScan(id);
                            fetchHistory();
                        } catch (error) {
                            console.error('Failed to delete scan:', error);
                            setLoading(false);
                            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถลบประวัติได้ กรุณาลองใหม่');
                        }
                    }
                }
            ]
        );
    };

    if (scanHistory.length === 0 && !loading) {
        return (
            <View style={styles.mainContainer}>
                 <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                         <Info color="#94a3b8" size={48} />
                    </View>
                    <Text style={styles.emptyTitle}>ไม่มีประวัติการสแกน</Text>
                    <Text style={styles.emptySubtitle}>เริ่มสแกนอาหารเพื่อตรวจสอบความปลอดภัยและบันทึกประวัติของคุณ</Text>
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => router.push('/camera')}
                        activeOpacity={0.8}
                    >
                        <Camera color="#fff" size={20} style={{ marginRight: 8 }}/>
                        <Text style={styles.scanButtonText}>สแกนเลย</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const renderSkeleton = () => (
        <View style={styles.card}>
             <View style={[styles.thumbnail, { backgroundColor: '#e2e8f0' }]} />
             <View style={styles.cardInfo}>
                 <View style={{ width: '60%', height: 20, backgroundColor: '#e2e8f0', borderRadius: 4, marginBottom: 8 }} />
                 <View style={{ width: '40%', height: 24, backgroundColor: '#e2e8f0', borderRadius: 12, marginBottom: 8 }} />
                 <View style={{ width: '30%', height: 14, backgroundColor: '#e2e8f0', borderRadius: 4 }} />
             </View>
        </View>
    );

    if (loading && scanHistory.length === 0) {
        return (
            <View style={styles.mainContainer}>
                 <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
                <View style={[styles.container, { paddingHorizontal: 20 }]}>
                    <View style={[styles.headerContainer, { paddingHorizontal: 0 }]}>
                       <Text style={styles.headerTitle}>ประวัติการสแกน</Text>
                       <Text style={styles.headerSubtitle}>กำลังโหลดข้อมูล...</Text>
                    </View>
                    {[1, 2, 3, 4, 5].map(i => <View key={i}>{renderSkeleton()}</View>)}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
             <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
             <View style={styles.container}>
                <View style={styles.headerContainer}>
                   <Text style={styles.headerTitle}>ประวัติการสแกน</Text>
                   <Text style={styles.headerSubtitle}>บันทึกแล้ว {scanHistory.length} รายการ</Text>
                </View>

                <FlatList
                    data={scanHistory}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={fetchHistory} tintColor="#10b981" />
                    }
                    renderItem={({ item, index }) => {
                        const config = SAFETY_CONFIG[item.safetyLevel];
                        const confidencePercent = Math.round(item.confidence * 100);

                        return (
                            <Animated.View layout={Layout.springify()} entering={FadeIn.delay(index * 100)}>
                                <TouchableOpacity
                                    style={styles.card}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        console.log('=== Click History Item ===');
                                        console.log('Item ID:', item.id);
                                        console.log('Item ImageURL:', item.imageUrl);
                                        console.log('Item safetyLevel:', item.safetyLevel);

                                        // Ensure imageUrl is valid before passing
                                        const validImageUrl = item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : null;
                                        
                                        setScanResult({
                                            isFood: item.isFood,
                                            safetyLevel: item.safetyLevel,
                                            foodType: item.foodType,
                                            confidence: item.confidence,
                                            analysisDetail: item.analysisDetail,
                                            boundingBoxes: item.boundingBoxes ?? [],
                                        }, item.id, validImageUrl);
                                        console.log('Navigating to /result with imageUrl:', validImageUrl);
                                        router.push('/result');
                                    }}
                                >
                                    <View style={styles.cardImageContainer}>
                                        {item.imageUrl ? (
                                            <>
                                                <Image
                                                    source={{ uri: item.imageUrl }}
                                                    style={styles.thumbnail}
                                                    resizeMode="contain"
                                                />
                                                {/* Render bounding boxes on thumbnail */}
                                                {item.boundingBoxes && item.boundingBoxes.length > 0 && item.boundingBoxes.slice(0, 3).map((box, index) => {
                                                    if (!box || typeof box.y_min !== 'number' || typeof box.x_min !== 'number' ||
                                                        typeof box.y_max !== 'number' || typeof box.x_max !== 'number') return null;
                                                    
                                                    const y_min = Math.max(0, Math.min(1000, box.y_min));
                                                    const x_min = Math.max(0, Math.min(1000, box.x_min));
                                                    const y_max = Math.max(0, Math.min(1000, box.y_max));
                                                    const x_max = Math.max(0, Math.min(1000, box.x_max));
                                                    
                                                    if (x_max <= x_min || y_max <= y_min) return null;
                                                    
                                                    return (
                                                        <View
                                                            key={index}
                                                            style={[
                                                                styles.boundingBoxOverlay,
                                                                {
                                                                    top: `${(y_min / 1000) * 100}%`,
                                                                    left: `${(x_min / 1000) * 100}%`,
                                                                    width: `${((x_max - x_min) / 1000) * 100}%`,
                                                                    height: `${((y_max - y_min) / 1000) * 100}%`,
                                                                    borderColor: config.color,
                                                                }
                                                            ]}
                                                        >
                                                            <Text style={[styles.boundingBoxLabel, { color: config.color, fontSize: 9 }]} numberOfLines={1}>
                                                                {box.label}
                                                            </Text>
                                                        </View>
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                                                <Camera color="#94a3b8" size={32} />
                                            </View>
                                        )}
                                        {item.boundingBoxes && item.boundingBoxes.length > 3 && (
                                            <View style={styles.boundingBoxCount}>
                                                <Text style={styles.boundingBoxCountText}>+{item.boundingBoxes.length - 3}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.cardInfo}>
                                        <View style={styles.cardHeaderRow}>
                                            <Text style={styles.foodType} numberOfLines={1}>{item.foodType}</Text>
                                            <View style={styles.cardActions}>
                                                <TouchableOpacity
                                                    onPress={() => router.push(`/anomaly-detail?id=${item.id}` as any)}
                                                    style={styles.detailButton}
                                                    activeOpacity={0.6}
                                                >
                                                    <Info color="#3b82f6" size={18} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => handleDelete(item.id)}
                                                    style={styles.deleteButton}
                                                    activeOpacity={0.6}
                                                >
                                                    <Trash2 color="#ef4444" size={18} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        
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
                            </Animated.View>
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
        fontFamily: 'Kanit_700Bold',
        fontSize: 32,
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 140,
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
        fontFamily: 'Kanit_700Bold',
        fontSize: 24,
        color: '#1e293b',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontFamily: 'Kanit_400Regular',
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
    cardImageContainer: {
        position: 'relative',
        backgroundColor: '#000',
        borderRadius: 14,
        overflow: 'hidden',
    },
    thumbnail: {
        width: 100,
        height: 100,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
    },
    thumbnailPlaceholder: {
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    boundingBoxOverlay: {
        position: 'absolute',
        borderWidth: 1.5,
        borderRadius: 3,
        borderStyle: 'solid',
    },
    boundingBoxLabel: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 9,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 3,
        paddingVertical: 1,
        borderRadius: 2,
        overflow: 'hidden',
    },
    boundingBoxCount: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    boundingBoxCountText: {
        color: '#fff',
        fontFamily: 'Kanit_700Bold',
        fontSize: 10,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 4,
    },
    detailButton: {
        padding: 4,
        marginLeft: 4,
        backgroundColor: '#eff6ff',
        borderRadius: 6,
    },
    deleteButton: {
        padding: 4,
        marginLeft: 4,
        backgroundColor: '#fef2f2',
        borderRadius: 6,
    },
    foodType: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 18,
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
        fontFamily: 'Kanit_700Bold',
        fontSize: 13,
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
        fontFamily: 'Kanit_700Bold',
        fontSize: 12,
        color: '#64748b',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 13,
        color: '#94a3b8',
    },
});