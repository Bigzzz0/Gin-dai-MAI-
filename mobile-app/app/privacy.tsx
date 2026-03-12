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
import { ArrowLeft, Shield, Mail, Globe } from 'lucide-react-native';

export default function PrivacyScreen() {
    const router = useRouter();

    return (
        <View style={styles.mainContainer}>
            <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color="#0f172a" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>นโยบายความเป็นส่วนตัว</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Shield color="#10b981" size={48} />
                    </View>

                    {/* Introduction */}
                    <Text style={styles.title}>นโยบายความเป็นส่วนตัว</Text>
                    <Text style={styles.subtitle}>อัปเดตล่าสุด: มีนาคม 2569</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. บทนำ</Text>
                        <Text style={styles.text}>
                            Gin dai MAI! ("เรา", "ของเรา" หรือ "แอปพลิเคชัน") ให้ความสำคัญกับความเป็นส่วนตัวของคุณ
                            นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีการเก็บรวบรวม ใช้ และปกป้องข้อมูลของคุณ
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. ข้อมูลที่เก็บรวบรวม</Text>
                        <Text style={styles.text}>เราอาจเก็บรวบรวมข้อมูลดังนี้:</Text>
                        <Text style={styles.bullet}>• ข้อมูลบัญชี: อีเมล ชื่อ ที่อยู่อีเมล</Text>
                        <Text style={styles.bullet}>• รูปภาพอาหาร: รูปภาพที่คุณอัปโหลดเพื่อวิเคราะห์</Text>
                        <Text style={styles.bullet}>• ข้อมูลตำแหน่ง: ตำแหน่งที่คุณสแกน (หากเปิดใช้งาน)</Text>
                        <Text style={styles.bullet}>• ข้อมูลการใช้งาน: ประวัติการสแกนและผลลัพธ์</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. การใช้ข้อมูล</Text>
                        <Text style={styles.text}>เราใช้ข้อมูลที่เก็บรวบรวมเพื่อ:</Text>
                        <Text style={styles.bullet}>• ให้บริการวิเคราะห์ความปลอดภัยของอาหาร</Text>
                        <Text style={styles.bullet}>• ปรับปรุงประสิทธิภาพของ AI</Text>
                        <Text style={styles.bullet}>• บันทึกประวัติการใช้งานของคุณ</Text>
                        <Text style={styles.bullet}>• ติดต่อคุณเมื่อจำเป็น</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. การแบ่งปันข้อมูล</Text>
                        <Text style={styles.text}>
                            เราไม่ขายหรือแบ่งปันข้อมูลส่วนตัวของคุณกับบุคคลที่สาม
                            ข้อมูลอาจถูกแบ่งปันเฉพาะในกรณีดังนี้:
                        </Text>
                        <Text style={styles.bullet}>• ผู้ให้บริการคลาวด์ (Supabase) สำหรับเก็บข้อมูล</Text>
                        <Text style={styles.bullet}>• Gemini AI สำหรับวิเคราะห์รูปภาพ</Text>
                        <Text style={styles.bullet}>• เมื่อมีข้อกำหนดทางกฎหมาย</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. ความปลอดภัยของข้อมูล</Text>
                        <Text style={styles.text}>
                            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ
                            รวมถึงการเข้ารหัสข้อมูลและการควบคุมการเข้าถึง
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. สิทธิ์ของคุณ</Text>
                        <Text style={styles.text}>คุณมีสิทธิ์ดังนี้:</Text>
                        <Text style={styles.bullet}>• เข้าถึงข้อมูลส่วนตัวของคุณ</Text>
                        <Text style={styles.bullet}>• แก้ไขหรือลบข้อมูลของคุณ</Text>
                        <Text style={styles.bullet}>• ลบประวัติการสแกน</Text>
                        <Text style={styles.bullet}>• ยกเลิกการใช้แอปพลิเคชัน</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7. คุกกี้และเทคโนโลยีติดตาม</Text>
                        <Text style={styles.text}>
                            แอปพลิเคชันของเราไม่ใช้คุกกี้ แต่อาจใช้เทคโนโลยีที่คล้ายกันเพื่อปรับปรุงประสบการณ์การใช้งาน
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>8. การเปลี่ยนแปลงนโยบาย</Text>
                        <Text style={styles.text}>
                            เราอาจอัปเดตนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว
                            เราจะแจ้งให้คุณทราบถึงการเปลี่ยนแปลงที่สำคัญ
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>9. ติดต่อเรา</Text>
                        <Text style={styles.text}>
                            หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเราที่:
                        </Text>
                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={() => Linking.openURL('mailto:support@gindaimai.com')}
                        >
                            <Mail color="#10b981" size={18} />
                            <Text style={styles.contactText}>support@gindaimai.com</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>หมายเหตุ:</Text>
                        <Text style={styles.infoText}>
                            นโยบายความเป็นส่วนตัวนี้ใช้เฉพาะกับแอปพลิเคชัน Gin dai MAI!
                            การใช้แอปพลิเคชันของคุณถือว่ายอมรับนโยบายนี้
                        </Text>
                    </View>

                    <View style={{ height: 40 }} />
                </View>
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
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: 'Kanit_700Bold',
        fontSize: 28,
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 16,
        color: '#0f172a',
        marginBottom: 12,
    },
    text: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 8,
    },
    bullet: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#475569',
        lineHeight: 24,
        marginLeft: 8,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
        gap: 8,
    },
    contactText: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#10b981',
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 8,
    },
    infoTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#0f172a',
        marginBottom: 8,
    },
    infoText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 13,
        color: '#64748b',
        lineHeight: 20,
    },
});
