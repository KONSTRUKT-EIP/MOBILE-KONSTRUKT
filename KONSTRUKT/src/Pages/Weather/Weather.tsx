import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import api from '../../API/Api';
import WeatherSearch from './WeatherSearch';
import CurrentWeatherCard from './CurrentWeather';
import ForecastSection from './ForecastWeather';
import { WeatherData, WeatherInfo } from '../../Types/Weather';

/**
 * Page principale de la météo
 * Gère l'état global des données météo et la recherche par ville.
 */
const WeatherPage: React.FC = () => {
  // États typés pour la gestion de la ville et des données
  const [city, setCity] = useState<string>("Paris");
  const [searchCity, setSearchCity] = useState<string>("Paris");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Formate les strings ISO en heure lisible (HH:MM)
   */
  const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';
    try {
      return new Date(timeString).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch { 
      return 'N/A'; 
    }
  };

  /**
   * Détermine l'icône et la couleur en fonction de la description météo
   */
  const getWeatherInfo = (description: string): WeatherInfo => {
    const desc = description?.toLowerCase() || '';
    if (desc.includes('pluie')) return { icon: 'weather-pouring', color: '#60a5fa' };
    if (desc.includes('soleil') || desc.includes('clair')) return { icon: 'weather-sunny', color: '#fbbf24' };
    return { icon: 'weather-cloudy', color: '#94a3b8' };
  };

  /**
   * Récupère les données depuis le backend
   */
  const fetchWeather = async (cityName: string) => {
    try {
      setLoading(true);
      // Appel API typé avec l'interface WeatherData
      const res = await api.get<WeatherData>(`/weather/forecast`, { 
        params: { city: cityName } 
      });
      setWeatherData(res.data);
      setError(null);
    } catch (err) {
      setError(`Impossible de récupérer la météo pour "${cityName}"`);
    } finally { 
      setLoading(false); 
    }
  };

  // Chargement initial et à chaque changement de ville
  useEffect(() => { 
    fetchWeather(city); 
  }, [city]);

  /**
   * Déclenche la recherche et ferme le clavier
   */
  const handleSearch = () => {
    if (searchCity.trim()) {
      setCity(searchCity.trim());
      Keyboard.dismiss();
    }
  };

  // Affichage du loader lors du chargement initial
  if (loading && !weatherData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#c2410c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bannière d'en-tête */}
      <View style={styles.headerBanner}>
        <Text style={styles.brandText}>KONSTRUKT</Text>
        <Text style={styles.headerTitle}>Météo & Alertes</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        nestedScrollEnabled={true}
      >
        {/* Barre de recherche */}
        <WeatherSearch 
          searchCity={searchCity} 
          setSearchCity={setSearchCity} 
          handleSearch={handleSearch} 
        />
        
        {/* Affichage des erreurs éventuelles */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Affichage des composants météo si les données sont présentes */}
        {weatherData && (
          <>
            <CurrentWeatherCard 
              data={weatherData.current} 
              getWeatherInfo={getWeatherInfo} 
            />
            <ForecastSection 
              daily={weatherData.daily} 
              getWeatherInfo={getWeatherInfo} 
              formatTime={formatTime} 
            />
          </>
        )}
        
        {/* Espace de sécurité en bas pour le scroll */}
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