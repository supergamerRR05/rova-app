import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Line, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import { Icon } from '../Icon';
import { Colors } from '../../theme/colors';
import { cyclingDefaults } from '../../constants/mockData';
import type { LocationState } from '../../hooks/useLocation';
import type { BLEData } from '../../hooks/useBLE';
import { useWeather } from '../../hooks/useWeather';
import Constants from 'expo-constants';

const canRenderMap =
  Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient';
const MapView = canRenderMap ? require('react-native-maps').default : null;
const PROVIDER_DEFAULT = canRenderMap
  ? require('react-native-maps').PROVIDER_DEFAULT
  : null;

export type Widget = { id: string; label: string; icon: string };

interface Props {
  selectedWidgets: Widget[];
  locationState: LocationState;
  bleData?: BLEData;
  cameraStreamUrl?: string | null;
  onCameraSettings?: () => void;
  screenWidth?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────
const MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

// Variation A palette
const A_BG = '#080A0D';
const A_LINE = 'rgba(255,255,255,0.08)';
const A_DIM = 'rgba(255,255,255,0.42)';
const A_FG = '#F5F7FA';
const A_ACCENT = '#38E1C3';
const A_WARN = '#FFB547';

// Variation C palette
const C_FG = '#FFFFFF';
const C_DIM = 'rgba(255,255,255,0.65)';
const C_DIM2 = 'rgba(255,255,255,0.42)';
const C_ACCENT = '#4AF3D0';
const C_WARN = '#FFB547';
const C_GLASS = 'rgba(8, 12, 20, 0.72)';
const C_BORDER = 'rgba(255,255,255,0.13)';

// ── Speed Arc (SVG) ───────────────────────────────────────────────────────────
function SpeedArc({
  speed = 24,
  max = 60,
  size = 120,
  stroke = 9,
  gradId = 'arcGrad',
}: {
  speed?: number;
  max?: number;
  size?: number;
  stroke?: number;
  gradId?: string;
}) {
  const pct = Math.min(speed / max, 1);
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const START = -220;
  const SPAN = 260;
  const totalCirc = 2 * Math.PI * r;
  const arcLen = totalCirc * (SPAN / 360);
  const fillLen = arcLen * pct;

  // Tick marks
  const ticks = Array.from({ length: 7 }).map((_, i) => {
    const t = i / 6;
    const angleDeg = START + SPAN * t;
    const rad = (angleDeg * Math.PI) / 180;
    const r1 = r - stroke / 2 - 3;
    const r2 = r - stroke / 2 - 9;
    return {
      x1: cx + r1 * Math.cos(rad),
      y1: cy + r1 * Math.sin(rad),
      x2: cx + r2 * Math.cos(rad),
      y2: cy + r2 * Math.sin(rad),
    };
  });

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#38E1C3" />
          <Stop offset="100%" stopColor="#5FA8FF" />
        </LinearGradient>
      </Defs>
      {/* Track */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="#1A222E"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${arcLen} ${totalCirc}`}
        strokeLinecap="round"
        transform={`rotate(${START} ${cx} ${cy})`}
      />
      {/* Fill */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={`url(#${gradId})`}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${fillLen} ${totalCirc}`}
        strokeLinecap="round"
        transform={`rotate(${START} ${cx} ${cy})`}
      />
      {/* Ticks */}
      {ticks.map((t, i) => (
        <Line
          key={i}
          x1={t.x1} y1={t.y1}
          x2={t.x2} y2={t.y2}
          stroke="#2A3442"
          strokeWidth={1.5}
        />
      ))}
    </Svg>
  );
}

// ── Sparkline (battery trend) ─────────────────────────────────────────────────
function Spark({ color = '#7FC9A8', w = 60, h = 18 }: { color?: string; w?: number; h?: number }) {
  const pts = [2, 6, 5, 10, 8, 14, 12, 11, 15, 13, 18, 16, 14, 19];
  const max = Math.max(...pts), min = Math.min(...pts);
  const d = pts
    .map((v, i) => {
      const x = ((i / (pts.length - 1)) * w).toFixed(1);
      const y = (h - ((v - min) / (max - min)) * h).toFixed(1);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');
  return (
    <Svg width={w} height={h}>
      <Path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// ── Status strip (shared) ─────────────────────────────────────────────────────
function StatusStrip({ dim, fg, accent, line }: {
  dim: string; fg: string; accent: string; line: string;
}) {
  return (
    <View style={[ss.row, { borderBottomColor: line }]}>
      <View style={ss.left}>
        <View style={[ss.dot, { backgroundColor: accent }]} />
        <Text style={[ss.mono, { color: accent }]}>RIDE 00:42:18</Text>
        <Text style={[ss.mono, { color: dim }]}>  GPS · 8 SATS</Text>
      </View>
      <Text style={[ss.mono, { color: dim }]}>14:32</Text>
    </View>
  );
}
const ss = StyleSheet.create({
  row: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  mono: { fontFamily: MONO, fontSize: 10, letterSpacing: 0.8 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// VARIATION A — CLEAN CLUSTER (minimal: speed + battery only)
// ═══════════════════════════════════════════════════════════════════════════════
function LayoutA({ speed, battery, bleConnected }: { speed: number; battery: number; bleConnected: boolean }) {
  return (
    <View style={[aStyles.root]}>
      <StatusStrip dim={A_DIM} fg={A_FG} accent={A_ACCENT} line={A_LINE} />
      {bleConnected && (
        <View style={{ position: 'absolute', top: 34, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, zIndex: 10 }}>
          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: A_ACCENT }} />
          <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 9, color: A_ACCENT, letterSpacing: 1 }}>BLE</Text>
        </View>
      )}
      <View style={aStyles.hero}>
        {/* Arc */}
        <View style={aStyles.arcWrap}>
          <SpeedArc speed={speed} size={210} stroke={11} gradId="arcA" />
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={aStyles.arcCenter}>
              <Text style={aStyles.kmhLabel}>KM/H</Text>
              <Text style={aStyles.speedNum}>{speed}</Text>
            </View>
          </View>
        </View>

        {/* Stats + battery */}
        <View style={aStyles.rightCol}>
          <View style={aStyles.statsRow}>
            {[
              { val: '19', lbl: 'AVG' },
              { val: '38', lbl: 'MAX' },
              { val: '12.4', lbl: 'KM' },
            ].map(({ val, lbl }) => (
              <View key={lbl} style={aStyles.statItem}>
                <Text style={aStyles.statVal}>{val}</Text>
                <Text style={aStyles.statLbl}>{lbl}</Text>
              </View>
            ))}
          </View>
          <View style={aStyles.divider} />
          <BatteryCellA battery={battery} />
        </View>
      </View>
    </View>
  );
}

function BatteryCellA({ battery }: { battery: number }) {
  const { range } = cyclingDefaults;
  const color = battery > 50 ? A_ACCENT : battery > 20 ? A_WARN : '#FF5C7A';
  return (
    <View>
      <Text style={[aStyles.cellLabel, { marginBottom: 4 }]}>BATTERY</Text>
      <View style={aStyles.battRow}>
        <Text style={[aStyles.battNum, { color }]}>{battery}</Text>
        <Text style={[aStyles.cellLabel, { alignSelf: 'flex-end', marginBottom: 4 }]}>%</Text>
      </View>
      <View style={aStyles.barTrack}>
        <View style={[aStyles.barFill, { width: `${battery}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[aStyles.cellLabel, { marginTop: 6 }]}>{range} KM RANGE</Text>
    </View>
  );
}

const aStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: A_BG,
  },
  hero: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 32,
  },
  arcWrap: {
    width: 210,
    height: 210,
    flexShrink: 0,
  },
  arcCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmhLabel: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 2.4,
    color: A_DIM,
    marginBottom: 2,
  },
  speedNum: {
    color: A_FG,
    fontSize: 84,
    fontWeight: '100',
    lineHeight: 84,
    letterSpacing: -5,
  },
  rightCol: {
    flex: 1,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 28,
  },
  statItem: { gap: 2 },
  statVal: {
    color: A_FG,
    fontSize: 26,
    fontWeight: '300',
  },
  statLbl: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.4,
    color: A_DIM,
  },
  divider: {
    height: 1,
    backgroundColor: A_LINE,
  },
  cellLabel: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.8,
    color: A_DIM,
    textTransform: 'uppercase',
  },
  battRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  battNum: {
    fontSize: 28,
    fontWeight: '300',
  },
  barTrack: {
    height: 3,
    backgroundColor: A_LINE,
    marginTop: 6,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// VARIATION C — CINEMATIC HUD (all non-minimal modes)
// ═══════════════════════════════════════════════════════════════════════════════

function GlassPanel({
  children,
  style,
  padding = 12,
}: {
  children: React.ReactNode;
  style?: any;
  padding?: number;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: C_GLASS,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C_BORDER,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Pill({ children, accent = C_FG }: { children: React.ReactNode; accent?: string }) {
  return (
    <View style={[pillSt.root, { borderColor: C_BORDER }]}>
      <Text style={[pillSt.text, { color: accent }]}>{children}</Text>
    </View>
  );
}
const pillSt = StyleSheet.create({
  root: {
    backgroundColor: C_GLASS,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
});

function SpeedHUDC({ speed, fromBle }: { speed: number; fromBle?: boolean }) {
  return (
    <GlassPanel style={cStyles.speedHUD} padding={14}>
      <View style={cStyles.speedHUDInner}>
        <View style={{ width: 90, height: 90 }}>
          <SpeedArc speed={speed} size={90} stroke={7} gradId="arcC" />
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={cStyles.hudKmh}>KM/H</Text>
            <Text style={cStyles.hudSpeed}>{speed}</Text>
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <View>
            <Text style={cStyles.hudStatLbl}>AVG</Text>
            <Text style={cStyles.hudStatVal}>19</Text>
          </View>
          <View>
            <Text style={cStyles.hudStatLbl}>MAX</Text>
            <Text style={cStyles.hudStatVal}>38</Text>
          </View>
        </View>
      </View>
    </GlassPanel>
  );
}

function BatteryHUDC({ battery }: { battery: number }) {
  const { range } = cyclingDefaults;
  return (
    <GlassPanel padding={12} style={cStyles.battHUD}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={cStyles.hudLabel}>BATTERY</Text>
        <Icon name="bolt.fill" size={11} color={C_ACCENT} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <Text style={cStyles.battNum}>{battery}</Text>
        <Text style={cStyles.hudLabel}>%</Text>
        <Text style={[cStyles.hudLabel, { marginLeft: 'auto' as any }]}>{range} km</Text>
      </View>
      <View style={cStyles.battTrack}>
        <View style={[cStyles.battFill, { width: `${battery}%` as any }]} />
      </View>
    </GlassPanel>
  );
}

function NavHUDC() {
  return (
    <GlassPanel padding={12} style={cStyles.navHUD}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={cStyles.navArrow}>
          <Icon name="chevron.right" size={16} color="#000" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="location.fill" size={13} color={C_DIM} />
          <Text style={cStyles.navStat}>320m</Text>
        </View>
        <View style={cStyles.navDivider} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="clock" size={13} color={C_DIM} />
          <Text style={cStyles.navStat}>35m</Text>
        </View>
        <View style={cStyles.navDivider} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="map" size={13} color={C_DIM} />
          <Text style={cStyles.navStat}>27km</Text>
        </View>
      </View>
    </GlassPanel>
  );
}

function WeatherHUDC({ weather }: { weather: any }) {
  return (
    <GlassPanel padding={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name={weather?.sfSymbol ?? 'sun.max.fill'} size={20} color="#FFB547" />
      <View>
        <Text style={[cStyles.hudStatVal, { fontSize: 18 }]}>{weather?.temperature ?? 22}°</Text>
        <Text style={cStyles.hudLabel}>{weather?.windSpeed ?? 12} km/h</Text>
      </View>
    </GlassPanel>
  );
}

function MusicHUDC({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) {
  return (
    <GlassPanel padding={11} style={cStyles.musicHUD}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View style={cStyles.albumArt}>
          <Icon name="music.note" size={14} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={cStyles.songTitle} numberOfLines={1}>
            {cyclingDefaults.currentSong.split(' - ')[0]}
          </Text>
          <Text style={cStyles.hudLabel}>
            {cyclingDefaults.currentSong.split(' - ')[1]}
          </Text>
        </View>
        <TouchableOpacity onPress={onToggle}>
          <Icon
            name={isPlaying ? 'pause.circle.fill' : 'play.circle.fill'}
            size={22}
            color={C_FG}
          />
        </TouchableOpacity>
      </View>
    </GlassPanel>
  );
}

function HydrationHUDC() {
  return (
    <GlassPanel padding={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name="drop.fill" size={16} color="#7CB8FF" />
      <View>
        <Text style={[cStyles.songTitle, { fontSize: 12 }]}>Sip in 4 min</Text>
        <Text style={cStyles.hudLabel}>4 / 8 today</Text>
      </View>
    </GlassPanel>
  );
}

function CalHUDC() {
  return (
    <GlassPanel padding={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name="calendar" size={14} color={C_DIM} />
      <View>
        <Text style={[cStyles.songTitle, { fontSize: 12 }]}>Standup · 16:00</Text>
        <Text style={cStyles.hudLabel}>in 28 min</Text>
      </View>
    </GlassPanel>
  );
}

function CollisionHUDC({ alert }: { alert: boolean }) {
  return (
    <View style={[pillSt.root, { borderColor: alert ? 'rgba(255,59,92,0.5)' : C_BORDER }]}>
      <Icon
        name={alert ? 'exclamationmark.triangle.fill' : 'checkmark.shield'}
        size={12}
        color={alert ? '#FF5C7A' : C_ACCENT}
      />
      <Text style={[pillSt.text, { color: alert ? '#FF5C7A' : C_ACCENT }]}>
        {alert ? 'ALERT' : 'SAFE · 360°'}
      </Text>
    </View>
  );
}

function SpeedHeroBgC() {
  return (
    <View style={[StyleSheet.absoluteFill, cStyles.speedBg]}>
      <View style={cStyles.speedBgGlow} />
    </View>
  );
}

function MapHeroC({ location }: { location: any }) {
  if (!location) {
    return (
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#080E1A' }]}>
        <ActivityIndicator color={C_ACCENT} />
      </View>
    );
  }
  if (!canRenderMap) {
    return (
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#080E1A' }]}>
        <Text style={{ color: C_DIM, fontSize: 13 }}>Map needs a dev build</Text>
      </View>
    );
  }
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      provider={PROVIDER_DEFAULT}
      region={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }}
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      pitchEnabled={false}
      rotateEnabled={false}
      customMapStyle={darkMapStyle}
    />
  );
}

function LayoutC({
  ids,
  locationState,
  bleData,
  cameraStreamUrl,
  onCameraSettings,
}: {
  ids: Set<string>;
  locationState: LocationState;
  bleData?: BLEData;
  cameraStreamUrl?: string | null;
  onCameraSettings?: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [collisionAlert, setCollisionAlert] = useState(false);
  const alertShake = useRef(new Animated.Value(0)).current;

  const weather = useWeather(locationState.location);

  const speed = bleData?.speed ?? cyclingDefaults.speed;
  const battery = bleData?.battery ?? cyclingDefaults.battery;
  const bleConnected = bleData?.connected ?? false;

  const has = (id: string) => ids.has(id);
  const bg = has('map') ? 'map' : has('camera') ? 'camera' : 'speed';

  const triggerCollision = () => {
    setCollisionAlert(true);
    Animated.sequence([
      Animated.timing(alertShake, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: 5, duration: 55, useNativeDriver: true }),
      Animated.timing(alertShake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setCollisionAlert(false), 5000);
  };

  return (
    <Animated.View
      style={[
        cStyles.root,
        { transform: [{ translateX: alertShake }] },
      ]}
    >
      {/* ── Full-bleed background ── */}
      {bg === 'map' && <MapHeroC location={locationState.location} />}
      {bg === 'camera' && (
        cameraStreamUrl ? (
          <WebView
            style={StyleSheet.absoluteFill}
            source={{ html: `<html><body style="margin:0;background:#000"><img src="${cameraStreamUrl}" style="width:100%;height:100%;object-fit:cover" /></body></html>` }}
            scrollEnabled={false}
            bounces={false}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#060C14' }]}>
            <Icon name="camera.fill" size={32} color="rgba(255,255,255,0.2)" />
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 10 }}>No camera configured</Text>
            {onCameraSettings && (
              <TouchableOpacity
                onPress={onCameraSettings}
                style={{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Text style={{ color: '#4AF3D0', fontSize: 13, fontWeight: '600' }}>Set up camera</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      )}
      {bg === 'speed' && <SpeedHeroBgC />}

      {/* ── Vignette ── */}
      <View style={cStyles.vignette} pointerEvents="none" />

      {/* ── Top bar ── */}
      <View style={cStyles.topBar}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={pillSt.root}>
            <View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: C_ACCENT, marginRight: 6 }]} />
            <Text style={[pillSt.text, { color: C_ACCENT }]}>RIDE · 00:42:18</Text>
          </View>
          <View style={[pillSt.root, { borderColor: bleConnected ? 'rgba(74,243,208,0.4)' : C_BORDER }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: bleConnected ? C_ACCENT : '#555', marginRight: 6 }} />
            <Text style={[pillSt.text, { color: bleConnected ? C_ACCENT : 'rgba(255,255,255,0.35)' }]}>BLE</Text>
          </View>
          {bg === 'camera' && onCameraSettings && (
            <TouchableOpacity onPress={onCameraSettings} style={pillSt.root}>
              <Icon name="gear" size={11} color={C_DIM} />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {has('weather') && weather && <WeatherHUDC weather={weather} />}
          {has('collision') && <CollisionHUDC alert={collisionAlert} />}
          <View style={pillSt.root}>
            <Text style={[pillSt.text, { color: C_DIM }]}>14:32</Text>
          </View>
        </View>
      </View>

      {/* ── Speed hero (when no map/camera) ── */}
      {bg === 'speed' && (
        <View style={cStyles.speedHeroCenter}>
          <View style={{ width: 260, height: 260 }}>
            <SpeedArc
              speed={speed}
              size={260}
              stroke={14}
              gradId="arcCHero"
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                { alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Text style={cStyles.heroKmh}>KM/H</Text>
              <Text style={cStyles.heroSpeed}>{speed}</Text>
            </View>
          </View>
          <View style={{ gap: 14, marginLeft: 12 }}>
            {[
              { lbl: 'AVG', val: '19' },
              { lbl: 'MAX', val: '38' },
              { lbl: 'TRIP', val: '12.4 km' },
            ].map(({ lbl, val }) => (
              <View key={lbl}>
                <Text style={cStyles.heroStatLbl}>{lbl}</Text>
                <Text style={cStyles.heroStatVal}>{val}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Camera live tag ── */}
      {bg === 'camera' && cameraStreamUrl && (
        <View style={cStyles.camTag}>
          <View style={[pillSt.root, { borderColor: 'rgba(255,59,92,0.5)' }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF3B5C', marginRight: 6 }} />
            <Text style={[pillSt.text, { color: C_FG }]}>REAR CAM · LIVE</Text>
          </View>
        </View>
      )}

      {/* ── Bottom-left: speed + battery ── */}
      {bg !== 'speed' && (
        <View style={cStyles.bottomLeft}>
          <SpeedHUDC speed={speed} fromBle={bleConnected} />
          <BatteryHUDC battery={battery} />
        </View>
      )}

      {/* When speed is hero, battery sits bottom-left */}
      {bg === 'speed' && (
        <View style={cStyles.bottomLeft}>
          <BatteryHUDC battery={battery} />
        </View>
      )}

      {/* ── Bottom-center: nav (when map active) ── */}
      {bg === 'map' && (
        <View style={cStyles.bottomCenter}>
          <NavHUDC />
        </View>
      )}

      {/* ── Bottom-right: secondary widgets ── */}
      <View style={cStyles.bottomRight}>
        {has('calendar') && <CalHUDC />}
        {has('hydration') && <HydrationHUDC />}
        {has('music') && <MusicHUDC isPlaying={isPlaying} onToggle={() => setIsPlaying(p => !p)} />}
        {has('collision') && !has('weather') && (
          <TouchableOpacity onPress={triggerCollision}>
            <GlassPanel padding={10}>
              <Text style={{ color: '#FF5C7A', fontSize: 11, fontWeight: '600' }}>
                Test Alert
              </Text>
            </GlassPanel>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const cStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050709',
  },
  speedBg: {
    backgroundColor: '#0A0D14',
  },
  speedBgGlow: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: '45%',
    height: '80%',
    borderRadius: 999,
    backgroundColor: 'rgba(74,243,208,0.07)',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    // top and bottom dark gradients simulated via pointerEvents none
  },
  topBar: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  // Speed HUD
  speedHUD: {
    minWidth: 200,
  },
  speedHUDInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hudKmh: {
    fontFamily: MONO,
    fontSize: 8,
    letterSpacing: 1.5,
    color: C_DIM2,
    marginBottom: 2,
  },
  hudSpeed: {
    color: C_FG,
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: -1.5,
    lineHeight: 30,
  },
  hudStatLbl: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.4,
    color: C_DIM2,
  },
  hudStatVal: {
    color: C_FG,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 20,
  },
  hudLabel: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1,
    color: C_DIM2,
  },
  // Battery HUD
  battHUD: {
    minWidth: 170,
  },
  battNum: {
    color: C_FG,
    fontSize: 26,
    fontWeight: '300',
  },
  battTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  battFill: {
    height: '100%',
    backgroundColor: C_ACCENT,
    borderRadius: 2,
  },
  // Nav HUD
  navHUD: {
    alignSelf: 'center',
  },
  navArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navStat: {
    color: C_FG,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  navDivider: {
    width: 1,
    height: 14,
    backgroundColor: C_BORDER,
  },
  // Music HUD
  musicHUD: {
    minWidth: 200,
  },
  albumArt: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FF3B5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songTitle: {
    color: C_FG,
    fontSize: 13,
    fontWeight: '600',
  },
  // Speed hero center
  speedHeroCenter: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  heroKmh: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 2.4,
    color: C_DIM2,
    marginBottom: 2,
  },
  heroSpeed: {
    color: C_FG,
    fontSize: 110,
    fontWeight: '100',
    lineHeight: 100,
    letterSpacing: -7,
  },
  heroStatLbl: {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: 1.8,
    color: C_DIM2,
  },
  heroStatVal: {
    color: C_FG,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  // Camera tag
  camTag: {
    position: 'absolute',
    top: 50,
    left: 12,
    zIndex: 10,
  },
  // Floating widget positions
  bottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    gap: 8,
    zIndex: 10,
  },
  bottomCenter: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    gap: 8,
    alignItems: 'flex-end',
    zIndex: 10,
  },
});

// ── Dark map style ────────────────────────────────────────────────────────────
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#08101e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4AF3D0' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#08101e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#243545' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050d18' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Main export — decides which layout to render
// ═══════════════════════════════════════════════════════════════════════════════
export default function CyclingDashboard({ selectedWidgets, locationState, bleData, cameraStreamUrl, onCameraSettings }: Props) {
  const ids = new Set(selectedWidgets.map(w => w.id));

  const speed = bleData?.speed ?? cyclingDefaults.speed;
  const battery = bleData?.battery ?? cyclingDefaults.battery;
  const bleConnected = bleData?.connected ?? false;

  // Variation A: minimal (only speed + battery selected, nothing else)
  const isMinimal =
    ids.has('speed') &&
    ids.has('battery') &&
    !ids.has('map') &&
    !ids.has('camera') &&
    !ids.has('music') &&
    !ids.has('weather') &&
    !ids.has('hydration') &&
    !ids.has('calendar') &&
    !ids.has('collision');

  if (selectedWidgets.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: A_BG, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ color: A_DIM, fontSize: 16, fontWeight: '600' }}>No widgets selected</Text>
        <Text style={{ color: A_DIM, fontSize: 13, opacity: 0.7 }}>Switch to gallery to pick some</Text>
      </View>
    );
  }

  if (isMinimal) return <LayoutA speed={speed} battery={battery} bleConnected={bleConnected} />;
  return <LayoutC ids={ids} locationState={locationState} bleData={bleData} cameraStreamUrl={cameraStreamUrl} onCameraSettings={onCameraSettings} />;
}
