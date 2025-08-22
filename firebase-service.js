// Firebase Service - Data Operations
// Using CDN imports for better compatibility with live server
const {
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
  getDoc,
  serverTimestamp
} = firebase.firestore;

// Use global Firebase Firestore instance
const db = firebase.firestore();

// Check if Firebase is properly initialized
function checkFirebaseConnection() {
  if (!firebase.firestore) {
    throw new Error('Firebase Firestore not loaded. Please check your configuration.');
  }
}

// Food Stalls Service
export class FoodStallsService {
  static async getAllFoodStalls() {
    try {
      checkFirebaseConnection();
      const querySnapshot = await getDocs(collection(db, 'foodStalls'));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Map admin portal fields to map application fields
        return {
          id: doc.id,
          name: data.name,
          lat: data.lat,
          lng: data.lng,
          location: data.location,
          description: data.description,
          specialties: data.specialties || [data.description], // Map description to specialties if not present
          rating: data.rating,
          priceRange: data.priceRange || "££", // Default if not present
          image: data.image,
          hours: data.hours,
          phone: data.contact, // Map contact to phone
          status: data.status
        };
      });
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
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Map admin portal fields to map application fields
        return {
          id: doc.id,
          name: data.name,
          lat: data.lat || 51.517674, // Default coordinates if not present
          lng: data.lng || -0.200438,
          location: data.location || "Ladbroke Grove", // Default location if not present
          description: data.description,
          genres: data.genres || [data.genre], // Map single genre to array if not present
          rating: data.rating,
          performanceTime: data.performance_time, // Map performance_time to performanceTime
          stage: data.stage,
          image: data.image,
          phone: data.contact, // Map contact to phone
          experience: data.experience || "Professional performer", // Default if not present
          status: data.status
        };
      });
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

// Float Trucks Service
export class FloatTrucksService {
  static async getAllFloatTrucks() {
    try {
      const querySnapshot = await getDocs(collection(db, 'floatTrucks'));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          route: data.route,
          time: data.time,
          status: data.status,
          description: data.description,
          image: data.image,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      });
    } catch (error) {
      console.error('Error fetching float trucks:', error);
      return [];
    }
  }

  static async getFloatTrucksByType(type) {
    try {
      const q = query(
        collection(db, 'floatTrucks'),
        where('type', '==', type)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching float trucks by type:', error);
      return [];
    }
  }

  static async addFloatTruck(floatTruckData) {
    try {
      const docRef = await addDoc(collection(db, 'floatTrucks'), {
        ...floatTruckData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return { id: docRef.id, ...floatTruckData };
    } catch (error) {
      console.error('Error adding float truck:', error);
      throw error;
    }
  }

  static async updateFloatTruck(id, updates) {
    try {
      const docRef = doc(db, 'floatTrucks', id);
      await updateDoc(docRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
      return { id, ...updates };
    } catch (error) {
      console.error('Error updating float truck:', error);
      throw error;
    }
  }

  static async deleteFloatTruck(id) {
    try {
      await deleteDoc(doc(db, 'floatTrucks', id));
      return true;
    } catch (error) {
      console.error('Error deleting float truck:', error);
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

// Artist Real-time Tracking Service
export class ArtistTrackingService {
  constructor() {
    this.checkFirebaseConnection();
  }

  // Subscribe to real-time artist location updates
  subscribeToArtistLocation(artistId, callback) {
    try {
      const artistLocationRef = doc(db, 'artistLocations', artistId);
      return onSnapshot(artistLocationRef, (doc) => {
        if (doc.exists()) {
          const locationData = {
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          };
          callback(locationData);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error listening to artist location:', error);
        callback(null);
      });
    } catch (error) {
      console.error('Error setting up artist location listener:', error);
      return null;
    }
  }

  // Subscribe to all artist locations
  subscribeToAllArtistLocations(callback) {
    try {
      const locationsRef = collection(db, 'artistLocations');
      return onSnapshot(locationsRef, (snapshot) => {
        const locations = [];
        snapshot.forEach((doc) => {
          locations.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          });
        });
        callback(locations);
      }, (error) => {
        console.error('Error listening to all artist locations:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up all artist locations listener:', error);
      return null;
    }
  }

  // Update artist location
  async updateArtistLocation(artistId, locationData) {
    try {
      const locationRef = doc(db, 'artistLocations', artistId);
      const updateData = {
        ...locationData,
        timestamp: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };

      await updateDoc(locationRef, updateData);
      console.log(`Artist ${artistId} location updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating artist location:', error);
      throw error;
    }
  }

  // Update artist schedule/status
  async updateArtistSchedule(artistId, scheduleData) {
    try {
      const artistRef = doc(db, 'artists', artistId);
      const updateData = {
        ...scheduleData,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(artistRef, updateData);
      console.log(`Artist ${artistId} schedule updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating artist schedule:', error);
      throw error;
    }
  }

  // Get artist's current location
  async getArtistLocation(artistId) {
    try {
      const locationRef = doc(db, 'artistLocations', artistId);
      const locationDoc = await getDoc(locationRef);

      if (locationDoc.exists()) {
        return {
          id: locationDoc.id,
          ...locationDoc.data(),
          timestamp: locationDoc.data().timestamp?.toDate() || new Date()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting artist location:', error);
      return null;
    }
  }

  // Get all artist locations
  async getAllArtistLocations() {
    try {
      const locationsRef = collection(db, 'artistLocations');
      const snapshot = await getDocs(locationsRef);

      const locations = [];
      snapshot.forEach((doc) => {
        locations.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        });
      });

      return locations;
    } catch (error) {
      console.error('Error getting all artist locations:', error);
      return [];
    }
  }

  // Create initial artist location document
  async initializeArtistLocation(artistId, initialLocation) {
    try {
      const locationRef = doc(db, 'artistLocations', artistId);
      const locationData = {
        ...initialLocation,
        timestamp: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        status: 'active'
      };

      await setDoc(locationRef, locationData);
      console.log(`Artist ${artistId} location initialized successfully`);
      return true;
    } catch (error) {
      console.error('Error initializing artist location:', error);
      throw error;
    }
  }

  // Delete artist location
  async deleteArtistLocation(artistId) {
    try {
      const locationRef = doc(db, 'artistLocations', artistId);
      await deleteDoc(locationRef);
      console.log(`Artist ${artistId} location deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting artist location:', error);
      throw error;
    }
  }
}

// Artist Schedule Service
export class ArtistScheduleService {
  constructor() {
    this.checkFirebaseConnection();
  }

  // Subscribe to artist schedule changes
  subscribeToArtistSchedule(artistId, callback) {
    try {
      const artistRef = doc(db, 'artists', artistId);
      return onSnapshot(artistRef, (doc) => {
        if (doc.exists()) {
          const artistData = {
            id: doc.id,
            ...doc.data(),
            lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
          };
          callback(artistData);
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error listening to artist schedule:', error);
        callback(null);
      });
    } catch (error) {
      console.error('Error setting up artist schedule listener:', error);
      return null;
    }
  }

  // Subscribe to all artist schedules
  subscribeToAllArtistSchedules(callback) {
    try {
      const artistsRef = collection(db, 'artists');
      return onSnapshot(artistsRef, (snapshot) => {
        const artists = [];
        snapshot.forEach((doc) => {
          artists.push({
            id: doc.id,
            ...doc.data(),
            lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
          });
        });
        callback(artists);
      }, (error) => {
        console.error('Error listening to all artist schedules:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up all artist schedules listener:', error);
      return null;
    }
  }

  // Update artist performance time
  async updatePerformanceTime(artistId, performanceTime) {
    try {
      const artistRef = doc(db, 'artists', artistId);
      await updateDoc(artistRef, {
        performanceTime: performanceTime,
        lastUpdated: serverTimestamp()
      });
      console.log(`Artist ${artistId} performance time updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating artist performance time:', error);
      throw error;
    }
  }

  // Update artist stage/location
  async updateArtistStage(artistId, stage, location) {
    try {
      const artistRef = doc(db, 'artists', artistId);
      await updateDoc(artistRef, {
        stage: stage,
        location: location,
        lastUpdated: serverTimestamp()
      });
      console.log(`Artist ${artistId} stage updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating artist stage:', error);
      throw error;
    }
  }

  // Update artist status (on stage, backstage, etc.)
  async updateArtistStatus(artistId, status) {
    try {
      const artistRef = doc(db, 'artists', artistId);
      await updateDoc(artistRef, {
        status: status,
        lastUpdated: serverTimestamp()
      });
      console.log(`Artist ${artistId} status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating artist status:', error);
      throw error;
    }
  }
}

// Real-time Notifications Service
export class ArtistNotificationService {
  constructor() {
    this.checkFirebaseConnection();
  }

  // Subscribe to artist notifications
  subscribeToArtistNotifications(callback) {
    try {
      const notificationsRef = collection(db, 'artistNotifications');
      return onSnapshot(notificationsRef, (snapshot) => {
        const notifications = [];
        snapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          });
        });
        callback(notifications);
      }, (error) => {
        console.error('Error listening to artist notifications:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error setting up artist notifications listener:', error);
      return null;
    }
  }

  // Create artist notification
  async createArtistNotification(notificationData) {
    try {
      const notificationsRef = collection(db, 'artistNotifications');
      const notification = {
        ...notificationData,
        timestamp: serverTimestamp(),
        read: false
      };

      const docRef = await addDoc(notificationsRef, notification);
      console.log('Artist notification created successfully');
      return docRef.id;
    } catch (error) {
      console.error('Error creating artist notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'artistNotifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      console.log('Notification marked as read');
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, 'artistNotifications', notificationId);
      await deleteDoc(notificationRef);
      console.log('Notification deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
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
          rating: 4.8,
          hours: "11:00 AM - 8:00 PM",
          status: "active",
          image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
          contact: "+44 20 7123 4567"
        },
        {
          name: "Notting Hill Jerk House",
          lat: 51.515638,
          lng: -0.201236,
          location: "Portobello Road",
          description: "Traditional jerk chicken with secret family recipe",
          rating: 4.9,
          hours: "10:00 AM - 9:00 PM",
          status: "active",
          image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
          contact: "+44 20 7123 4568"
        },
        {
          name: "Island Flavours",
          lat: 51.516875,
          lng: -0.200021,
          location: "Westbourne Grove",
          description: "Fresh Caribbean street food and traditional dishes",
          rating: 4.7,
          hours: "12:00 PM - 7:00 PM",
          status: "active",
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
          contact: "+44 20 7123 4569"
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
          genre: "Drum & Bass",
          performance_time: "3:00 PM - 4:30 PM",
          stage: "Main Float Route",
          rating: 4.9,
          status: "active",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
          contact: "+44 20 7123 4570"
        },
        {
          name: "Steel Pulse",
          lat: 51.522428,
          lng: -0.203347,
          location: "Portobello Road",
          description: "Grammy-winning reggae legends from Birmingham",
          genre: "Reggae",
          performance_time: "5:00 PM - 6:30 PM",
          stage: "Cultural Stage",
          rating: 4.8,
          status: "active",
          image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
          contact: "+44 20 7123 4571"
        },
        {
          name: "London Samba Collective",
          lat: 51.518363,
          lng: -0.210441,
          location: "Westbourne Grove",
          description: "Energetic Brazilian samba rhythms and percussion",
          genre: "Samba",
          performance_time: "2:00 PM - 3:30 PM",
          stage: "Parade Route",
          rating: 4.7,
          status: "active",
          image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
          contact: "+44 20 7123 4572"
        }
      ];

      for (const artist of defaultArtists) {
        await ArtistsService.addArtist(artist);
      }
    }

    // Check if float trucks collection is empty
    const floatTrucksSnapshot = await getDocs(collection(db, 'floatTrucks'));
    if (floatTrucksSnapshot.empty) {
      console.log('Initializing default float trucks data...');

      const defaultFloatTrucks = [
        {
          name: "Circus Float",
          type: "Circus",
          route: "Parade Route",
          time: "2:00 PM",
          status: "active",
          description: "Spectacular circus performers on wheels",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
        },
        {
          name: "Costume Float",
          type: "Costume",
          route: "Main Parade",
          time: "3:30 PM",
          status: "active",
          description: "Vibrant costumes and cultural displays",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
        },
        {
          name: "Music Float",
          type: "Music",
          route: "Cultural Route",
          time: "4:00 PM",
          status: "active",
          description: "Live music and entertainment on wheels",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
        }
      ];

      for (const floatTruck of defaultFloatTrucks) {
        await FloatTrucksService.addFloatTruck(floatTruck);
      }
    }

    console.log('Default data initialization complete!');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}
