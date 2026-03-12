import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const AnalyticsGraph = ({ data, labels }) => {
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
          backgroundColor: "#FFF",
          backgroundGradientFrom: "#FFF",
          backgroundGradientTo: "#FFF",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chart: {
    marginVertical: 0,
    borderRadius: 16,
    paddingRight: 40 
  }
});

export default AnalyticsGraph;