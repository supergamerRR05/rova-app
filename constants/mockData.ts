export const cyclingDefaults = {
  speed: 24,
  battery: 78,
  range: 42,
  mode: 'Assist',
  currentSong: 'Blinding Lights - The Weeknd',
};

export const widgets = [
  { id: 'speed',     label: 'Speed',            description: 'km/h · avg · max',       icon: 'speedometer' },
  { id: 'battery',   label: 'Battery',           description: 'charge · range',         icon: 'battery.100.bolt' },
  { id: 'map',       label: 'Map',               description: 'navigation · route',     icon: 'map.fill' },
  { id: 'camera',    label: 'Rear Camera',        description: 'rear view · live',       icon: 'camera.fill' },
  { id: 'collision', label: 'Collision',          description: 'proximity · alerts',     icon: 'checkmark.shield' },
  { id: 'music',     label: 'Music',              description: 'playback · controls',    icon: 'music.note' },
  { id: 'weather',   label: 'Weather',            description: 'temp · conditions',      icon: 'cloud.sun.fill' },
  { id: 'hydration', label: 'Hydration',          description: 'reminders · tracking',  icon: 'drop.fill' },
  { id: 'calendar',  label: 'Calendar',           description: 'events · schedule',      icon: 'calendar' },
];
