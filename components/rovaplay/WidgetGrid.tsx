import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { widgets } from '../../constants/mockData';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function WidgetGrid() {
  const [activeWidgets, setActiveWidgets] = useState<Set<string>>(
    new Set(['map', 'music', 'speed', 'battery', 'collision'])
  );

  const toggleWidget = (id: string) => {
    setActiveWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderWidget = ({ item }: { item: typeof widgets[number] }) => {
    const isActive = activeWidgets.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => toggleWidget(item.id)}
        activeOpacity={0.75}
      >
        <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
          <Ionicons
            name={item.icon as IoniconsName}
            size={26}
            color={isActive ? Colors.accent : Colors.textSecondary}
          />
        </View>
        <Text style={[styles.cardLabel, isActive && styles.cardLabelActive]}>
          {item.label}
        </Text>
        {isActive && (
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.accent} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={widgets}
        renderItem={renderWidget}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
      />
      <Text style={styles.hint}>
        {activeWidgets.size} of {widgets.length} widgets active
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    gap: 12,
  },
  row: {
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
    position: 'relative',
    minHeight: 100,
  },
  cardActive: {
    borderColor: Colors.accent,
    backgroundColor: '#0D1F2D',
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#22223A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconWrapperActive: {
    backgroundColor: '#0A2A22',
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  cardLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
});
