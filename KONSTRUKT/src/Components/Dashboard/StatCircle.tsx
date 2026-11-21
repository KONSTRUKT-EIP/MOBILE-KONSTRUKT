import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../Theme/ThemeContext';
import { ThemeColors } from '../../Theme/colors';

interface StatCircleProps {
  percentage: number;
  color: string;
  label?: string; // Optionnel car non présent partout
}

const StatCircle: React.FC<StatCircleProps> = ({ percentage, color, label }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { alignItems: 'center', marginHorizontal: 10 },
  svgContainer: { position: 'relative', width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  svg: { transform: [{ rotate: '-90deg' }] },
  textOverlay: { position: 'absolute' },
  percentageText: { fontSize: 14, fontWeight: 'bold', color: colors.text },
  label: { marginTop: 8, fontSize: 12, fontWeight: '600', color: colors.muted },
});

export default StatCircle;