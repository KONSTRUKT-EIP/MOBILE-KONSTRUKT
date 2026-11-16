import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';

interface GraphData {
  voiles: number[];
  planchers: number[];
}

interface AnalyticsGraphProps {
  data: GraphData;
  labels: string[];
}

const AnalyticsGraph: React.FC<AnalyticsGraphProps> = ({ data, labels }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data.voiles,
              color: (opacity = 1) => `rgba(129, 140, 248, ${opacity})`,
              strokeWidth: 3
            },
            {
              data: data.planchers,
              color: (opacity = 1) => `rgba(192, 132, 252, ${opacity})`, 
              strokeWidth: 3
            }
          ],
          legend: ["Voiles", "Planchers"]
        }}
        width={Dimensions.get("window").width - 70} 
        height={220}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => isDark ? `rgba(243, 244, 246, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => isDark ? `rgba(156, 163, 175, ${opacity})` : `rgba(102, 102, 102, ${opacity})`,
          propsForDots: { 
            r: "4", 
            strokeWidth: "2", 
            stroke: "#ffa726" 
          },
          propsForLabels: {
            fontSize: 10 
          }
        }}
        bezier 
        style={styles.chart}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chart: { marginVertical: 0, borderRadius: 16, paddingRight: 40 }
});

export default AnalyticsGraph;