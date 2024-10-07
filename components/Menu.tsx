import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { useNearbyRestaurants } from "@/hooks/useNearby";

const menuItems = [
  { id: '1', title: 'Restaurants', icon: '🍽️' },
  { id: '2', title: 'Parks', icon: '🌳' },
  { id: '3', title: 'Clubs', icon: '🎵' },
  { id: '4', title: 'Adventure', icon: '🏃' },
  { id: '5', title: 'Museums', icon: '🏛️' },
];

const Menu = () => {
  const [selectedItem, setSelectedItem] = useState(menuItems[0]);
  const { restaurants, loading, error } = useNearbyRestaurants(5000, 100);

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      "★".repeat(fullStars) +
      (hasHalfStar ? "½" : "") +
      "☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))
    );
  };

  const renderRestaurantItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.photos && item.photos.length > 0 ? item.photos[0] : 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.ratingText}>
          {renderRatingStars(item.rating)} {item.rating} ({item.userRatingsTotal} reviews)
        </Text>
        <Text style={styles.addressText}>{item.shortAddress}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.menuContainer}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              selectedItem.id === item.id && styles.selectedMenuItem,
            ]}
            onPress={() => setSelectedItem(item)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.menuText,
                selectedItem.id === item.id && styles.selectedMenuText,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.contentContainer}>
        <Text style={styles.contentTitle}>{selectedItem.title}</Text>
        <Text style={styles.contentSubtitle}>
          Popular {selectedItem.title.toLowerCase()} to visit this weekend:
        </Text>
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:36
  },
  menuContainer: {
    flexGrow: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItem: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  selectedMenuItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  menuIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  menuText: {
    fontSize: 12,
    color: '#666',
  },
  selectedMenuText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
    paddingTop: 10,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
  },
  cardContent: {
    flex: 1,
    padding: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
  },
});

export default Menu;