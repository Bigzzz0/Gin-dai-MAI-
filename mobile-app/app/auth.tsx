import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { apiService } from '../src/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail } from 'lucide-react-native';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

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
        Alert.alert('Success', 'Please check your inbox for email verification!');
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
                <Text style={styles.logo}>📸 🍲</Text>
                <Text style={styles.title}>Gin dai MAI!</Text>
                <Text style={styles.subtitle}>{isLogin ? 'Welcome back! Let\'s eat safe.' : 'Join us to eat safely.'}</Text>
            </View>

            <View style={styles.formContainer}>
               <View style={styles.inputWrapper}>
                  <Mail color="#a0a0a0" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Email Address"
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
                    placeholder="Password"
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
                        <Text style={styles.buttonTextLight}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleTextPreview}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </Text>
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                         <Text style={styles.toggleTextAction}>
                             {isLogin ? "Sign Up" : "Sign In"}
                         </Text>
                     </TouchableOpacity>
                </View>
            </View>
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
  logo: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
      fontSize: 32,
      fontWeight: '800',
      color: '#1e293b',
      marginBottom: 6,
      letterSpacing: -0.5,
  },
  subtitle: {
      fontSize: 15,
      color: '#64748b',
      textAlign: 'center',
      fontWeight: '500',
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
      flex: 1,
      height: '100%',
      fontSize: 16,
      color: '#0f172a',
      fontWeight: '500',
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
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
  },
  toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
  },
  toggleTextPreview: {
      color: '#64748b',
      fontSize: 15,
      fontWeight: '500'
  },
  toggleTextAction: {
      color: '#10b981',
      fontSize: 15,
      fontWeight: '700'
  }
});
