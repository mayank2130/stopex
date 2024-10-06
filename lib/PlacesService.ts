import { Restaurant } from "./types";

const GOOGLE_MAPS_API_KEY = "AIzaSyC0irfQcr35vMdiO4_AvNn0hkP7n6NZ7pQ";

export class PlacesService {
    private static async delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    static async getNearbyRestaurants(
      latitude: number, 
      longitude: number, 
      radius: number = 5000,
      maxResults: number = 100
    ): Promise<Restaurant[]> {
      try {
        console.log('Fetching restaurants for:', { latitude, longitude });
        
        let allResults: any[] = [];
        const processedPlaceIds = new Set<string>();
        let nextPageToken: string | null = null;
        let pageCount = 0;
  
        do {
          // Construct the URL properly - using radius parameter
          const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
            `location=${latitude},${longitude}` +
            `&radius=${radius}` +
            `&type=restaurant` +
            `&key=${GOOGLE_MAPS_API_KEY}`;
  
          const url = nextPageToken 
            ? `${baseUrl}&pagetoken=${nextPageToken}`
            : baseUrl;
  
          console.log(`Fetching page ${pageCount + 1}`);
          const response = await fetch(url);
          const data = await response.json();
          console.log('API Response Status:', data.status);
  
          if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('API Error:', data);
            break;
          }
  
          // Filter out duplicates and add new results
          const newResults = (data.results || []).filter((place: any) => 
            !processedPlaceIds.has(place.place_id)
          );
  
          newResults.forEach((place: any) => {
            processedPlaceIds.add(place.place_id);
          });
  
          allResults = [...allResults, ...newResults];
          console.log(`Found ${newResults.length} new restaurants (total: ${allResults.length})`);
  
          nextPageToken = data.next_page_token;
          pageCount++;
  
          // Break if we've reached maximum desired results
          if (allResults.length >= maxResults) {
            console.log(`Reached maximum results limit (${maxResults})`);
            break;
          }
  
          // If there's a next page, wait before making the next request
          if (nextPageToken) {
            await this.delay(2000);
          }
        } while (nextPageToken && pageCount < 3); // Max 3 pages
  
        console.log(`Total unique restaurants found: ${allResults.length}`);
  
        // Sort results by rating and number of reviews
        allResults.sort((a, b) => {
          const scoreA = ((a.rating || 0) * Math.log(a.user_ratings_total + 1));
          const scoreB = ((b.rating || 0) * Math.log(b.user_ratings_total + 1));
          return scoreB - scoreA;
        });
  
        // Limit to maxResults
        allResults = allResults.slice(0, maxResults);
  
        // Process restaurant details
        const processedRestaurants = await Promise.all(
          allResults.map(async (place: any) => {
            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
                `place_id=${place.place_id}` +
                `&fields=name,formatted_address,geometry,photos,rating,user_ratings_total,price_level,opening_hours` +
                `&key=${GOOGLE_MAPS_API_KEY}`;
              
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();
  
              if (detailsData.status === 'OK' && detailsData.result) {
                const details = detailsData.result;
  
                return {
                  name: details.name || place.name,
                  address: details.formatted_address || place.vicinity,
                  shortAddress: place.vicinity,
                  location: {
                    latitude: details.geometry?.location.lat || place.geometry.location.lat,
                    longitude: details.geometry?.location.lng || place.geometry.location.lng,
                  },
                  photos: details.photos 
                    ? details.photos.map((photo: any) => 
                        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
                      )
                    : [],
                  rating: details.rating || place.rating || 0,
                  userRatingsTotal: details.user_ratings_total || place.user_ratings_total || 0,
                  priceLevel: details.price_level !== undefined ? details.price_level : place.price_level,
                  isOpen: details.opening_hours?.open_now,
                };
              }
  
              // Fallback to basic information
              return {
                name: place.name,
                address: place.vicinity,
                shortAddress: place.vicinity,
                location: {
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                },
                photos: place.photos 
                  ? place.photos.map((photo: any) => 
                      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
                    )
                  : [],
                rating: place.rating || 0,
                userRatingsTotal: place.user_ratings_total || 0,
                priceLevel: place.price_level,
                isOpen: place.opening_hours?.open_now,
              };
            } catch (error) {
              console.error('Error processing restaurant details:', error);
              return null;
            }
          })
        );
  
        return processedRestaurants.filter((restaurant): restaurant is Restaurant => 
          restaurant !== null
        );
      } catch (error) {
        console.error('Error fetching nearby restaurants:', error);
        throw error;
      }
    }
  }
