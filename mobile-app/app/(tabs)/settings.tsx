import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Platform,
    Alert,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    User,
    Bell,
    Shield,
    Info,
    HelpCircle,
    LogOut,
    ChevronRight,
    Globe,
    Camera,
    MapPin,
} from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';

export default function SettingsScreen() {
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [saveLocation, setSaveLocation] = useState(false);
    const [highQualityImages, setHighQualityImages] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            'ออกจากระบบ',
            'คุณแน่ใจหรือไม่ที่ต้องการออกจากระบบ?',
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ออกจากระบบ',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await supabase.auth.signOut();
                            Alert.alert('สำเร็จ', 'ออกจากระบบแล้ว');
                            router.replace('/auth');
                        } catch (error) {
                            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถออกจากระบบได้');
                        }
                    },
                },
            ]
        );
    };

    const handleShowDisclaimer = () => {
        router.push('/disclaimer');
    };

    const handleGoToProfile = () => {
        router.push('/profile');
    };

    const handleAbout = () => {
        Alert.alert(
            'เกี่ยวกับ Gin dai MAI!',
            'เวอร์ชัน 1.0.0\n\nระบบสแกนตรวจสอบความปลอดภัยและสิ่งแปลกปลอมในวัตถุดิบอาหารด้วย AI',
            [
                { text: 'ตกลง' },
                {
                    text: 'ตรวจสอบอัปเดต',
                    onPress: () => Linking.openURL('https://github.com/your-repo'),
                },
            ]
        );
    };

    return (
        <View style={styles.mainContainer}>
            <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>การตั้งค่า</Text>
                    <Text style={styles.headerSubtitle}>จัดการการตั้งค่าแอปพลิเคชันของคุณ</Text>
                </View>

                {/* User Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>บัญชีผู้ใช้</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={handleGoToProfile}>
                        <View style={styles.menuIconContainer}>
                            <User color="#10b981" size={22} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>โปรไฟล์</Text>
                            <Text style={styles.menuSubtitle}>จัดการข้อมูลส่วนตัว</Text>
                        </View>
                        <ChevronRight color="#94a3b8" size={20} />
                    </TouchableOpacity>
                </View>

                {/* App Settings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>การตั้งค่าแอป</Text>

                    <View style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Bell color="#10b981" size={22} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>การแจ้งเตือน</Text>
                            <Text style={styles.menuSubtitle}>เปิดการแจ้งเตือนผลลัพธ์</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: '#cbd5e1', true: '#6ee7b7' }}
                            thumbColor={Platform.OS === 'ios' ? '#10b981' : notificationsEnabled ? '#10b981' : '#f1f5f9'}
                        />
                    </View>

                    <View style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <MapPin color="#10b981" size={22} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>บันทึกตำแหน่ง</Text>
                            <Text style={styles.menuSubtitle}>บันทึกตำแหน่งที่สแกน</Text>
                        </View>
                        <Switch
                            value={saveLocation}
                            onValueChange={setSaveLocation}
                            trackColor={{ false: '#cbd5e1', true: '#6ee7b7' }}
                            thumbColor={Platform.OS === 'ios' ? '#10b981' : saveLocation ? '#10b981' : '#f1f5f9'}
                        />
                    </View>

                    <View style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Camera color="#10b981" size={22} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>ภาพคุณภาพสูง</Text>
                            <Text style={styles.menuSubtitle}>ใช้ภาพความละเอียดสูง (ใช้ข้อมูลมากขึ้น)</Text>
                        </View>
                        <Switch
                            value={highQualityImages}
                            onValueChange={setHighQualityImages}
                            trackColor={{ false: '#cbd5e1', true: '#6ee7b7' }}
                            thumbColor={Platform.OS === 'ios' ? '#10b981' : highQualityImages ? '#10b981' : '#f1f5f9'}
                        />
                    </View>

                    <TouchableOpacity style={styles.menuItem} onPress={handleShowDisclaimer}>
                        <View style={styles.menuIconContainer}>
                            <Shield color="#10b981" size={22} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>ข้อความปฏิเสธความรับผิดชอบ</Text>
                            <Text style={styles.menuSubtitle}>อ่านข้อความปฏิเสธความรับผิดชอบ</Text>
                        </View>
                        <View style={styles.menuRight}>
                            <ChevronRight color="#94a3b8" size={20} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ช่วยเหลือ</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <HelpCircle color="#10b981" size={22} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>ศูนย์ช่วยเหลือ</Text>
                            <Text style={styles.menuSubtitle}>คำถามที่พบบ่อย</Text>
                        </View>
                        <ChevronRight color="#94a3b8" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Globe color="#10b981" size={22} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>ภาษา</Text>
                            <Text style={styles.menuSubtitle}>ภาษาไทย</Text>
                        </View>
                        <ChevronRight color="#94a3b8" size={20} />
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>เกี่ยวกับ</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
                        <View style={styles.menuIconContainer}>
                            <Info color="#10b981" size={22} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>เกี่ยวกับแอป</Text>
                            <Text style={styles.menuSubtitle}>เวอร์ชัน 1.0.0</Text>
                        </View>
                        <ChevronRight color="#94a3b8" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                    <LogOut color="#ef4444" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>ออกจากระบบ</Text>
                </TouchableOpacity>

                {/* Bottom Padding for Tab Bar */}
                <View style={{ height: 100 }} />
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
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 24,
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 20,
        marginBottom: 8,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 16,
        color: '#0f172a',
    },
    menuSubtitle: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fef2f2',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
        marginTop: 12,
    },
    logoutText: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 16,
        color: '#ef4444',
    },
});
