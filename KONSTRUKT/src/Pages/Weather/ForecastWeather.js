import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ForecastSection = ({ daily, getWeatherInfo, formatTime }) => (
  <View>
    <Text style={styles.sectionTitle}>Prévisions 7 jours</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll} nestedScrollEnabled={true}>
      {daily.map((day, idx) => {
        const info = getWeatherInfo(day.weatherDescription);
        const isToday = idx === 0;
        return (
          <View key={idx} style={[styles.dayCard, isToday && styles.todayCard]}>
            <Text style={[styles.dayName, isToday && styles.whiteText]}>
              {isToday ? "Auj." : new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
            </Text>
            <MaterialCommunityIcons name={info.icon} size={28} color={isToday ? "#FFF" : "#666"} style={{ marginVertical: 8 }} />
            <Text style={[styles.dayTemp, isToday && styles.whiteText]}>{day.temperatureMax}°</Text>
            <Text style={[styles.dayMinTemp, isToday && styles.blueText]}>{day.temperatureMin}°</Text>
            
            <View style={[styles.sunInfoContainer, isToday ? styles.todaySunBorder : styles.daySunBorder]}>
              <SunRow emoji="☀️" time={formatTime(day.sunrise)} isToday={isToday} />
              <SunRow emoji="🌙" time={formatTime(day.sunset)} isToday={isToday} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  </View>
);

const SunRow = ({ emoji, time, isToday }) => (
  <View style={styles.sunRow}>
    <Text style={styles.sunEmoji}>{emoji}</Text>
    <Text style={[styles.sunTime, isToday && { color: '#FFF' }]}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },

  forecastScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  dayCard: {
    width: 110,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  todayCard: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },

  dayName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  dayTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dayMinTemp: {
    fontSize: 13,
    color: '#64748b',
  },

  whiteText: {
    color: '#ffffff',
  },
  blueText: {
    color: '#bfdbfe',
  },

  sunInfoContainer: {
    width: '100%',
    marginTop: 12,
    paddingTop: 8,
    alignItems: 'center',
  },

  daySunBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  todaySunBorder: {
    borderTopWidth: 1,
    borderTopColor: '#60a5fa',
  },

  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  sunEmoji: {
    fontSize: 12,
    marginRight: 5,
  },

  sunTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
});

export default ForecastSection;