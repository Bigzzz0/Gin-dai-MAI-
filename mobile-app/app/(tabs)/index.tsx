import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, ShieldCheck, LogOut } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../src/lib/supabase';
import { useStore } from '../../src/store/useStore';

export default function HomeScreen() {
  const router = useRouter();
  const { setCurrentImageUri } = useStore();

  const handleLogout = async () => {
    Alert.alert('ออกจากระบบ', 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
      }}
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ปฏิเสธการเข้าถึง', 'ขออภัย เราต้องขออนุญาตเข้าถึงรูปภาพเพื่อใช้งานส่วนนี้!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCurrentImageUri(result.assets[0].uri);
      router.push('/preview');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
                <View style={styles.badgeContainer}>
                   <ShieldCheck color="#10b981" size={20} />
                   <Text style={styles.badgeText}>สแกนเนอร์ความปลอดภัย AI</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <LogOut color="#64748b" size={22} />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Gin dai MAI!</Text>
            <Text style={styles.subtitle}>สแกนอาหารก่อนทานเพื่อเช็กความปลอดภัย!</Text>
          </View>

          <View style={styles.cardsContainer}>
             <TouchableOpacity
                style={styles.cardPrimary}
                onPress={() => router.push('/camera')}
                activeOpacity={0.8}
             >
                <LinearGradient
                   colors={['#10b981', '#059669']}
                   style={StyleSheet.absoluteFillObject}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 1, y: 1 }}
                />
                <View style={styles.cardContent}>
                   <View style={styles.iconContainerLight}>
                      <Camera color="#10b981" size={32} />
                   </View>
                   <Text style={styles.cardTitleLight}>ถ่ายภาพ</Text>
                   <Text style={styles.cardDescLight}>ใช้กล้องของคุณเพื่อสแกนอาหารทันที</Text>
                </View>
             </TouchableOpacity>

             <TouchableOpacity
                style={styles.cardSecondary}
                onPress={pickImage}
                activeOpacity={0.7}
             >
                {Platform.OS === 'ios' ? (
                    <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.8)' }]} />
                )}
                <View style={styles.cardContent}>
                   <View style={styles.iconContainerDark}>
                      <ImageIcon color="#64748b" size={28} />
                   </View>
                   <Text style={styles.cardTitleDark}>อัปโหลดรูปภาพ</Text>
                   <Text style={styles.cardDescDark}>เลือกรูปภาพจากแกลเลอรีของคุณ</Text>
                </View>
             </TouchableOpacity>
          </View>
          
          {/* Spacer to avoid tab bar overlap */}
          <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
    paddingBottom: 160,
  },
  header: {
    marginBottom: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: 'Kanit_700Bold',
    color: '#10b981',
    fontSize: 14,
    marginLeft: 6,
  },
  title: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 40,
    color: '#0f172a',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 20,
  },
  cardPrimary: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardSecondary: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    backgroundColor: Platform.OS !== 'ios' ? 'white' : 'transparent',
  },
  cardContent: {
    padding: 24,
  },
  iconContainerLight: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerDark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleLight: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 8,
  },
  cardDescLight: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  cardTitleDark: {
    fontFamily: 'Kanit_700Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
  },
  cardDescDark: {
    fontFamily: 'Kanit_400Regular',
    fontSize: 15,
    color: '#64748b',
  },
});
