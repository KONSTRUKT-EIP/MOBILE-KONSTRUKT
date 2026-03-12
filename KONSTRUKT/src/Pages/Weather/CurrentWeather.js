import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CurrentWeatherCard = ({ data, getWeatherInfo }) => {
  const info = getWeatherInfo(data.weatherDescription);
  
  return (
    <View style={styles.currentCard}>
      <View style={styles.currentMain}>
        <View>
          <Text style={styles.tempText}>{data.temperature ?? 'N/A'}°C</Text>
          <Text style={styles.descText}>{data.weatherDescription}</Text>
          <Text style={styles.feelsText}>Ressenti {data.feelsLike}°C</Text>
        </View>
        <MaterialCommunityIcons name={info.icon} size={70} color={info.color} />
      </View>

      <View style={styles.gridContainer}>
        <StatItem emoji="💧" label="Humidité" val={`${data.humidity}%`} bg="#f0fdf4" />
        <StatItem emoji="🌬️" label="Vent" val={`${data.windSpeed} km/h`} bg="#eff6ff" />
        <StatItem emoji="🌧️" label="Pluie" val={`${data.precipitation ?? 0} mm`} bg="#ecfeff" mt={10} />
        <StatItem emoji="🧭" label="Direction" val={`${data.windDirection ?? 'N/A'}°`} bg="#eef2ff" mt={10} />
      </View>
    </View>
  );
};

const StatItem = ({ emoji, label, val, bg, mt }) => (
  <View style={[styles.gridItem, { backgroundColor: bg, marginTop: mt || 0 }]}>
    <Text style={styles.gridEmoji}>{emoji}</Text>
    <Text style={styles.gridLabel}>{label}</Text>
    <Text style={styles.gridVal}>{val}</Text>
  </View>
);

const styles = StyleSheet.create({
  currentCard: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    elevation: 3,
  },

  currentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  tempText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  descText: {
    fontSize: 18,
    color: '#4b5563',
    textTransform: 'capitalize',
  },

  feelsText: {
    fontSize: 14,
    color: '#9ca3af',
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  gridItem: {
    width: '48%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 15,
  },

  gridEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },

  gridLabel: {
    fontSize: 11,
    color: '#64748b',
  },

  gridVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
});

export default CurrentWeatherCard;