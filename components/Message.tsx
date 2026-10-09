import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface MessageProps {
  text: string;
  type?: 'success' | 'error' | '';
}

export default function Message({ text, type = '' }: MessageProps) {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          type === 'success' && styles.success,
          type === 'error' && styles.error,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    padding: 10,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    color: Colors.text,
    textAlign: 'center',
    fontSize: 16,
  },
  success: {
    color: Colors.success,
  },
  error: {
    color: Colors.error,
  },
});
