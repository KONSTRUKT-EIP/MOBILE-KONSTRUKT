import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';
import { ForecastDay, WeatherInfo } from '../../Types/Weather'; // Majuscule ici !

const SunRow: React.FC<{ emoji: string; time: string; isToday: boolean }> = ({ emoji, time, isToday }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.sunRow}>
      <Text style={styles.sunEmoji}>{emoji}</Text>
      <Text style={[styles.sunTime, isToday && { color: '#FFF' }]}>{time}</Text>
    </View>
  );
};

interface Props {
  daily: ForecastDay[];
  getWeatherInfo: (desc: string) => WeatherInfo;
  formatTime: (time: string) => string;
}

const ForecastSection: React.FC<Props> = ({ daily, getWeatherInfo, formatTime }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View>
      <Text style={styles.sectionTitle}>Prévisions 7 jours</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
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
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: colors.text },
  forecastScroll: { flexDirection: 'row', marginBottom: 20 },
  dayCard: { width: 110, padding: 12, marginRight: 10, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 15, borderWidth: 1, borderColor: colors.border },
  todayCard: { backgroundColor: '#2563eb', borderColor: '#1d4ed8' },
  dayName: { fontSize: 12, fontWeight: 'bold', color: colors.muted },
  dayTemp: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  dayMinTemp: { fontSize: 13, color: colors.muted },
  whiteText: { color: '#ffffff' },
  blueText: { color: '#bfdbfe' },
  sunInfoContainer: { width: '100%', marginTop: 12, paddingTop: 8, alignItems: 'center' },
  daySunBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  todaySunBorder: { borderTopWidth: 1, borderTopColor: '#60a5fa' },
  sunRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sunEmoji: { fontSize: 12, marginRight: 5 },
  sunTime: { fontSize: 11, fontWeight: '500', color: colors.muted },
});

export default ForecastSection;