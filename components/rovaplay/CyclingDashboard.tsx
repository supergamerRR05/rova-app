import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Icon } from '../Icon';
import { Colors } from '../../theme/colors';
import { cyclingDefaults } from '../../constants/mockData';
import type { LocationState } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import Constants from 'expo-constants';

// react-native-maps requires a native dev build — not available in Expo Go or web
const canRenderMap = Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient';
// Lazy import so it doesn't crash in unsupported environments
const MapView = canRenderMap ? require('react-native-maps').default : null;
const PROVIDER_DEFAULT = canRenderMap ? require('react-native-maps').PROVIDER_DEFAULT : null;

interface Props {
  activeWidgets: Set<string>;
  locationState: LocationState;
}

export default function CyclingDashboard({ activeWidgets, locationState }: Props) {
  const [collisionAlert, setCollisionAlert] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHydration, setShowHydration] = useState(false);

  const hydrationOpacity = useRef(new Animated.Value(0)).current;
  const alertShake = useRef(new Animated.Value(0)).current;

  const weather = useWeather(locationState.location);

  const showMap = activeWidgets.has('map');
  const showWeather = activeWidgets.has('weather');

  // Hydration reminder every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHydration(true);
      Animated.sequence([
        Animated.timing(hydrationOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(4000),
        Animated.timing(hydrationOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
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
      ? Colors.primary
      : cyclingDefaults.battery > 20
      ? Colors.textSecondary
      : Colors.alert;

  const renderMap = () => {
    if (!showMap) return null;

    if (locationState.granted === false) {
      return (
        <View style={[styles.mapContainer, styles.mapStateCenter]}>
          <Icon name="location.slash.fill" size={26} color={Colors.alert} />
          <Text style={styles.mapStateText}>Location access denied</Text>
        </View>
      );
    }

    if (!locationState.location) {
      return (
        <View style={[styles.mapContainer, styles.mapStateCenter]}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.mapStateText}>Getting location…</Text>
        </View>
      );
    }

    if (!canRenderMap) {
      return (
        <View style={[styles.mapContainer, styles.mapStateCenter]}>
          <Icon name="map" size={28} color={Colors.textSecondary} />
          <Text style={styles.mapStateText}>Map needs a dev build</Text>
        </View>
      );
    }

    const { latitude, longitude } = locationState.location.coords;

    return (
      <MapView
        style={styles.mapContainer}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        pitchEnabled={false}
        rotateEnabled={false}
      />
    );
  };

  const renderWeather = () => {
    if (!showWeather) return null;

    if (!locationState.location) {
      return (
        <View style={styles.weatherWidget}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.weatherDesc}>Waiting for location…</Text>
        </View>
      );
    }

    if (!weather) {
      return (
        <View style={styles.weatherWidget}>
          <ActivityIndicator size="small" color={Colors.accent} />
          <Text style={styles.weatherDesc}>Loading weather…</Text>
        </View>
      );
    }

    return (
      <View style={styles.weatherWidget}>
        <Icon name={weather.sfSymbol} size={32} color={Colors.accent} />
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
          <Text style={styles.weatherDesc}>{weather.description}</Text>
        </View>
        <View style={styles.weatherWind}>
          <Icon name="wind" size={13} color={Colors.textSecondary} />
          <Text style={styles.weatherWindText}>{weather.windSpeed} km/h</Text>
        </View>
      </View>
    );
  };

  const showCollision = activeWidgets.has('collision');
  const showSpeed = activeWidgets.has('speed');
  const showBattery = activeWidgets.has('battery');
  const showMusic = activeWidgets.has('music');
  const showHydrationWidget = activeWidgets.has('hydration');
  const showCalendar = activeWidgets.has('calendar');
  const showCamera = activeWidgets.has('camera');

  const hasMockControls = showCollision || showHydrationWidget;

  return (
    <View style={styles.container}>
      {/* Collision Alert Banner */}
      {showCollision && collisionAlert && (
        <Animated.View
          style={[styles.alertBanner, { transform: [{ translateX: alertShake }] }]}
        >
          <Icon name="exclamationmark.triangle.fill" size={18} color="#fff" />
          <Text style={styles.alertText}>REAR COLLISION ALERT</Text>
          <TouchableOpacity onPress={() => setCollisionAlert(false)}>
            <Icon name="xmark" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Speed Hero */}
      {showSpeed && (
        <View style={styles.speedSection}>
          <Text style={styles.speedLabel}>CURRENT SPEED</Text>
          <View style={styles.speedRow}>
            <Text style={styles.speedValue}>{cyclingDefaults.speed}</Text>
          </View>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
      )}

      {/* Stats Row */}
      {showBattery && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="battery.100.bolt" size={16} color={batteryColor} />
            <Text style={[styles.statValue, { color: batteryColor }]}>
              {cyclingDefaults.battery}%
            </Text>
            <Text style={styles.statLabel}>Battery</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="location.fill" size={16} color={Colors.textSecondary} />
            <Text style={styles.statValue}>{cyclingDefaults.range} km</Text>
            <Text style={styles.statLabel}>Range</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="bolt.fill" size={16} color={Colors.primary} />
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {cyclingDefaults.mode}
            </Text>
            <Text style={styles.statLabel}>Mode</Text>
          </View>
        </View>
      )}

      {/* Map */}
      {renderMap()}

      {/* Camera Feed */}
      {showCamera && (
        <View style={styles.cameraWidget}>
          <View style={styles.cameraHeader}>
            <Icon name="camera.fill" size={13} color={Colors.textSecondary} />
            <Text style={styles.cameraLabel}>REAR CAMERA</Text>
            <View style={styles.cameraLiveBadge}>
              <Text style={styles.cameraLiveText}>LIVE</Text>
            </View>
          </View>
          <Image
            source={{ uri: 'https://picsum.photos/seed/rova-camera/800/220' }}
            style={styles.cameraFeed}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Weather */}
      {renderWeather()}

      {/* Calendar */}
      {showCalendar && (
        <View style={styles.calendarWidget}>
          <Icon name="calendar" size={18} color={Colors.primary} />
          <View style={styles.calendarInfo}>
            <Text style={styles.calendarTitle}>No upcoming events</Text>
            <Text style={styles.calendarSub}>Your calendar is clear</Text>
          </View>
        </View>
      )}

      {/* Music Widget */}
      {showMusic && (
        <View style={styles.musicWidget}>
          <View style={styles.musicInfo}>
            <Icon name="music.note" size={16} color={Colors.primary} />
            <Text style={styles.songTitle} numberOfLines={1}>
              {cyclingDefaults.currentSong}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
            <Icon
              name={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
              size={32}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Hydration Reminder */}
      {showHydrationWidget && showHydration && (
        <Animated.View style={[styles.hydrationPill, { opacity: hydrationOpacity }]}>
          <Text style={styles.hydrationText}>💧 Drink Water</Text>
        </Animated.View>
      )}

      {/* Mock Trigger Buttons — only visible for active relevant widgets */}
      {hasMockControls && (
        <View style={styles.mockControls}>
          {showCollision && (
            <TouchableOpacity style={styles.mockButton} onPress={triggerCollision}>
              <Icon name="exclamationmark.triangle" size={14} color={Colors.alert} />
              <Text style={styles.mockButtonText}>Simulate Alert</Text>
            </TouchableOpacity>
          )}
          {showHydrationWidget && (
            <TouchableOpacity
              style={[styles.mockButton, { borderColor: Colors.accent }]}
              onPress={() => {
                setShowHydration(true);
                Animated.sequence([
                  Animated.timing(hydrationOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                  Animated.delay(3000),
                  Animated.timing(hydrationOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
                ]).start(() => setShowHydration(false));
              }}
            >
              <Text style={[styles.mockButtonText, { color: Colors.accent }]}>
                💧 Hydration
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  mapContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  mapStateCenter: {
    backgroundColor: '#0D1520',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapStateText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 12,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  weatherDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  weatherWind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherWindText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  cameraWidget: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  cameraLabel: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  cameraLiveBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cameraLiveText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cameraFeed: {
    width: '100%',
    height: 160,
  },
  calendarWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 12,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  calendarSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
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
    backgroundColor: '#0A1A2E',
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
