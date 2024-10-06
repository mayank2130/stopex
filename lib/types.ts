export interface Restaurant {
    name: string;
    address: string;
    shortAddress: string;
    location: {
      latitude: number;
      longitude: number;
    };
    photos: string[];
    rating: number;
    userRatingsTotal: number;
    priceLevel?: number;
    isOpen?: boolean;
  }
  