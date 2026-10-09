import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../constants/Colors';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Finding Passcode', path: '/passcode' },
  { label: '12 Disciples', path: '/disciples' },
  { label: 'Input', path: '/input' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.header}>
      <View style={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/' && pathname === '/index');
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={styles.navBtn}
            >
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.headerBg,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    paddingTop: 3,
    paddingBottom: 3,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  navBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  navText: {
    color: Colors.headerText,
    fontSize: 14,
    fontWeight: '600',
  },
  navTextActive: {
    color: Colors.accent,
    textShadowColor: '#ffcc66',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
