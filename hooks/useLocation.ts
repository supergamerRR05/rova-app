import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationState {
  location: Location.LocationObject | null;
  granted: boolean | null; // null = not yet asked
  error: string | null;
}

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    location: null,
    granted: null,
    error: null,
  });

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ location: null, granted: false, error: 'Location permission denied.' });
        return;
      }

      setState(prev => ({ ...prev, granted: true }));

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState(prev => ({ ...prev, location: initial }));

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        loc => setState(prev => ({ ...prev, location: loc }))
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  return state;
}
