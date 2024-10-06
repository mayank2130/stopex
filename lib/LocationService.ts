import * as Location from 'expo-location';

export class LocationService {
  static async getCurrentLocation() {
    try {
      // First check if location services are enabled
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        throw new Error('Location services are not enabled');
      }

      // Then check for permissions
      let { status } = await Location.getForegroundPermissionsAsync();
      
      // If permission not granted, request it
      if (status !== 'granted') {
        status = (await Location.requestForegroundPermissionsAsync()).status;
        if (status !== 'granted') {
          throw new Error('Permission to access location was denied');
        }
      }

      // Get location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }
}