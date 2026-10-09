import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
const Header = require('../components/Header').default;
const Timer = require('../components/Timer').default;
const Message = require('../components/Message').default;
import { Colors } from '../constants/Colors';
import answersData from '../data/ans-Passcode.json';
import { useFocusEffect } from 'expo-router';

const passcodeMusic = require('../assets/bgm-passcode.mp3');
const tickingSound = require('../assets/ticking.mp3');

export default function PasscodeScreen() {
  const [message, setMessage] = useState('Find the passcode to escape!');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [inputValue, setInputValue] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [penalty, setPenalty] = useState(0);
  const [escaped, setEscaped] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const musicRef = useRef<Audio.Sound | null>(null);
  const tickRef = useRef<Audio.Sound | null>(null);
  const tickingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const musicStarted = useRef(false);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Screen is focused
      return () => {
        // Screen loses focus (you switched tab) → stop audio + timer
        stopAllAudio();
        setTimerRunning(false);
      };
    }, [])
  );

  const stopAllAudio = async () => {
    try {
      if (musicRef.current) {
        await musicRef.current.stopAsync();
        await musicRef.current.unloadAsync();
        musicRef.current = null;
      }
      if (tickRef.current) {
        await tickRef.current.stopAsync();
        await tickRef.current.unloadAsync();
        tickRef.current = null;
      }
      if (tickingIntervalRef.current) {
        clearInterval(tickingIntervalRef.current);
        tickingIntervalRef.current = null;
      }
      musicStarted.current = false;
    } catch (e) {
      console.log('stop audio error', e);
    }
  };

  const startAudio = async () => {
    if (musicStarted.current) return;
    musicStarted.current = true;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: music } = await Audio.Sound.createAsync(
        passcodeMusic,
        { isLooping: true, volume: 0.4 }
      );
      musicRef.current = music;
      await music.playAsync();

      const playTicking = async () => {
        try {
          const { sound: tick } = await Audio.Sound.createAsync(
            tickingSound,
            { volume: 0.5 }
          );
          tickRef.current = tick;
          await tick.playAsync();
          tick.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              tick.unloadAsync();
            }
          });
        } catch {}
      };
      playTicking();
      tickingIntervalRef.current = setInterval(playTicking, 180000);
    } catch (e) {
      console.log('Audio error', e);
    }
  };

  const handleStart = () => {                                     // ← new
    if (gameStarted || timeUp) return;
      setGameStarted(true);
      startAudio();
      setTimerRunning(true);
  };

  const checkAnswer = () => {
    if (timeUp || escaped || !gameStarted) return;
    setBtnDisabled(true);
    setTimeout(() => setBtnDisabled(false), 3000);

    const correct = answersData.answer1 || '';

    if (inputValue.trim() === correct) {
      setMessage('Correct! You found the passcode!');
      setMessageType('success');
      setEscaped(true);
      setTimerRunning(false);
    } else {
      setMessage('Wrong answer. Try again!');
      setMessageType('error');
      setPenalty((p) => p + 1);
    }
  };

  const onExpire = () => {
    setTimeUp(true);
    setTimerRunning(false);
    stopAllAudio();
    setMessage("💀 Time's up! You are trapped!");
    setMessageType('error');
  };

  if (escaped) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.container}>
          <Text style={styles.title}>You Have Escaped!</Text>
          <Message text="Passcode accepted. Freedom awaits!" type="success" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {gameStarted && (                                         // ← only show timer after Start
                  <Timer
                    duration={3600}
                    running={timerRunning}
                    onExpire={onExpire}
                    penaltyTrigger={penalty}
                  />
        )}
        <View style={styles.container}>
          <Text style={styles.subtitle}>Finding Passcode</Text>
          <Message text={message} type={messageType} />
          <Text style={styles.title}>Welcome to the Escape Room</Text>

          {!timeUp && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Enter the Passcode</Text>
              <Text style={styles.hint}>Solve the clues to find the 5-digit code</Text>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Enter passcode"
                placeholderTextColor="#8b6a3f"
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!timeUp && gameStarted}
                maxLength={10}
              />
              <TouchableOpacity
                style={[styles.button, btnDisabled && styles.buttonDisabled]}
                onPress={checkAnswer}
                disabled={btnDisabled || timeUp || !gameStarted}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>

              {!gameStarted && !timeUp && (
                <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                  <Text style={styles.startButtonText}>▶  Start</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  startButton: {
    marginTop: 24,
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  container: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 20,
    backgroundColor: Colors.containerBg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },
  subtitle: {
    color: Colors.accentSecondary,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  title: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    textShadowColor: 'rgba(255, 204, 102, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  section: {
    backgroundColor: Colors.sectionBg,
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  sectionTitle: {
    color: Colors.sectionText,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hint: {
    color: Colors.sectionText,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 10,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#8b6a3f',
    borderRadius: 6,
    padding: 12,
    color: Colors.text,
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    letterSpacing: 3,
  },
  button: {
    backgroundColor: Colors.buttonGradientStart,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff3d6',
    fontSize: 16,
    fontWeight: '600',
  },
});
