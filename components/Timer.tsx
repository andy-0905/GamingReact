import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/Colors';

interface TimerProps {
  duration?: number;
  onExpire?: () => void;
  running: boolean;
  penaltyTrigger?: number; // increment this to apply a 120s penalty
}

export default function Timer({ duration = 3600, onExpire, running, penaltyTrigger = 0 }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [penaltyDisplay, setPenaltyDisplay] = useState(0);
  const penaltyAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTrigger = useRef(0);

  // Handle penalty
  useEffect(() => {
    if (penaltyTrigger > prevTrigger.current) {
      prevTrigger.current = penaltyTrigger;
      setTimeLeft((prev) => Math.max(0, prev - 120));
      setPenaltyDisplay(120);
      penaltyAnim.setValue(1);
      Animated.timing(penaltyAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [penaltyTrigger]);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onExpire?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (!running && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [running]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

  const minsP = Math.floor(penaltyDisplay / 60);
  const secsP = penaltyDisplay % 60;
  const penaltyText = `-${minsP}:${secsP < 10 ? '0' + secsP : secsP}`;

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>⏳ Time left: {formatted}</Text>
      <Animated.Text
        style={[
          styles.penalty,
          {
            opacity: penaltyAnim,
            transform: [
              {
                translateY: penaltyAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        {penaltyText}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.accent,
    textShadowColor: 'rgba(255, 204, 102, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  penalty: {
    position: 'absolute',
    right: -50,
    top: 50,
    color: Colors.penalty,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
