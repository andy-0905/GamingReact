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
import { useFocusEffect } from 'expo-router';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Header = require('../components/Header').default;
const Timer = require('../components/Timer').default;
const Message = require('../components/Message').default;
import { Colors } from '../constants/Colors';

export default function HomeScreen() {
  const [message, setMessage] = useState('Solve all the sections to escape the room!');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [currentQ, setCurrentQ] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Record<string, string>>({});
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

  const handleStart = () => {                                     // ← new
    if (gameStarted || timeUp) return;
    setGameStarted(true);
    startAudio();
    setTimerRunning(true);
  };

  useEffect(() => {
    loadData();
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

  const loadData = async () => {
    const q: Record<string, string> = {};
    const a: Record<string, string> = {};
    for (let i = 1; i <= 5; i++) {
      q[`Question${i}`] = (await AsyncStorage.getItem(`Question${i}`)) || '';
      a[`answer${i}`] = (await AsyncStorage.getItem(`answer${i}`)) || '';
    }
    setQuestions(q);
    setAnswers(a);
  };

  const startAudio = async () => {
    if (musicStarted.current) return;
    musicStarted.current = true;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound: music } = await Audio.Sound.createAsync(
        require('../assets/bgm.mp3'),
        { isLooping: true, volume: 0.4 }
      );
      musicRef.current = music;
      await music.playAsync();

      // Ticking every 3 min
      const playTicking = async () => {
        try {
          const { sound: tick } = await Audio.Sound.createAsync(
            require('../assets/ticking.mp3'),
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

  const checkAnswer = () => {
    if (timeUp || escaped || !gameStarted) return;
    setBtnDisabled(true);
    setTimeout(() => setBtnDisabled(false), 3000);

    const correct = answers[`answer${currentQ}`];
    if (!correct) {
      setMessage('No answer saved for this question. Please input your answers first.');
      setMessageType('error');
      return;
    }

    if (inputValue.trim() === correct) {
      setMessage('Correct!');
      setMessageType('success');
      setInputValue('');
      if (currentQ >= 5 || !answers[`answer${currentQ + 1}`]) {
        setEscaped(true);
        setTimerRunning(false);
        setMessage('You Have Escaped!');
        setMessageType('success');
      } else {
        setCurrentQ((q) => q + 1);
      }
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
          <Message text="Congratulations! You escaped the room!" type="success" />
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
          <Message text={message} type={messageType} />
          <Text style={styles.title}>Welcome to the Escape Room</Text>

          {!timeUp && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Question {currentQ}</Text>
              <Text style={styles.hint}>
                {questions[`Question${currentQ}`] || '(No question set)'}
              </Text>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Enter answer"
                placeholderTextColor="#8b6a3f"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!timeUp && gameStarted}
              />
              <TouchableOpacity
                style={[styles.button, (btnDisabled || !gameStarted) && styles.buttonDisabled]}
                onPress={checkAnswer}
                disabled={btnDisabled || timeUp || !gameStarted}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          {!gameStarted && !timeUp && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>▶  Start</Text>
            </TouchableOpacity>
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
    fontSize: 16,
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
