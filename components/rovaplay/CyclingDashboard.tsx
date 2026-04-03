import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { cyclingDefaults } from '../../constants/mockData';

export default function CyclingDashboard() {
  const [collisionAlert, setCollisionAlert] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHydration, setShowHydration] = useState(false);

  const hydrationOpacity = useRef(new Animated.Value(0)).current;
  const alertShake = useRef(new Animated.Value(0)).current;

  // Hydration reminder every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHydration(true);
      Animated.sequence([
        Animated.timing(hydrationOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(4000),
        Animated.timing(hydrationOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => setShowHydration(false));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const triggerCollision = () => {
    setCollisionAlert(true);
    Animated.sequence([
      Animated.timing(alertShake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setCollisionAlert(false), 5000);
  };

  const batteryColor =
    cyclingDefaults.battery > 50
      ? Colors.accent
      : cyclingDefaults.battery > 20
      ? '#FFA500'
      : Colors.alert;

  return (
    <View style={styles.container}>
      {/* Collision Alert Banner */}
      {collisionAlert && (
        <Animated.View
          style={[styles.alertBanner, { transform: [{ translateX: alertShake }] }]}
        >
          <Ionicons name="warning" size={18} color="#fff" />
          <Text style={styles.alertText}>REAR COLLISION ALERT</Text>
          <TouchableOpacity onPress={() => setCollisionAlert(false)}>
            <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Speed Hero */}
      <View style={styles.speedSection}>
        <Text style={styles.speedLabel}>CURRENT SPEED</Text>
        <View style={styles.speedRow}>
          <Text style={styles.speedValue}>{cyclingDefaults.speed}</Text>
        </View>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="battery-charging" size={16} color={batteryColor} />
          <Text style={[styles.statValue, { color: batteryColor }]}>
            {cyclingDefaults.battery}%
          </Text>
          <Text style={styles.statLabel}>Battery</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="navigate" size={16} color={Colors.textSecondary} />
          <Text style={styles.statValue}>{cyclingDefaults.range} km</Text>
          <Text style={styles.statLabel}>Range</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="flash" size={16} color={Colors.primary} />
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            {cyclingDefaults.mode}
          </Text>
          <Text style={styles.statLabel}>Mode</Text>
        </View>
      </View>

      {/* Mini Map */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={28} color={Colors.textSecondary} />
        <Text style={styles.mapText}>Map</Text>
        <View style={styles.mapDot} />
      </View>

      {/* Music Widget */}
      <View style={styles.musicWidget}>
        <View style={styles.musicInfo}>
          <Ionicons name="musical-notes" size={16} color={Colors.primary} />
          <Text style={styles.songTitle} numberOfLines={1}>
            {cyclingDefaults.currentSong}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={32}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Hydration Reminder */}
      {showHydration && (
        <Animated.View style={[styles.hydrationPill, { opacity: hydrationOpacity }]}>
          <Text style={styles.hydrationText}>💧 Drink Water</Text>
        </Animated.View>
      )}

      {/* Mock Trigger Buttons */}
      <View style={styles.mockControls}>
        <TouchableOpacity style={styles.mockButton} onPress={triggerCollision}>
          <Ionicons name="warning-outline" size={14} color={Colors.alert} />
          <Text style={styles.mockButtonText}>Simulate Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mockButton, { borderColor: Colors.accent }]}
          onPress={() => {
            setShowHydration(true);
            Animated.sequence([
              Animated.timing(hydrationOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.delay(3000),
              Animated.timing(hydrationOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
              }),
            ]).start(() => setShowHydration(false));
          }}
        >
          <Text style={[styles.mockButtonText, { color: Colors.accent }]}>
            💧 Hydration
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.alert,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  alertText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
    flex: 1,
    marginLeft: 8,
  },
  speedSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  speedLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  speedValue: {
    color: Colors.textPrimary,
    fontSize: 96,
    fontWeight: '800',
    lineHeight: 100,
    letterSpacing: -4,
  },
  speedUnit: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2A2A3E',
    marginVertical: 4,
  },
  mapPlaceholder: {
    height: 130,
    backgroundColor: '#141428',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    position: 'relative',
  },
  mapText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },
  mapDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    top: '45%',
    left: '52%',
  },
  musicWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 12,
  },
  songTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  hydrationPill: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#0A2A3A',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  hydrationText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  mockControls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  mockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.alert,
  },
  mockButtonText: {
    color: Colors.alert,
    fontSize: 12,
    fontWeight: '600',
  },
});
