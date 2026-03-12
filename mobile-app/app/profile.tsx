import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Platform,
    Alert,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
    ArrowLeft,
    Camera,
    User,
    Mail,
    Save,
    X,
    Pencil,
    Shield,
    Bell,
    Globe,
    Check,
} from 'lucide-react-native';
import { supabase } from '../src/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { apiService } from '../src/services/api';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    async function loadUserProfile() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
                router.replace('/auth');
                return;
            }

            setUser(session.user);
            setEmail(session.user.email || '');
            setDisplayName(session.user.user_metadata?.display_name || session.user.user_metadata?.full_name || '');
            setAvatarUrl(session.user.user_metadata?.avatar_url || null);
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        } finally {
            setLoading(false);
        }
    }

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert(
                    'ต้องการสิทธิ์',
                    'แอปต้องการสิทธิ์ในการเข้าถึงรูปภาพเพื่ออัปโหลดรูปโปรไฟล์',
                    [{ text: 'ตกลง' }]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAvatarUrl(result.assets[0].uri);
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
        }
    };

    const uploadAvatar = async (uri: string) => {
        setSaving(true);
        try {
            // Upload to Supabase Storage
            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

            const formData = new FormData();
            formData.append('file', {
                uri,
                name: fileName,
                type: `image/${fileExt}`,
            } as any);

            // Get presigned URL from backend or upload directly
            // For now, we'll just update the metadata with local URI
            // In production, you should upload to Supabase Storage first
            
            const { error } = await supabase.auth.updateUser({
                data: {
                    avatar_url: uri,
                    display_name: displayName,
                },
            });

            if (error) throw error;

            Alert.alert('สำเร็จ', 'อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    display_name: displayName,
                },
            });

            if (error) throw error;

            Alert.alert('สำเร็จ', 'บันทึกข้อมูลเรียบร้อยแล้ว');
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error saving profile:', error);
            Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setDisplayName(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '');
        setIsEditing(false);
    };

    if (loading) {
        return (
            <View style={styles.mainContainer}>
                <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={StyleSheet.absoluteFillObject} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color="#0f172a" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>โปรไฟล์</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <User color="#94a3b8" size={48} />
                            </View>
                        )}
                        <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage} disabled={saving}>
                            <Camera color="#fff" size={18} />
                        </TouchableOpacity>
                    </View>
                    {saving && (
                        <View style={styles.savingIndicator}>
                            <ActivityIndicator size="small" color="#10b981" />
                            <Text style={styles.savingText}>กำลังบันทึก...</Text>
                        </View>
                    )}
                </View>

                {/* Profile Info Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>
                        {!isEditing ? (
                            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                                <Pencil color="#10b981" size={18} />
                                <Text style={styles.editButtonText}>แก้ไข</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.editActions}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                                    <X color="#64748b" size={18} />
                                    <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={handleSaveProfile}
                                    disabled={saving}
                                >
                                    <Check color="#fff" size={18} />
                                    <Text style={styles.saveButtonText}>บันทึก</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Display Name */}
                    <View style={styles.field}>
                        <View style={styles.fieldIcon}>
                            <User color="#64748b" size={20} />
                        </View>
                        <View style={styles.fieldContent}>
                            <Text style={styles.fieldLabel}>ชื่อที่แสดง</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.fieldInput}
                                    value={displayName}
                                    onChangeText={setDisplayName}
                                    placeholder="กรอกชื่อที่แสดง"
                                    placeholderTextColor="#94a3b8"
                                />
                            ) : (
                                <Text style={styles.fieldValue}>
                                    {displayName || 'ยังไม่ได้ตั้งค่า'}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Email (Read-only) */}
                    <View style={styles.field}>
                        <View style={styles.fieldIcon}>
                            <Mail color="#64748b" size={20} />
                        </View>
                        <View style={styles.fieldContent}>
                            <Text style={styles.fieldLabel}>อีเมล</Text>
                            <Text style={styles.fieldValue}>{email || 'ไม่มีอีเมล'}</Text>
                        </View>
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>การตั้งค่า</Text>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Bell color="#10b981" size={20} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>การแจ้งเตือน</Text>
                            <Text style={styles.menuSubtitle}>จัดการการแจ้งเตือน</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Globe color="#10b981" size={20} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>ภาษา</Text>
                            <Text style={styles.menuSubtitle}>ภาษาไทย</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Shield color="#10b981" size={20} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>ความเป็นส่วนตัว</Text>
                            <Text style={styles.menuSubtitle}>นโยบายความเป็นส่วนตัว</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Account Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>ข้อมูลบัญชี</Text>
                    <Text style={styles.infoText}>
                        บัญชีของคุณถูกจัดการโดย Supabase Authentication
                        การเปลี่ยนอีเมลหรือรหัสผ่านต้องทำผ่านหน้าการตั้งค่าบัญชี
                    </Text>
                </View>

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 16,
        color: '#64748b',
        marginTop: 12,
    },

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#fff',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f1f5f9',
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    changeAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    savingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    savingText: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 14,
        color: '#64748b',
    },

    // Section
    section: {
        backgroundColor: '#fff',
        marginTop: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 16,
        color: '#0f172a',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f0fdf4',
        borderRadius: 8,
    },
    editButtonText: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#10b981',
    },
    editActions: {
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    cancelButtonText: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#64748b',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#10b981',
        borderRadius: 8,
    },
    saveButtonText: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 14,
        color: '#fff',
    },

    // Field
    field: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    fieldIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fieldContent: {
        flex: 1,
    },
    fieldLabel: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 13,
        color: '#94a3b8',
        marginBottom: 4,
    },
    fieldValue: {
        fontFamily: 'Kanit_600SemiBold',
        fontSize: 16,
        color: '#0f172a',
    },
    fieldInput: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 16,
        color: '#0f172a',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingVertical: 4,
    },

    // Menu Items
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
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
        fontSize: 15,
        color: '#0f172a',
    },
    menuSubtitle: {
        fontFamily: 'Kanit_400Regular',
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 2,
    },

    // Info Card
    infoCard: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
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
