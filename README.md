# Escape Room - React Native (Expo)

A full React Native conversion of the original web Escape Room Password Validation project.

## Features

- **Home** – Custom questions & answers (set them in the Input screen, stored with AsyncStorage)
- **Finding Passcode** – Single 5-digit passcode challenge (answer: `45316`)
- **12 Disciples** – 6 sequential sections with the original answers
- **Input** – Admin screen to set / clear custom questions and answers
- 60-minute countdown timer (starts on first interaction)
- −2:00 penalty + floating animation on wrong answers
- Background music + periodic ticking sound
- Dark wood / parchment themed UI matching the original

## 12 Disciples Answers

| Section | Answer   |
|---------|----------|
| 1       | jesus    |
| 2       | apostles |
| 3       | bbm      |
| 4       | 77       |
| 5       | clean    |
| 6       | victory  |

## Quick Start

```bash
# 1. Unzip the project
unzip EscapeRoomRN.zip
cd EscapeRoomRN

# 2. Install dependencies
npm install

# 3. Start Expo
npx expo start
```

Then:
- Scan the QR code with **Expo Go** on your phone, or
- Press `w` for web, `a` for Android emulator, `i` for iOS simulator.

> **Note:** The first time you run `npm install` it may take a couple of minutes.  
> If you see peer-dependency warnings, you can safely ignore them or run  
> `npx expo install --fix` afterwards.

## Project Structure

```
EscapeRoomRN/
├── app/
│   ├── _layout.tsx      # Root layout + stack navigation
│   ├── index.tsx        # Home (custom Q&A)
│   ├── passcode.tsx     # Finding Passcode
│   ├── disciples.tsx    # 12 Disciples
│   └── input.tsx        # Admin input
├── components/
│   ├── Header.tsx
│   ├── Timer.tsx
│   └── Message.tsx
├── constants/
│   └── Colors.ts
├── data/
│   ├── ans-12-Disciples.json
│   └── ans-Passcode.json
├── assets/
│   ├── bgm.mp3
│   ├── bgm-passcode.mp3
│   ├── ticking.mp3
│   └── (icon / splash placeholders)
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
└── README.md
```

## Notes

- Audio starts only after the first user interaction (required by mobile OS policies).
- Timer and music are per-screen (navigating away stops them).
- Custom Home answers live in AsyncStorage and persist across app restarts on the same device.
- Placeholder icons are included; replace `assets/icon.png`, `splash.png`, etc. for production.

## Original Project

Converted from the HTML/JS GitHub Pages version:  
https://andy-0905.github.io/Escape-Room-Password-Validation
