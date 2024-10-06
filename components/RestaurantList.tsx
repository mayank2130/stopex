import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNearbyRestaurants } from "@/hooks/useNearby";

const FETCH_CONFIG = {
  maxRadius: 5000, // 5km
  maxResults: 100, // Maximum number of restaurants to fetch
};

export const RestaurantList = () => {
    const { restaurants, loading, error, refetch } = useNearbyRestaurants(5000, 100);

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      "★".repeat(fullStars) +
      (hasHalfStar ? "½" : "") +
      "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Finding nearby restaurants...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Text style={styles.retryText} onPress={refetch}>
            Tap to retry
          </Text>
        </View>
      );
    }

    if (!restaurants || restaurants.length === 0) {
      return (
        <View style={styles.center}>
          <Text>No restaurants found nearby</Text>
          <Text style={styles.retryText} onPress={refetch}>
            Tap to retry
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={restaurants}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              {item.photos && item.photos.length > 0 ? (
                <Image
                  source={{ uri: item.photos[0] }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No Image Available</Text>
                </View>
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStars}>
                  {renderRatingStars(item.rating)}
                </Text>
                <Text style={styles.ratingText}>
                  {item.rating} ({item.userRatingsTotal} reviews)
                </Text>
              </View>
              <Text style={styles.address}>{item.shortAddress}</Text>
              {item.priceLevel !== undefined && (
                <Text style={styles.priceLevel}>
                  {"$".repeat(item.priceLevel + 1)}
                </Text>
              )}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      />
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
  },
  info: {
    padding: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ratingStars: {
    color: "#FFD700",
    marginRight: 5,
  },
  ratingText: {
    color: "#666",
    fontSize: 14,
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  priceLevel: {
    color: "#2E8B57",
    fontSize: 14,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  retryText: {
    color: "blue",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
