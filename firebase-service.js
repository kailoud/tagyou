// Firebase Service - Data Operations
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase-config.js';

// Check if Firebase is properly initialized
function checkFirebaseConnection() {
  if (!db) {
    throw new Error('Firebase not initialized. Please check your configuration.');
  }
}

// Food Stalls Service
export class FoodStallsService {
  static async getAllFoodStalls() {
    try {
      checkFirebaseConnection();
      const querySnapshot = await getDocs(collection(db, 'foodStalls'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching food stalls:', error);
      return [];
    }
  }

  static async getFoodStallsByLocation(location) {
    try {
      const q = query(
        collection(db, 'foodStalls'),
        where('location', '==', location)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching food stalls by location:', error);
      return [];
    }
  }

  static async addFoodStall(foodStallData) {
    try {
      const docRef = await addDoc(collection(db, 'foodStalls'), foodStallData);
      return { id: docRef.id, ...foodStallData };
    } catch (error) {
      console.error('Error adding food stall:', error);
      throw error;
    }
  }

  static async updateFoodStall(id, updates) {
    try {
      const docRef = doc(db, 'foodStalls', id);
      await updateDoc(docRef, updates);
      return { id, ...updates };
    } catch (error) {
      console.error('Error updating food stall:', error);
      throw error;
    }
  }

  static async deleteFoodStall(id) {
    try {
      await deleteDoc(doc(db, 'foodStalls', id));
      return true;
    } catch (error) {
      console.error('Error deleting food stall:', error);
      throw error;
    }
  }
}

// Artists Service
export class ArtistsService {
  static async getAllArtists() {
    try {
      const querySnapshot = await getDocs(collection(db, 'artists'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching artists:', error);
      return [];
    }
  }

  static async getArtistsByGenre(genre) {
    try {
      const q = query(
        collection(db, 'artists'),
        where('genres', 'array-contains', genre)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching artists by genre:', error);
      return [];
    }
  }

  static async addArtist(artistData) {
    try {
      const docRef = await addDoc(collection(db, 'artists'), artistData);
      return { id: docRef.id, ...artistData };
    } catch (error) {
      console.error('Error adding artist:', error);
      throw error;
    }
  }

  static async updateArtist(id, updates) {
    try {
      const docRef = doc(db, 'artists', id);
      await updateDoc(docRef, updates);
      return { id, ...updates };
    } catch (error) {
      console.error('Error updating artist:', error);
      throw error;
    }
  }
}

// User Favorites Service
export class UserFavoritesService {
  static async getUserFavorites(userId) {
    try {
      const docRef = doc(db, 'userFavorites', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Initialize empty favorites
        await setDoc(docRef, {
          foodStalls: [],
          artists: [],
          festivals: []
        });
        return { foodStalls: [], artists: [], festivals: [] };
      }
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      return { foodStalls: [], artists: [], festivals: [] };
    }
  }

  static async addToFavorites(userId, type, itemId) {
    try {
      const docRef = doc(db, 'userFavorites', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const favorites = docSnap.data();
        if (!favorites[type].includes(itemId)) {
          favorites[type].push(itemId);
          await updateDoc(docRef, favorites);
        }
      } else {
        await setDoc(docRef, {
          [type]: [itemId]
        });
      }
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(userId, type, itemId) {
    try {
      const docRef = doc(db, 'userFavorites', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const favorites = docSnap.data();
        favorites[type] = favorites[type].filter(id => id !== itemId);
        await updateDoc(docRef, favorites);
      }
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }
}

// Real-time Listeners
export class RealtimeService {
  static subscribeToFoodStalls(callback) {
    return onSnapshot(collection(db, 'foodStalls'), (snapshot) => {
      const foodStalls = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(foodStalls);
    });
  }

  static subscribeToArtists(callback) {
    return onSnapshot(collection(db, 'artists'), (snapshot) => {
      const artists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(artists);
    });
  }

  static subscribeToUserFavorites(userId, callback) {
    return onSnapshot(doc(db, 'userFavorites', userId), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        callback({ foodStalls: [], artists: [], festivals: [] });
      }
    });
  }
}

// Initialize default data (for first-time setup)
export async function initializeDefaultData() {
  try {
    // Check if food stalls collection is empty
    const foodStallsSnapshot = await getDocs(collection(db, 'foodStalls'));
    if (foodStallsSnapshot.empty) {
      console.log('Initializing default food stalls data...');

      const defaultFoodStalls = [
        {
          name: "Caribbean Spice Kitchen",
          lat: 51.517871,
          lng: -0.205163,
          location: "Ladbroke Grove",
          description: "Authentic Jamaican jerk chicken and Caribbean cuisine",
          specialties: ["Jerk Chicken", "Curry Goat", "Rice & Peas", "Plantain"],
          rating: 4.8,
          priceRange: "££",
          image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
          hours: "11:00 AM - 8:00 PM",
          phone: "+44 20 7123 4567"
        },
        {
          name: "Notting Hill Jerk House",
          lat: 51.515638,
          lng: -0.201236,
          location: "Portobello Road",
          description: "Traditional jerk chicken with secret family recipe",
          specialties: ["Jerk Chicken", "Jerk Pork", "Ackee & Saltfish", "Callaloo"],
          rating: 4.9,
          priceRange: "££",
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
          hours: "10:00 AM - 9:00 PM",
          phone: "+44 20 7123 4568"
        },
        {
          name: "Island Flavours",
          lat: 51.516875,
          lng: -0.200021,
          location: "Westbourne Grove",
          description: "Fresh Caribbean street food and traditional dishes",
          specialties: ["Jerk Chicken", "Roti", "Doubles", "Sorrel Drink"],
          rating: 4.7,
          priceRange: "£",
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
          hours: "12:00 PM - 7:00 PM",
          phone: "+44 20 7123 4569"
        }
      ];

      for (const stall of defaultFoodStalls) {
        await FoodStallsService.addFoodStall(stall);
      }
    }

    // Check if artists collection is empty
    const artistsSnapshot = await getDocs(collection(db, 'artists'));
    if (artistsSnapshot.empty) {
      console.log('Initializing default artists data...');

      const defaultArtists = [
        {
          name: "DJ Shy FX",
          lat: 51.517674,
          lng: -0.200438,
          location: "Ladbroke Grove",
          description: "Legendary drum & bass and jungle pioneer",
          genres: ["Drum & Bass", "Jungle", "UK Garage", "Reggae"],
          rating: 4.9,
          performanceTime: "3:00 PM - 4:30 PM",
          stage: "Main Float Route",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
          phone: "+44 20 7123 4570",
          experience: "25+ years in UK dance music scene"
        },
        {
          name: "Steel Pulse",
          lat: 51.522428,
          lng: -0.203347,
          location: "Portobello Road",
          description: "Grammy-winning reggae legends from Birmingham",
          genres: ["Reggae", "Roots", "Conscious Music", "Political Lyrics"],
          rating: 4.8,
          performanceTime: "5:00 PM - 6:30 PM",
          stage: "Cultural Stage",
          image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
          phone: "+44 20 7123 4571",
          experience: "40+ years of reggae excellence"
        },
        {
          name: "London Samba Collective",
          lat: 51.518363,
          lng: -0.210441,
          location: "Westbourne Grove",
          description: "Energetic Brazilian samba rhythms and percussion",
          genres: ["Samba", "Batucada", "Brazilian Rhythms", "Carnival Music"],
          rating: 4.7,
          performanceTime: "2:00 PM - 3:30 PM",
          stage: "Parade Route",
          image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
          phone: "+44 20 7123 4572",
          experience: "15+ years of carnival performances"
        }
      ];

      for (const artist of defaultArtists) {
        await ArtistsService.addArtist(artist);
      }
    }

    console.log('Default data initialization complete!');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}
