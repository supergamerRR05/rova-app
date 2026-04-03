import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import CyclingDashboard from '../../components/rovaplay/CyclingDashboard';
import WidgetGrid from '../../components/rovaplay/WidgetGrid';

type Mode = 'customize' | 'cycling';

export default function RovaPlayScreen() {
  const [mode, setMode] = useState<Mode>('customize');

  const isCycling = mode === 'cycling';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>Rova</Text>
          <View style={styles.playBadge}>
            <Text style={styles.playBadgeText}>PLAY</Text>
          </View>
        </View>
        <View style={styles.modeToggleContainer}>
          <Text style={[styles.modeLabel, !isCycling && styles.modeLabelActive]}>
            Customize
          </Text>
          <Switch
            value={isCycling}
            onValueChange={(val) => setMode(val ? 'cycling' : 'customize')}
            trackColor={{ false: '#2A2A3E', true: Colors.primary + '55' }}
            thumbColor={isCycling ? Colors.primary : '#666'}
            ios_backgroundColor="#2A2A3E"
            style={styles.switch}
          />
          <Text style={[styles.modeLabel, isCycling && styles.modeLabelActive]}>
            Cycling
          </Text>
        </View>
      </View>

      {/* Mode indicator strip */}
      <View style={[styles.modeStrip, isCycling ? styles.modeStripCycling : styles.modeStripCustomize]}>
        <Ionicons
          name={isCycling ? 'bicycle' : 'grid'}
          size={13}
          color={isCycling ? Colors.primary : Colors.accent}
        />
        <Text style={[styles.modeStripText, { color: isCycling ? Colors.primary : Colors.accent }]}>
          {isCycling ? 'Cycling Mode — Live Dashboard' : 'Customization Mode — Tap cards to toggle'}
        </Text>
      </View>

      {isCycling ? (
        /* ── CYCLING MODE ── */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.cyclingContent}
          showsVerticalScrollIndicator={false}
        >
          <CyclingDashboard />
        </ScrollView>
      ) : (
        /* ── CUSTOMIZE MODE ── */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.customizeContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.customizeHeader}>
            <Text style={styles.customizeTitle}>Customize Your Dashboard</Text>
            <Text style={styles.customizeSubtitle}>
              Choose which widgets appear during your ride
            </Text>
          </View>
          <WidgetGrid />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  playBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  playBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modeLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  modeLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  modeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  modeStripCustomize: {
    backgroundColor: '#0A2A20',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  modeStripCycling: {
    backgroundColor: '#0A1830',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  modeStripText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  customizeContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cyclingContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  customizeHeader: {
    marginBottom: 20,
  },
  customizeTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  customizeSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
