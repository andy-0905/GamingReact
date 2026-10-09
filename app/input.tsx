import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
const Header = require('../components/Header').default;
const Message = require('../components/Message').default;
import { Colors } from '../constants/Colors';

export default function InputScreen() {
  const [mode, setMode] = useState<'q' | 'a'>('q');
  const [message, setMessage] = useState('Please set up the answers for the escape room.');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showList, setShowList] = useState(false);
  const [listContent, setListContent] = useState('');
  const [qInputs, setQInputs] = useState(['', '', '', '', '']);
  const [aInputs, setAInputs] = useState(['', '', '', '', '']);

  useEffect(() => {
    loadExisting();
  }, []);

  const loadExisting = async () => {
    const qs = [];
    const as = [];
    for (let i = 1; i <= 5; i++) {
      qs.push((await AsyncStorage.getItem(`Question${i}`)) || '');
      as.push((await AsyncStorage.getItem(`answer${i}`)) || '');
    }
    setQInputs(qs);
    setAInputs(as);
  };

  const saveQuestion = async (num: number) => {
    const value = qInputs[num - 1];
    await AsyncStorage.setItem(`Question${num}`, value);
    setMessage(`Question ${num} saved!`);
    setMessageType('success');
  };

  const saveAnswer = async (num: number) => {
    const value = aInputs[num - 1];
    await AsyncStorage.setItem(`answer${num}`, value);
    setMessage(`Answer ${num} saved!`);
    setMessageType('success');
  };

  const clearQuestions = async () => {
    for (let i = 1; i <= 5; i++) {
      await AsyncStorage.removeItem(`Question${i}`);
    }
    setQInputs(['', '', '', '', '']);
    setMessage('All questions reset!');
    setMessageType('error');
    setShowList(false);
  };

  const clearAnswers = async () => {
    for (let i = 1; i <= 5; i++) {
      await AsyncStorage.removeItem(`answer${i}`);
    }
    setAInputs(['', '', '', '', '']);
    setMessage('All answers reset!');
    setMessageType('error');
    setShowList(false);
  };

  const toggleShow = async () => {
    if (showList) {
      setShowList(false);
      setListContent('');
      return;
    }
    let output = '';
    if (mode === 'q') {
      for (let i = 1; i <= 5; i++) {
        const val = (await AsyncStorage.getItem(`Question${i}`)) || '(empty)';
        output += `Question ${i}: ${val}\n`;
      }
    } else {
      for (let i = 1; i <= 5; i++) {
        const val = (await AsyncStorage.getItem(`answer${i}`)) || '(empty)';
        output += `Answer ${i}: ${val}\n`;
      }
    }
    setListContent(output);
    setShowList(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Message text={message} type={messageType} />
          <Text style={styles.title}>Welcome to the Escape Room</Text>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'q' && styles.modeBtnActive]}
              onPress={() => {
                setMode('q');
                setShowList(false);
              }}
            >
              <Text style={styles.modeBtnText}>Set questions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'a' && styles.modeBtnActive]}
              onPress={() => {
                setMode('a');
                setShowList(false);
              }}
            >
              <Text style={styles.modeBtnText}>Set answers</Text>
            </TouchableOpacity>
          </View>

          {mode === 'q' ? (
            <View>
              <Text style={styles.formTitle}>Set Questions</Text>
              {[1, 2, 3, 4, 5].map((num) => (
                <View key={num} style={styles.row}>
                  <TextInput
                    style={styles.input}
                    value={qInputs[num - 1]}
                    onChangeText={(t) => {
                      const next = [...qInputs];
                      next[num - 1] = t;
                      setQInputs(next);
                    }}
                    placeholder={`Question ${num}`}
                    placeholderTextColor="#8b6a3f"
                  />
                  <TouchableOpacity style={styles.saveBtn} onPress={() => saveQuestion(num)}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={toggleShow}>
                  <Text style={styles.actionBtnText}>
                    {showList ? 'Hide questions' : 'Show questions'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.clearBtn]} onPress={clearQuestions}>
                  <Text style={styles.actionBtnText}>Clear questions</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.formTitle}>Set Answers</Text>
              {[1, 2, 3, 4, 5].map((num) => (
                <View key={num} style={styles.row}>
                  <TextInput
                    style={styles.input}
                    value={aInputs[num - 1]}
                    onChangeText={(t) => {
                      const next = [...aInputs];
                      next[num - 1] = t;
                      setAInputs(next);
                    }}
                    placeholder={`Answer ${num}`}
                    placeholderTextColor="#8b6a3f"
                  />
                  <TouchableOpacity style={styles.saveBtn} onPress={() => saveAnswer(num)}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={toggleShow}>
                  <Text style={styles.actionBtnText}>
                    {showList ? 'Hide answers' : 'Show answers'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.clearBtn]} onPress={clearAnswers}>
                  <Text style={styles.actionBtnText}>Clear answers</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showList && (
            <View style={styles.listBox}>
              <Text style={styles.listText}>{listContent}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  container: {
    marginHorizontal: 16,
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
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  modeBtn: {
    backgroundColor: Colors.buttonGradientEnd,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modeBtnActive: {
    backgroundColor: Colors.buttonGradientStart,
  },
  modeBtnText: {
    color: '#fff3d6',
    fontWeight: '600',
  },
  formTitle: {
    color: Colors.accentSecondary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#8b6a3f',
    borderRadius: 6,
    padding: 10,
    color: Colors.text,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: Colors.buttonGradientStart,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  saveBtnText: {
    color: '#fff3d6',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 15,
    flexWrap: 'wrap',
  },
  actionBtn: {
    backgroundColor: Colors.buttonGradientStart,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  clearBtn: {
    backgroundColor: '#5a2e1d',
  },
  actionBtnText: {
    color: '#fff3d6',
    fontWeight: '600',
  },
  listBox: {
    marginTop: 20,
    backgroundColor: Colors.sectionBg,
    borderRadius: 8,
    padding: 15,
  },
  listText: {
    color: Colors.sectionText,
    fontSize: 14,
    lineHeight: 22,
  },
});
