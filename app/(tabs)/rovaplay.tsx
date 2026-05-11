import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors } from '../../theme/colors';
import { Icon } from '../../components/Icon';
import CyclingDashboard from '../../components/rovaplay/CyclingDashboard';
import WidgetGrid from '../../components/rovaplay/WidgetGrid';
import { useLocation } from '../../hooks/useLocation';
import { widgets as allWidgets } from '../../constants/mockData';

export default function RovaPlayScreen() {
  const [activeWidgets, setActiveWidgets] = useState<Set<string>>(
    new Set(['speed', 'battery', 'map', 'music'])
  );
  const [isLandscape, setIsLandscape] = useState(false);

  const locationState = useLocation();
  const { width, height } = useWindowDimensions();

  // Always keep orientation unlocked — flipping the phone switches modes.
  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // Track real orientation changes.
  useEffect(() => {
    const sync = async () => {
      const o = await ScreenOrientation.getOrientationAsync();
      setIsLandscape(
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
    };
    sync();
    const sub = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      setIsLandscape(
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
    });
    return () => ScreenOrientation.removeOrientationChangeListener(sub);
  }, []);

  // Dimension fallback (simulator / locked-orientation environments).
  const effectiveLandscape = isLandscape || width > height;

  const toggleWidget = (id: string) => {
    setActiveWidgets(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedWidgets = allWidgets.filter(w => activeWidgets.has(w.id));

  // ── LANDSCAPE / RIDE MODE — full screen, no chrome ───────────────────────
  if (effectiveLandscape) {
    return (
      <View style={styles.fullscreen}>
        <CyclingDashboard
          selectedWidgets={selectedWidgets}
          locationState={locationState}
        />
      </View>
    );
  }

  // ── PORTRAIT / GALLERY MODE ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>Rova</Text>
        <View style={styles.playBadge}>
          <Text style={styles.playBadgeText}>PLAY</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.galleryContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section heading */}
        <Text style={styles.sectionLabel}>ROVAPLAY</Text>
        <Text style={styles.galleryTitle}>Choose your{'\n'}widgets.</Text>
        <Text style={styles.gallerySubtitle}>
          <Text style={styles.countHighlight}>{activeWidgets.size}</Text>
          {` of ${allWidgets.length} selected · arranges automatically`}
        </Text>

        <WidgetGrid
          activeWidgets={activeWidgets}
          onToggle={toggleWidget}
          widgets={allWidgets}
        />

        {/* Rotate to ride — sits below the grid so it doesn't eat into widget space */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaPill}>
            <Icon name="bicycle" size={14} color={Colors.textSecondary} />
            <Text style={styles.ctaText}>Rotate to ride</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ACCENT = '#7DD3FC';

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: '#050709',
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
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
  scrollView: {
    flex: 1,
  },
  galleryContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  galleryTitle: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 8,
  },
  gallerySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
  },
  countHighlight: {
    color: ACCENT,
    fontWeight: '700',
  },
  gridSpacing: {
    gap: 0,
  },
  // Sticky CTA
  ctaContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#151C28',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  ctaText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
