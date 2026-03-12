import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const StatCircle = ({ percentage, color, label }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width="80" height="80" style={styles.svg}>
          <Circle cx="40" cy="40" r={radius} stroke="#f3f4f6" strokeWidth="8" fill="none" />
          <Circle
            cx="40" cy="40" r={radius}
            stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.textOverlay}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 10,
  },

  svgContainer: {
    position: 'relative',
    width: 80,
    height: 80,

    justifyContent: 'center',
    alignItems: 'center',
  },

  svg: {
    transform: [{ rotate: '-90deg' }],
  },

  textOverlay: {
    position: 'absolute',
  },

  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});

export default StatCircle;