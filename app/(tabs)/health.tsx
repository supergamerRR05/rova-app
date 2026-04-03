import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

export default function HealthScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Health</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
});
