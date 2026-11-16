import React, { useMemo } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';

interface Props {
  searchCity: string;
  setSearchCity: (city: string) => void;
  handleSearch: () => void;
}

const WeatherSearch: React.FC<Props> = ({ searchCity, setSearchCity, handleSearch }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.searchCard}>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name="map-marker" size={20} color={colors.muted} />
        <TextInput 
          style={styles.input}
          value={searchCity}
          onChangeText={setSearchCity}
          placeholder="Ville du chantier..."
        />
      </View>
      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchBtnText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 15,
    elevation: 2,
  },

  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: colors.background,
    borderRadius: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 5,
    fontSize: 15,
  },

  searchBtn: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#2563eb',
    borderRadius: 10,
  },

  searchBtnText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default WeatherSearch;