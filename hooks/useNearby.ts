import { useState, useEffect } from 'react';
import { Restaurant } from '@/lib/types';
import { LocationService } from '@/lib/LocationService';
import { PlacesService } from '@/lib/PlacesService';

export const useNearbyRestaurants = (radius: number = 5000, maxResults: number = 100) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting to fetch restaurants...');
      const location = await LocationService.getCurrentLocation();
      console.log('Got location:', location);

      const nearbyRestaurants = await PlacesService.getNearbyRestaurants(
        location.latitude,
        location.longitude,
        radius,
        maxResults
      );

      console.log(`Successfully fetched ${nearbyRestaurants.length} restaurants`);
      setRestaurants(nearbyRestaurants);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error in useNearbyRestaurants:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [radius, maxResults]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
  };
};