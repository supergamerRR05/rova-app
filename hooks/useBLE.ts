import { useState, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';

// UUIDs — must match what's flashed on the ESP32
const SERVICE_UUID = '4FAFC201-1FB5-459E-8FCC-C5C9C331914B';
const SPEED_CHAR_UUID = 'BEB5483E-36E1-4688-B7F5-EA07361B26A8';
const BATTERY_CHAR_UUID = 'BEB5483F-36E1-4688-B7F5-EA07361B26A8';

export interface BLEData {
  speed: number | null;
  battery: number | null;
  connected: boolean;
  scanning: boolean;
}

const manager = new BleManager();

export function useBLE() {
  const [data, setData] = useState<BLEData>({ speed: null, battery: null, connected: false, scanning: false });
  const deviceRef = useRef<Device | null>(null);
  const stopScanRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopScanRef.current?.();
      deviceRef.current?.cancelConnection();
    };
  }, []);

  const disconnect = useCallback(async () => {
    stopScanRef.current?.();
    await deviceRef.current?.cancelConnection();
    deviceRef.current = null;
    setData(prev => ({ ...prev, connected: false, scanning: false }));
  }, []);

  const startScan = useCallback(async () => {
    // BLE only works on real devices
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const state = await manager.state();
      if (state !== State.PoweredOn) {
        return;
      }
    }

    await disconnect();
    setData(prev => ({ ...prev, scanning: true }));

    manager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
      if (error || !device) return;
      if (!device.name?.includes('ESP32') && !device.name?.includes('Rova')) return;

      manager.stopDeviceScan();
      stopScanRef.current = null;

      try {
        const connected = await device.connect();
        const discovered = await connected.discoverAllServicesAndCharacteristics();
        deviceRef.current = discovered;
        setData(prev => ({ ...prev, connected: true, scanning: false }));

        discovered.monitorCharacteristicForService(
          SERVICE_UUID,
          SPEED_CHAR_UUID,
          (err, char) => {
            if (err || !char?.value) return;
            const bytes = Buffer.from(char.value, 'base64');
            const speed = bytes.readFloatLE(0);
            setData(prev => ({ ...prev, speed: Math.round(speed * 10) / 10 }));
          }
        );

        discovered.monitorCharacteristicForService(
          SERVICE_UUID,
          BATTERY_CHAR_UUID,
          (err, char) => {
            if (err || !char?.value) return;
            const bytes = Buffer.from(char.value, 'base64');
            const battery = bytes.readUInt8(0);
            setData(prev => ({ ...prev, battery }));
          }
        );

        discovered.onDisconnected(() => {
          deviceRef.current = null;
          setData(prev => ({ ...prev, connected: false, speed: null, battery: null }));
        });
      } catch {
        setData(prev => ({ ...prev, scanning: false, connected: false }));
      }
    });

    stopScanRef.current = () => manager.stopDeviceScan();
    // Stop scanning after 15 seconds if no device found
    setTimeout(() => {
      manager.stopDeviceScan();
      setData(prev => ({ ...prev, scanning: false }));
    }, 15000);
  }, [disconnect]);

  return { ...data, startScan, disconnect };
}
