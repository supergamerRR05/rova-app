import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Icon } from '../Icon';

export type Widget = { id: string; label: string; icon: string };

interface Props {
  activeWidgets: Set<string>;
  onToggle: (id: string) => void;
  orderedWidgets: Widget[];
  onReorder: (data: Widget[]) => void;
}

export default function WidgetGrid({ activeWidgets, onToggle, orderedWidgets, onReorder }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const jiggleAnim = useRef(new Animated.Value(0)).current;
  const jiggleRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (editMode) {
      jiggleRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(jiggleAnim, { toValue: 1, duration: 75, useNativeDriver: true }),
          Animated.timing(jiggleAnim, { toValue: -1, duration: 75, useNativeDriver: true }),
          Animated.timing(jiggleAnim, { toValue: 0.7, duration: 65, useNativeDriver: true }),
          Animated.timing(jiggleAnim, { toValue: -0.7, duration: 65, useNativeDriver: true }),
        ])
      );
      jiggleRef.current.start();
    } else {
      jiggleRef.current?.stop();
      Animated.timing(jiggleAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start();
    }
    return () => jiggleRef.current?.stop();
  }, [editMode]);

  const rotation = jiggleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2.5deg', '2.5deg'],
  });

  const handlePress = (id: string) => {
    if (!editMode) {
      onToggle(id);
      return;
    }
    if (selectedId === null) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else {
      // Swap the two positions
      const a = orderedWidgets.findIndex(w => w.id === selectedId);
      const b = orderedWidgets.findIndex(w => w.id === id);
      const next = [...orderedWidgets];
      [next[a], next[b]] = [next[b], next[a]];
      onReorder(next);
      setSelectedId(null);
    }
  };

  const handleLongPress = (id: string) => {
    if (!editMode) {
      setEditMode(true);
      setSelectedId(id);
    }
  };

  const renderItem = ({ item }: { item: Widget }) => {
    const active = activeWidgets.has(item.id);
    const isSelected = editMode && selectedId === item.id;

    return (
      <Animated.View
        style={[
          styles.cardWrap,
          editMode && { transform: [{ rotate: rotation }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.card,
            active && styles.cardActive,
            isSelected && styles.cardSelected,
          ]}
          onPress={() => handlePress(item.id)}
          onLongPress={() => handleLongPress(item.id)}
          activeOpacity={0.75}
          delayLongPress={300}
        >
          <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
            <Icon
              name={item.icon}
              size={26}
              color={isSelected ? Colors.primary : active ? Colors.accent : Colors.textSecondary}
            />
          </View>
          <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>
            {item.label}
          </Text>

          {/* Normal mode: checkmark for active */}
          {!editMode && active && (
            <View style={styles.badge}>
              <Icon name="checkmark.circle.fill" size={14} color={Colors.accent} />
            </View>
          )}

          {/* Edit mode: move indicator */}
          {editMode && (
            <View style={styles.badge}>
              <Icon
                name={isSelected ? 'arrow.up.arrow.down' : 'line.3.horizontal'}
                size={12}
                color={isSelected ? Colors.primary : Colors.textSecondary}
              />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Edit mode toolbar */}
      {editMode && (
        <View style={styles.editBar}>
          <Text style={styles.editBarText}>
            {selectedId ? 'Tap a widget to swap' : 'Tap a widget to move it'}
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => { setEditMode(false); setSelectedId(null); }}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={orderedWidgets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
      />

      {!editMode && (
        <Text style={styles.hint}>
          {activeWidgets.size} of {orderedWidgets.length} active · hold to reorder
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  editBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A1228',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  editBarText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 10,
  },
  doneText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    gap: 12,
  },
  row: {
    gap: 12,
    justifyContent: 'space-between',
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
    minHeight: 100,
  },
  cardActive: {
    borderColor: Colors.accent,
    backgroundColor: '#0A1828',
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#0A1828',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#1A2235',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconWrapperActive: {
    backgroundColor: '#0A1E38',
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
  badge: {
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
