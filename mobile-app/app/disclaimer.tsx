import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowLeft,
    ShieldAlert,
    AlertTriangle,
    Info,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react-native';

export default function DisclaimerScreen() {
    const router = useRouter();

    const handleContactSupport = () => {
        // You can add email or contact form here
        Alert.alert('ติดต่อเรา', 'อีเมล: support@gindaimai.com');
    };

    return (
        <View style={styles.mainContainer}>
            <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color="#0f172a" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ข้อความปฏิเสธความรับผิดชอบ</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Warning Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <ShieldAlert color="#10b981" size={48} />
                    </View>
                </View>

                {/* Main Disclaimer */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>วัตถุประสงค์ของแอปพลิเคชัน</Text>
                    <View style={styles.contentCard}>
                        <Text style={styles.contentText}>
                            แอปพลิเคชัน "Gin dai MAI!" พัฒนาขึ้นเพื่อวัตถุประสงค์ในการให้ข้อมูลเบื้องต้น
                            เกี่ยวกับการตรวจสอบความปลอดภัยของวัตถุดิบอาหารเท่านั้น
                            ไม่ใช่เครื่องมือทางการแพทย์หรือเครื่องมือตรวจสอบทางวิทยาศาสตร์ที่ได้รับการรับรอง
                        </Text>
                    </View>
                </View>

                {/* Limitations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ข้อจำกัดของระบบ</Text>
                    <View style={styles.contentCard}>
                        <View style={styles.limitationItem}>
                            <AlertTriangle color="#f59e0b" size={20} style={styles.limitationIcon} />
                            <Text style={styles.limitationText}>
                                ระบบสามารถตรวจสอบได้เฉพาะความผิดปกติที่ปรากฏบนพื้นผิวภายนอกเท่านั้น
                                ไม่สามารถตรวจสอบเชื้อโรคระดับจุลทรีย์หรือสารเคมีตกค้างได้
                            </Text>
                        </View>
                        <View style={styles.limitationItem}>
                            <AlertTriangle color="#f59e0b" size={20} style={styles.limitationIcon} />
                            <Text style={styles.limitationText}>
                                ความแม่นยำของการวิเคราะห์ขึ้นอยู่กับความคมชัดของภาพและแสงสว่างขณะถ่าย
                            </Text>
                        </View>
                        <View style={styles.limitationItem}>
                            <AlertTriangle color="#f59e0b" size={20} style={styles.limitationIcon} />
                            <Text style={styles.limitationText}>
                                AI อาจให้ผลลัพธ์ที่ผิดพลาดได้ (False Positive/Negative)
                                ควรใช้วิจารณญาณในการตัดสินใจ
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Not a Substitute */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ไม่ใช่ทางเลือกแทนการตรวจสอบมืออาชีพ</Text>
                    <View style={styles.contentCard}>
                        <Text style={styles.contentText}>
                            ผลลัพธ์จาก AI เป็นเพียงการคัดกรองความเสี่ยงเบื้องต้น{' '}
                            <Text style={styles.highlightText}>
                                ไม่สามารถทดแทนการตรวจสอบทางห้องปฏิบัติการ
                                หรือการวินิจฉัยโดยผู้เชี่ยวชาญได้
                            </Text>
                            {' '}หากมีข้อสงสัยเกี่ยวกับความปลอดภัยของอาหาร ควรปรึกษาผู้เชี่ยวชาญหรือส่งตรวจสอบทางห้องปฏิบัติการ
                        </Text>
                    </View>
                </View>

                {/* User Responsibility */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ความรับผิดชอบของผู้ใช้งาน</Text>
                    <View style={styles.contentCard}>
                        <View style={styles.responsibilityItem}>
                            <CheckCircle2 color="#10b981" size={20} style={styles.responsibilityIcon} />
                            <Text style={styles.responsibilityText}>
                                ผู้ใช้งานต้องใช้วิจารณญาณของตนเองในการตัดสินใจบริโภคอาหาร
                            </Text>
                        </View>
                        <View style={styles.responsibilityItem}>
                            <CheckCircle2 color="#10b981" size={20} style={styles.responsibilityIcon} />
                            <Text style={styles.responsibilityText}>
                                ผู้พัฒนาไม่รับผิดชอบ Against ความเสียหายหรืออาการเจ็บป่วย
                                ที่อาจเกิดขึ้นจากการนำผลลัพธ์ไปใช้
                            </Text>
                        </View>
                        <View style={styles.responsibilityItem}>
                            <CheckCircle2 color="#10b981" size={20} style={styles.responsibilityIcon} />
                            <Text style={styles.responsibilityText}>
                                ควรปรุงอาหารให้สุกก่อนรับประทานเสมอ เพื่อความปลอดภัยสูงสุด
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Accuracy Notice */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ความแม่นยำของระบบ</Text>
                    <View style={styles.accuracyCard}>
                        <Info color="#3b82f6" size={24} style={styles.accuracyIcon} />
                        <Text style={styles.accuracyText}>
                            ระบบใช้เทคโนโลยี AI (Google Gemini 1.5 Flash) ในการวิเคราะห์ภาพ
                            ซึ่งมีความแม่นยำในระดับหนึ่ง แต่ไม่สามารถรับประกันความถูกต้อง 100%
                            ผลลัพธ์อาจมีความคลาดเคลื่อนได้
                        </Text>
                    </View>
                </View>

                {/* Emergency Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>กรณีฉุกเฉิน</Text>
                    <View style={styles.emergencyCard}>
                        <AlertTriangle color="#ef4444" size={24} style={styles.emergencyIcon} />
                        <Text style={styles.emergencyText}>
                            หากเผลอรับประทานอาหารที่อาจปนเปื้อนและมีอาการผิดปกติ เช่น คลื่นไส้ อาเจียน
                            ปวดท้อง ให้รีบพบแพทย์ทันที
                        </Text>
                    </View>
                </View>

                {/* Contact Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ติดต่อเรา</Text>
                    <View style={styles.contentCard}>
                        <Text style={styles.contentText}>
                            หากมีคำถามหรือข้อสงสัยเกี่ยวกับแอปพลิเคชัน หรือต้องการรายงานปัญหา
                            กรุณาติดต่อทีมพัฒนา
                        </Text>
                        <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                            <Info color="#10b981" size={18} />
                            <Text style={styles.contactButtonText}>ติดต่อทีมสนับสนุน</Text>
                            <ExternalLink color="#10b981" size={18} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Accept Button */}
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <CheckCircle2 color="#fff" size={20} />
                    <Text style={styles.acceptButtonText}>เข้าใจและยอมรับ</Text>
                </TouchableOpacity>

                {/* Bottom Padding */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: '#f8fafc',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 20,
        color: '#0f172a',
    },

    // Icon Container
    iconContainer: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 10,
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Sections
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 16,
        color: '#0f172a',
        marginBottom: 10,
    },

    // Content Card
    contentCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    contentText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    highlightText: {
        fontFamily: 'Kanit_600SemiBold',
        color: '#ef4444',
    },

    // Limitations
    limitationItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    limitationIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    limitationText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        flex: 1,
    },

    // Responsibility
    responsibilityItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    responsibilityIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    responsibilityText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        flex: 1,
    },

    // Accuracy Card
    accuracyCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#dbeafe',
        flexDirection: 'row',
        gap: 12,
    },
    accuracyIcon: {
        marginTop: 2,
    },
    accuracyText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#1e40af',
        lineHeight: 22,
        flex: 1,
    },

    // Emergency Card
    emergencyCard: {
        backgroundColor: '#fef2f2',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
        flexDirection: 'row',
        gap: 12,
    },
    emergencyIcon: {
        marginTop: 2,
    },
    emergencyText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#991b1b',
        lineHeight: 22,
        flex: 1,
    },

    // Contact Button
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0fdf4',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginTop: 12,
        gap: 8,
    },
    contactButtonText: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#10b981',
    },

    // Accept Button
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        gap: 8,
    },
    acceptButtonText: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 16,
        color: '#ffffff',
    },
});
