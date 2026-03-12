import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import api from '../../API/Api';
import WeatherSearch from './WeatherSearch';
import CurrentWeatherCard from './CurrentWeather';
import ForecastSection from './ForecastWeather';

const WeatherPage = () => {
  const [city, setCity] = useState("Paris");
  const [searchCity, setSearchCity] = useState("Paris");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(timeString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return 'N/A'; }
  };

  const getWeatherInfo = (description) => {
    const desc = description?.toLowerCase() || '';
    if (desc.includes('pluie')) return { icon: 'weather-pouring', color: '#60a5fa' };
    if (desc.includes('soleil') || desc.includes('clair')) return { icon: 'weather-sunny', color: '#fbbf24' };
    return { icon: 'weather-cloudy', color: '#94a3b8' };
  };

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      const res = await api.get(`/weather/forecast`, { params: { city: cityName } });
      setWeatherData(res.data);
      setError(null);
    } catch (err) {
      setError(`Impossible de récupérer la météo pour "${cityName}"`);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchWeather(city); }, [city]);

  const handleSearch = () => {
    if (searchCity.trim()) {
      setCity(searchCity.trim());
      Keyboard.dismiss();
    }
  };

  if (loading && !weatherData) return <View style={styles.loader}><ActivityIndicator size="large" color="#c2410c" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.brandText}>KONSTRUKT</Text>
        <Text style={styles.headerTitle}>Météo & Alertes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled={true}>
        <WeatherSearch searchCity={searchCity} setSearchCity={setSearchCity} handleSearch={handleSearch} />
        
        {error && <Text style={styles.errorText}>{error}</Text>}

        {weatherData && (
          <>
            <CurrentWeatherCard data={weatherData.current} getWeatherInfo={getWeatherInfo} />
            <ForecastSection daily={weatherData.daily} getWeatherInfo={getWeatherInfo} formatTime={formatTime} />
          </>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    padding: 15,
    flexGrow: 1,
  },

  headerBanner: {
    padding: 25,
    paddingTop: 50,
    backgroundColor: '#2563eb',
  },

  brandText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#bfdbfe',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default WeatherPage;