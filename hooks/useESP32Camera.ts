import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@esp32_camera_ip';

export function useESP32Camera() {
  const [cameraIp, setCameraIp] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(ip => {
      if (ip) setCameraIp(ip);
    });
  }, []);

  useEffect(() => {
    if (!cameraIp) {
      setIsConnected(false);
      return;
    }
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`http://${cameraIp}/`, { signal: AbortSignal.timeout(2000) });
        if (!cancelled) setIsConnected(res.ok || res.status > 0);
      } catch {
        if (!cancelled) setIsConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [cameraIp]);

  const saveIp = useCallback(async (ip: string) => {
    const trimmed = ip.trim();
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    setCameraIp(trimmed);
  }, []);

  const streamUrl = cameraIp ? `http://${cameraIp}/stream` : null;

  return { cameraIp, streamUrl, isConnected, saveIp };
}
