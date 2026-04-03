export const cyclingDefaults = {
  speed: 24,
  battery: 78,
  range: 42,
  mode: 'Assist',
  currentSong: 'Blinding Lights - The Weeknd',
};

export const widgets = [
  { id: 'map', label: 'Map', icon: 'map' as const },
  { id: 'music', label: 'Music', icon: 'musical-notes' as const },
  { id: 'speed', label: 'Speed', icon: 'speedometer' as const },
  { id: 'battery', label: 'Battery', icon: 'battery-charging' as const },
  { id: 'hydration', label: 'Hydration Reminder', icon: 'water' as const },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' as const },
  { id: 'collision', label: 'Collision Alerts', icon: 'warning' as const },
  { id: 'weather', label: 'Weather', icon: 'partly-sunny' as const },
];
