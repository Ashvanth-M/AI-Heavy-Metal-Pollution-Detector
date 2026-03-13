import { useState, useEffect, useCallback, useRef } from 'react';
import { GeolocationService, GeolocationPosition, GeolocationError } from '@/services/geolocation';

interface UseGeolocationResult {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  loading: boolean;
  refresh: () => void;
  getCurrentLocation: () => Promise<void>;
  hasPermission: boolean | null;
}

export function useGeolocation(options?: {
  enableWatch?: boolean;
  immediate?: boolean;
}): UseGeolocationResult {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  
  // Use ref to store the service to avoid dependency issues
  const geolocationServiceRef = useRef(GeolocationService.getInstance());

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const newPosition = await geolocationServiceRef.current.getCurrentPosition();
      setPosition(newPosition);
      setHasPermission(true);
    } catch (err) {
      const geoError = err as GeolocationError;
      setError(geoError);
      setHasPermission(geoError.code === 1 ? false : null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const startWatching = useCallback(async () => {
    if (!options?.enableWatch) return;

    try {
      const id = await geolocationServiceRef.current.watchPosition(
        (newPosition) => {
          setPosition(newPosition);
          setHasPermission(true);
        },
        (watchError) => {
          setError(watchError);
          setHasPermission(watchError.code === 1 ? false : null);
        }
      );
      setWatchId(id);
    } catch (err) {
      const geoError = err as GeolocationError;
      setError(geoError);
      setHasPermission(geoError.code === 1 ? false : null);
    }
  }, [options?.enableWatch]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      geolocationServiceRef.current.stopWatching(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Check permissions on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setHasPermission(result.state === 'granted');
        
        result.addEventListener('change', () => {
          setHasPermission(result.state === 'granted');
        });
      });
    }
  }, []);

  // Get initial position if immediate is true (default)
  useEffect(() => {
    if (options?.immediate !== false) {
      getCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, ignore getCurrentLocation dependency

  // Start watching if enabled
  useEffect(() => {
    if (options?.enableWatch) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.enableWatch]); // Only depend on enableWatch option

  return {
    position,
    error,
    loading,
    refresh,
    getCurrentLocation,
    hasPermission
  };
}