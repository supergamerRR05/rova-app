import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '../Icon';

export type Widget = { id: string; label: string; description?: string; icon: string };

interface Props {
  widgets: Widget[];
  activeWidgets: Set<string>;
  onToggle: (id: string) => void;
}

const ACCENT = '#7DD3FC';        // light blue
const MANDATORY = new Set(['speed', 'battery']);

export default function WidgetGrid({ widgets, activeWidgets, onToggle }: Props) {
  // Speed is always the hero (full-width). Rest are 2-col pairs.
  const speedWidget = widgets.find(w => w.id === 'speed');
  const restWidgets = widgets.filter(w => w.id !== 'speed');

  // Pair up the rest into rows of 2
  const rows: Widget[][] = [];
  for (let i = 0; i < restWidgets.length; i += 2) {
    rows.push(restWidgets.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {/* Hero card — Speed */}
      {speedWidget && (
        <WidgetCard
          widget={speedWidget}
          active={activeWidgets.has(speedWidget.id)}
          mandatory
          onToggle={onToggle}
          hero
        />
      )}

      {/* Remaining widgets in pairs */}
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map(widget => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              active={activeWidgets.has(widget.id)}
              mandatory={MANDATORY.has(widget.id)}
              onToggle={onToggle}
            />
          ))}
          {/* Spacer if odd widget at end of row */}
          {row.length === 1 && <View style={styles.cardHalf} />}
        </View>
      ))}
    </View>
  );
}

function WidgetCard({
  widget,
  active,
  mandatory,
  onToggle,
  hero = false,
}: {
  widget: Widget;
  active: boolean;
  mandatory: boolean;
  onToggle: (id: string) => void;
  hero?: boolean;
}) {
  const handlePress = () => {
    if (!mandatory) onToggle(widget.id);
  };

  const bg = active ? ACCENT : '#111827';
  const iconColor = active ? '#0A0F1A' : '#4A5568';
  const labelColor = active ? '#0A0F1A' : '#F5F7FA';
  const descColor = active ? '#1A3A4A' : '#4A5568';
  const checkBg = active ? '#0A0F1A' : 'transparent';
  const checkBorder = active ? '#0A0F1A' : '#2A3548';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={mandatory ? 1 : 0.75}
      style={[
        styles.card,
        hero ? styles.cardHero : styles.cardHalf,
        { backgroundColor: bg },
      ]}
    >
      {/* Icon */}
      <Icon name={widget.icon} size={28} color={iconColor} />

      {/* Checkmark badge */}
      <View
        style={[
          styles.checkBadge,
          { backgroundColor: checkBg, borderColor: checkBorder },
          active && styles.checkBadgeActive,
        ]}
      >
        {active && (
          <Icon name="checkmark.circle.fill" size={18} color="#F5F7FA" />
        )}
      </View>

      {/* Labels at bottom */}
      <View style={styles.cardFooter}>
        <Text style={[styles.cardLabel, { color: labelColor }]}>{widget.label}</Text>
        {widget.description && (
          <Text style={[styles.cardDesc, { color: descColor }]}>{widget.description}</Text>
        )}
        {mandatory && (
          <Text style={[styles.requiredTag, { color: active ? '#1A3A4A' : '#2A3548' }]}>
            required
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardHero: {
    height: 170,
  },
  cardHalf: {
    flex: 1,
    height: 165,
  },
  checkBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeActive: {
    borderWidth: 0,
  },
  cardFooter: {
    gap: 2,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '400',
  },
  requiredTag: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'lowercase',
  },
});
