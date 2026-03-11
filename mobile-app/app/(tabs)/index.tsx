import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, ShieldCheck } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.badgeContainer}>
               <ShieldCheck color="#10b981" size={20} />
               <Text style={styles.badgeText}>AI Safety Scanner</Text>
            </View>
            <Text style={styles.title}>Gin dai MAI!</Text>
            <Text style={styles.subtitle}>Scan your food before eating to check for safety and get nutritional insights.</Text>
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
                   <Text style={styles.cardTitleLight}>Take a Photo</Text>
                   <Text style={styles.cardDescLight}>Use your camera to scan food instantly</Text>
                </View>
             </TouchableOpacity>

             <TouchableOpacity
                style={styles.cardSecondary}
                onPress={() => {
                  // TODO: Pick from gallery using expo-image-picker
                }}
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
                   <Text style={styles.cardTitleDark}>Upload Image</Text>
                   <Text style={styles.cardDescDark}>Choose a photo from your gallery</Text>
                </View>
             </TouchableOpacity>
          </View>
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
    paddingBottom: 120,
  },
  header: {
    marginBottom: 40,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
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
