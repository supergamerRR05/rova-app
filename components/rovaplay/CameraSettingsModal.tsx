import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Props {
  visible: boolean;
  currentIp: string;
  isConnected: boolean;
  onSave: (ip: string) => void;
  onClose: () => void;
}

export default function CameraSettingsModal({ visible, currentIp, isConnected, onSave, onClose }: Props) {
  const [ip, setIp] = useState(currentIp);

  const handleSave = () => {
    onSave(ip);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity activeOpacity={1}>
            <View style={s.card}>
              <Text style={s.title}>ESP32 Camera</Text>
              <Text style={s.subtitle}>
                Enter the IP address of your ESP32-CAM.{'\n'}
                Make sure your phone is on the same WiFi.
              </Text>

              <View style={s.statusRow}>
                <View style={[s.dot, { backgroundColor: isConnected ? '#4AF3D0' : '#555' }]} />
                <Text style={s.statusText}>{isConnected ? 'Connected' : 'Not connected'}</Text>
              </View>

              <TextInput
                style={s.input}
                value={ip}
                onChangeText={setIp}
                placeholder="192.168.1.100"
                placeholderTextColor="#444"
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={s.hint}>Stream URL: http://{ip || '...'}/stream</Text>

              <View style={s.buttonRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                  <Text style={s.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#0F1520',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 24,
    width: 320,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#1A2235',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginBottom: 8,
  },
  hint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#4AF3D0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#050D18',
    fontSize: 15,
    fontWeight: '700',
  },
});
