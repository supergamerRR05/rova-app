import React from 'react';
import { Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';

// Maps SF Symbol names → Ionicons fallback names for Android/Web
const SF_TO_IONICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  'car.side.fill': 'car-sport',
  'heart.fill': 'heart',
  'play.circle.fill': 'play-circle',
  'pause.circle.fill': 'pause-circle',
  'person.2.fill': 'people',
  'person.fill': 'person',
  'bicycle': 'bicycle',
  'square.grid.2x2.fill': 'grid',
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.triangle': 'warning-outline',
  'xmark': 'close',
  'battery.100.bolt': 'battery-charging',
  'location.fill': 'navigate',
  'bolt.fill': 'flash',
  'map': 'map-outline',
  'map.fill': 'map',
  'music.note': 'musical-notes',
  'checkmark.circle.fill': 'checkmark-circle',
  'speedometer': 'speedometer',
  'drop.fill': 'water',
  'calendar': 'calendar',
  'cloud.sun.fill': 'partly-sunny',
  'location.slash.fill': 'location-outline',
  'sun.max.fill': 'sunny',
  'cloud.fog.fill': 'cloudy',
  'cloud.rain.fill': 'rainy',
  'cloud.snow.fill': 'snow',
  'cloud.heavyrain.fill': 'rainy',
  'cloud.bolt.rain.fill': 'thunderstorm',
  'wind': 'speedometer',
  'camera.fill': 'camera',
  'video.fill': 'videocam',
  'iphone': 'phone-portrait-outline',
  'rotate.right': 'phone-landscape-outline',
  'line.3.horizontal': 'reorder-three-outline',
  'arrow.up.arrow.down': 'swap-vertical',
};

interface IconProps {
  name: string;
  size: number;
  color: string;
}

export function Icon({ name, size, color }: IconProps) {
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={name as any}
        style={{ width: size, height: size }}
        type="hierarchical"
        tintColor={color}
      />
    );
  }
  const fallback = SF_TO_IONICONS[name] ?? 'help-circle';
  return <Ionicons name={fallback} size={size} color={color} />;
}
