import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { apiService } from '../src/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, Camera, Utensils } from 'lucide-react-native';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isVerify, setIsVerify] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter your email and password');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
       Alert.alert('Login Failed', error.message);
       setLoading(false);
       return;
    }
    
    // Sync with backend
    try {
        await apiService.syncUser();
    } catch (e) {
        console.error("Failed to sync user with backend", e);
    }
    
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter your email and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters');
      return;
    }
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
        Alert.alert('Sign Up Failed', error.message);
    } else if (!session) {
        // Automatically switch to verify mode
        setIsVerify(true);
        Alert.alert(
          'Check Your Inbox',
          'We sent a 6-digit confirmation code to your email. Please enter it below.'
        );
    } else {
        // Session exists (Confirm Email is disabled)
        try {
            await apiService.syncUser();
        } catch (e) {
            console.error("Failed to sync user with backend", e);
        }
    }
    setLoading(false);
  }

  async function verifyCode() {
    if (!otp) {
        Alert.alert('Required', 'Please enter your 6-digit code');
        return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
    });

    if (error) {
        Alert.alert('Verification Failed', error.message);
    } else {
        try {
            await apiService.syncUser();
        } catch (e) {
            console.error("Failed to sync user with backend", e);
        }
    }
    setLoading(false);
  }

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#11998E', '#38EF7D']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
      >
        <View style={styles.card}>
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <Camera color="#10b981" size={40} />
                    <Utensils color="#10b981" size={40} />
                </View>
                <Text style={styles.title}>Gin dai MAI!</Text>
                <Text style={styles.subtitle}>{isLogin ? 'ยินดีต้อนรับกลับมา! ทานอาหารให้ปลอดภัยกันเถอะ' : 'มาร่วมทานอาหารอย่างปลอดภัยกัน'}</Text>
            </View>

            {isVerify ? (
              <View style={styles.formContainer}>
                 <View style={styles.inputWrapper}>
                    <Lock color="#a0a0a0" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      onChangeText={setOtp}
                      value={otp}
                      placeholder="รหัส 6 หลัก"
                      placeholderTextColor="#a0a0a0"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                 </View>
                 <TouchableOpacity
                      style={styles.buttonPrimary}
                      onPress={verifyCode}
                      disabled={loading}
                      activeOpacity={0.8}
                  >
                      {loading ? (
                           <ActivityIndicator size="small" color="#fff" />
                      ) : (
                          <Text style={styles.buttonTextLight}>ยืนยันอีเมล</Text>
                      )}
                  </TouchableOpacity>
                  <View style={styles.toggleContainer}>
                      <TouchableOpacity onPress={() => setIsVerify(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                           <Text style={styles.toggleTextAction}>กลับไปหน้าเข้าสู่ระบบ</Text>
                       </TouchableOpacity>
                  </View>
              </View>
            ) : (
              <View style={styles.formContainer}>
                 <View style={styles.inputWrapper}>
                    <Mail color="#a0a0a0" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      onChangeText={setEmail}
                      value={email}
                      placeholder="อีเมล"
                      placeholderTextColor="#a0a0a0"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                 </View>

                 <View style={styles.inputWrapper}>
                    <Lock color="#a0a0a0" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      onChangeText={setPassword}
                      value={password}
                      secureTextEntry
                      placeholder="รหัสผ่าน"
                      placeholderTextColor="#a0a0a0"
                      autoCapitalize="none"
                    />
                 </View>
                  
                 <TouchableOpacity
                      style={styles.buttonPrimary}
                      onPress={() => isLogin ? signInWithEmail() : signUpWithEmail()}
                      disabled={loading}
                      activeOpacity={0.8}
                  >
                      {loading ? (
                           <ActivityIndicator size="small" color="#fff" />
                      ) : (
                          <Text style={styles.buttonTextLight}>{isLogin ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}</Text>
                      )}
                  </TouchableOpacity>

                  <View style={styles.toggleContainer}>
                      <Text style={styles.toggleTextPreview}>
                          {isLogin ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้วใช่ไหม? "}
                      </Text>
                      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                           <Text style={styles.toggleTextAction}>
                               {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                           </Text>
                       </TouchableOpacity>
                  </View>
              </View>
            )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContainer: {
     alignItems: 'center',
     marginBottom: 35,
  },
  logoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 24,
  },
  title: {
      fontFamily: 'Kanit_700Bold',
      fontSize: 32,
      color: '#1e293b',
      marginBottom: 6,
      letterSpacing: -0.5,
  },
  subtitle: {
      fontFamily: 'Kanit_400Regular',
      fontSize: 15,
      color: '#64748b',
      textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
      fontFamily: 'Kanit_400Regular',
      flex: 1,
      height: '100%',
      fontSize: 16,
      color: '#0f172a',
  },
  buttonPrimary: {
      backgroundColor: '#10b981',
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
  },
  buttonTextLight: {
      fontFamily: 'Kanit_700Bold',
      color: '#fff',
      fontSize: 18,
  },
  toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
  },
  toggleTextPreview: {
      fontFamily: 'Kanit_400Regular',
      color: '#64748b',
      fontSize: 15,
  },
  toggleTextAction: {
      fontFamily: 'Kanit_700Bold',
      color: '#10b981',
      fontSize: 15,
  }
});
