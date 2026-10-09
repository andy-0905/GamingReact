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
import answersData from '../data/ans-12-Disciples.json';
import { useFocusEffect } from 'expo-router';

const sections = [
  {
    id: 1,
    title: 'Section 1',
    hint: "Let's start with the envelops on the table",
  },
  {
    id: 2,
    title: 'Section 2',
    hint: 'Find the jewelry box\nHint: a word but more than one',
  },
  {
    id: 3,
    title: 'Section 3',
    hint: 'Animals\nHint: Find the passage, _ _ _',
  },
  {
    id: 4,
    title: 'Section 4',
    hint: 'The Power of Together\nHint: Find your lovable, honey-loving friend with a big round tummy',
  },
  {
    id: 5,
    title: 'Section 5',
    hint: "Jesus washes the disciples' feet\nHint: Find the bottle",
  },
  {
    id: 6,
    title: 'Section 6',
    hint: 'The Missing One\nHint: Find the letter under the table',
  },
];

export default function DisciplesScreen() {
  const [message, setMessage] = useState('Solve all the sections to escape the room!');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [currentQ, setCurrentQ] = useState(1);
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
        require('../assets/bgm.mp3'),
        { isLooping: true, volume: 0.4 }
      );
      musicRef.current = music;
      await music.playAsync();

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

  const handleStart = () => {
    if (gameStarted || timeUp) return;
    setGameStarted(true);
    startAudio();
    setTimerRunning(true);
  };

  const checkAnswer = () => {
    if (timeUp || escaped || !gameStarted) return;
    setBtnDisabled(true);
    setTimeout(() => setBtnDisabled(false), 3000);

    const key = `answer${currentQ}` as keyof typeof answersData;
    const correct = answersData[key] || '';

    if (inputValue.toLowerCase().trim() === correct.toLowerCase().trim()) {
      setMessage('Correct!');
      setMessageType('success');
      setInputValue('');
      if (currentQ >= 6) {
        setEscaped(true);
        setTimerRunning(false);
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
    setMessage("💀 Time's up! You are trapped!");
    setMessageType('error');
  };

  const currentSection = sections.find((s) => s.id === currentQ);

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
          <Text style={styles.subtitle}>12 Disciples</Text>
          <Message text={message} type={messageType} />
          <Text style={styles.title}>Welcome to the Escape Room</Text>

          {!timeUp && currentSection && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{currentSection.title}</Text>
              <Text style={styles.hint}>{currentSection.hint}</Text>
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
                style={[styles.button, btnDisabled && styles.buttonDisabled]}
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
    lineHeight: 22,
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
