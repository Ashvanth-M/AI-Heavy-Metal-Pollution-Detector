export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export class GeolocationService {
  private static instance: GeolocationService;

  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  public async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser'
        });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for better reliability
        maximumAge: 30000 // Cache for 30 seconds
      };

      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Validate coordinates before resolving
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            if (isNaN(latitude) || isNaN(longitude) || !isFinite(latitude) || !isFinite(longitude)) {
              reject({
                code: 2, // Using POSITION_UNAVAILABLE code
                message: 'Invalid coordinates received from geolocation service'
              });
              return;
            }
            
            resolve({
              latitude: latitude,
              longitude: longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            let message = 'Unknown error occurred';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location access denied. Please enable location services in your browser settings.';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable. Please try again later.';
                break;
              case error.TIMEOUT:
                message = 'Location request timed out. Please try again.';
                break;
            }
            console.error('Geolocation error:', error.code, message);
            reject({
              code: error.code,
              message
            });
          },
          options
        );
      } catch (e) {
        console.error('Unexpected error in geolocation service:', e);
        reject({
          code: 0,
          message: 'Unexpected error occurred while getting location'
        });
      }
    });
  }

  public async watchPosition(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationError) => void
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser'
        });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for better reliability
        maximumAge: 30000 // Cache for 30 seconds
      };

      try {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            // Validate coordinates before calling callback
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            
            if (isNaN(latitude) || isNaN(longitude) || !isFinite(latitude) || !isFinite(longitude)) {
              if (errorCallback) {
                errorCallback({
                  code: 2, // Using POSITION_UNAVAILABLE code
                  message: 'Invalid coordinates received from geolocation service'
                });
              }
              return;
            }
            
            callback({
              latitude: latitude,
              longitude: longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            if (errorCallback) {
              let message = 'Unknown error occurred';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                message = 'Location access denied. Please enable location services in your browser settings.';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable. Please try again later.';
                break;
              case error.TIMEOUT:
                message = 'Location request timed out. Please try again.';
                break;
            }
            console.error('Geolocation watch error:', error.code, message);
            errorCallback({
              code: error.code,
              message
            });
          }
        },
        options
      );
      
      resolve(watchId);
      } catch (e) {
        console.error('Unexpected error in geolocation watch service:', e);
        reject({
          code: 0,
          message: 'Unexpected error occurred while watching location'
        });
      }
    });
  }

  public stopWatching(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }

  public calculateDistance(
    pos1: GeolocationPosition,
    pos2: GeolocationPosition
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(pos2.latitude - pos1.latitude);
    const dLon = this.toRadians(pos2.longitude - pos1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(pos1.latitude)) * 
      Math.cos(this.toRadians(pos2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  public async reverseGeocode(position: GeolocationPosition): Promise<string> {
    try {
      // Using a CORS-friendly proxy for OpenStreetMap Nominatim
      const response = await fetch(
        `/api/geocode?lat=${position.latitude}&lon=${position.longitude}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const address = data.address;
          
          // Build a readable address
          const parts = [];
          if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village);
          if (address.state || address.region) parts.push(address.state || address.region);
          if (address.country) parts.push(address.country);
          
          if (parts.length > 0) {
            return parts.join(', ');
          }
        }
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }
    
    // Fallback to coordinates with better formatting
    return `Location (${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)})`;
  }
}