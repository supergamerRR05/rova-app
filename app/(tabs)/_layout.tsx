import { Tabs } from 'expo-router';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Colors } from '../../theme/colors';
import { Icon } from '../../components/Icon';

interface TabIconProps {
  name: string;
  color: string;
  size: number;
  focused: boolean;
  isCenter?: boolean;
}

function TabIcon({ name, color, size, focused, isCenter }: TabIconProps) {
  if (isCenter) {
    return (
      <View style={[styles.centerTabIcon, focused && styles.centerTabIconFocused]}>
        <Icon name={name} size={size + 6} color={focused ? Colors.primary : '#888'} />
      </View>
    );
  }
  return <Icon name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isLandscape ? { display: 'none' } : styles.tabBar,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="drive"
        options={{
          title: 'Drive',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="car.side.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="heart.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rovaplay"
        options={{
          title: 'RovaPlay',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="play.circle.fill" color={color} size={size} focused={focused} isCenter />
          ),
          tabBarLabelStyle: [styles.tabLabel, styles.centerTabLabel],
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person.2.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBarBackground,
    borderTopColor: '#1A1A2E',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  centerTabLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  centerTabIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0D1520',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
    borderWidth: 1.5,
    borderColor: '#1E2A3A',
  },
  centerTabIconFocused: {
    backgroundColor: '#0A1828',
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
