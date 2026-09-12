/**
 * Helper to fetch client Geolocation coordinates
 */
export const DEFAULT_DEMO_COORDINATES = {
  latitude: 18.5204,
  longitude: 73.8567,
  city: 'Metro Emergency Zone',
};

export function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser. Using demo coordinates.');
      return resolve(DEFAULT_DEMO_COORDINATES);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        console.warn('Geolocation access denied or unavailable. Using default demo location.', error.message);
        resolve(DEFAULT_DEMO_COORDINATES);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}
