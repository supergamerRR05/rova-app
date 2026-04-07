import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Colors } from '../../theme/colors';
import CyclingDashboard from '../../components/rovaplay/CyclingDashboard';
import WidgetGrid from '../../components/rovaplay/WidgetGrid';
import { useLocation } from '../../hooks/useLocation';
import { widgets as defaultWidgets } from '../../constants/mockData';

type Mode = 'customize' | 'cycling';
type Widget = typeof defaultWidgets[number];

export default function RovaPlayScreen() {
  const [mode, setMode] = useState<Mode>('customize');
  const [activeWidgets, setActiveWidgets] = useState<Set<string>>(
    new Set(['map', 'music', 'speed', 'battery', 'collision'])
  );
  const [orderedWidgets, setOrderedWidgets] = useState<Widget[]>(defaultWidgets);

  const locationState = useLocation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isCycling = mode === 'cycling';

  // Rotation prompt animation
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCycling && !isLandscape) {
      // Phone icon rotates from portrait → landscape on loop
      const rotation = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(600),
          Animated.timing(rotateAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.delay(1000),
        ])
      );
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      rotation.start();
      pulse.start();
      return () => {
        rotation.stop();
        pulse.stop();
        rotateAnim.setValue(0);
        pulseAnim.setValue(1);
      };
    }
  }, [isCycling, isLandscape]);

  const phoneRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-90deg'],
  });

  const toggleWidget = (id: string) => {
    setActiveWidgets(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
        <Icon
          name={isCycling ? 'bicycle' : 'square.grid.2x2.fill'}
          size={13}
          color={isCycling ? Colors.primary : Colors.accent}
        />
        <Text style={[styles.modeStripText, { color: isCycling ? Colors.primary : Colors.accent }]}>
          {isCycling ? 'Cycling Mode — Live Dashboard' : 'Customization Mode — Hold & drag to reorder'}
        </Text>
      </View>

      {isCycling ? (
        /* ── CYCLING MODE ── */
        isLandscape ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.cyclingContent}
            showsVerticalScrollIndicator={false}
          >
            <CyclingDashboard
              activeWidgets={activeWidgets}
              locationState={locationState}
            />
          </ScrollView>
        ) : (
          /* ── ROTATE PROMPT ── */
          <View style={styles.rotationPrompt}>
            <Animated.View style={{ transform: [{ rotate: phoneRotation }, { scale: pulseAnim }] }}>
              <Icon name="iphone" size={72} color={Colors.textPrimary} />
            </Animated.View>
            <Text style={styles.rotationTitle}>Rotate your phone</Text>
            <Text style={styles.rotationSubtitle}>
              Cycling mode works in landscape
            </Text>
          </View>
        )
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
              Tap to toggle · Hold and drag to reorder
            </Text>
          </View>
          <WidgetGrid
            activeWidgets={activeWidgets}
            onToggle={toggleWidget}
            orderedWidgets={orderedWidgets}
            onReorder={setOrderedWidgets}
          />
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
    backgroundColor: '#0A1228',
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
  rotationPrompt: {
    flex: 1,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  rotationTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  rotationSubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '400',
  },
});
