import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';
import { RootStackParamList } from '../../../App'; // Import du type défini dans App.tsx

// 1. Typage des Props pour la navigation
type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomePage: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenue sur KONSTRUKT</Text>
        <Text style={styles.subDescription}>
          Connectez-vous pour commencer à explorer votre tableau de bord !
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')} // Navigation typée
          >
            <Text style={styles.signInText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footerText}>© 2026 KONSTRUKT. Tous droits réservés.</Text>
    </SafeAreaView>
  );
};

// ... Styles identiques à la version JS
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: colors.surface, width: '100%', maxWidth: 400, padding: 36, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border, elevation: 4 },
  title: { fontSize: 24, fontWeight: '900', color: '#c2410c', textAlign: 'center', marginBottom: 16 },
  subDescription: { fontSize: 15, color: colors.muted, textAlign: 'center', fontWeight: '500', lineHeight: 22, marginBottom: 32 },
  buttonContainer: { flexDirection: 'column', justifyContent: 'center', width: '100%' },
  signInButton: { backgroundColor: '#c2410c', paddingVertical: 15, borderRadius: 999, width: '100%', alignItems: 'center' },
  signInText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footerText: { position: 'absolute', bottom: 30, color: colors.placeholder, fontSize: 12 },
});

export default WelcomePage;