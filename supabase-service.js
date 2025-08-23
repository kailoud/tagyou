// Supabase Service - Data Operations
// Using CDN imports for better compatibility with live server

// Use global Supabase instance
let supabase = null;

// Check if Supabase is properly initialized
function checkSupabaseConnection() {
  if (!supabase) {
    throw new Error('Supabase not initialized. Please check your configuration.');
  }
}

// Food Stalls Service
export class FoodStallsService {
  static async getAllFoodStalls() {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('food_stalls')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching food stalls:', error);
        throw error;
      }

      console.log('✅ Loaded food stalls:', data.length);
      return data || [];
    } catch (error) {
      console.error('❌ FoodStallsService.getAllFoodStalls error:', error);
      return [];
    }
  }

  static async addFoodStall(foodStall) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('food_stalls')
        .insert([foodStall])
        .select();

      if (error) {
        console.error('❌ Error adding food stall:', error);
        throw error;
      }

      console.log('✅ Food stall added:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ FoodStallsService.addFoodStall error:', error);
      throw error;
    }
  }

  static async updateFoodStall(id, updates) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('food_stalls')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Error updating food stall:', error);
        throw error;
      }

      console.log('✅ Food stall updated:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ FoodStallsService.updateFoodStall error:', error);
      throw error;
    }
  }

  static async deleteFoodStall(id) {
    try {
      checkSupabaseConnection();

      const { error } = await supabase
        .from('food_stalls')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting food stall:', error);
        throw error;
      }

      console.log('✅ Food stall deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ FoodStallsService.deleteFoodStall error:', error);
      throw error;
    }
  }
}

// Artists Service
export class ArtistsService {
  static async getAllArtists() {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching artists:', error);
        throw error;
      }

      console.log('✅ Loaded artists:', data.length);
      return data || [];
    } catch (error) {
      console.error('❌ ArtistsService.getAllArtists error:', error);
      return [];
    }
  }

  static async addArtist(artist) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('artists')
        .insert([artist])
        .select();

      if (error) {
        console.error('❌ Error adding artist:', error);
        throw error;
      }

      console.log('✅ Artist added:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ ArtistsService.addArtist error:', error);
      throw error;
    }
  }

  static async updateArtist(id, updates) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('artists')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Error updating artist:', error);
        throw error;
      }

      console.log('✅ Artist updated:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ ArtistsService.updateArtist error:', error);
      throw error;
    }
  }

  static async deleteArtist(id) {
    try {
      checkSupabaseConnection();

      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting artist:', error);
        throw error;
      }

      console.log('✅ Artist deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ ArtistsService.deleteArtist error:', error);
      throw error;
    }
  }
}

// Float Trucks Service
export class FloatTrucksService {
  static async getAllFloatTrucks() {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('float_trucks')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching float trucks:', error);
        throw error;
      }

      console.log('✅ Loaded float trucks:', data.length);
      return data || [];
    } catch (error) {
      console.error('❌ FloatTrucksService.getAllFloatTrucks error:', error);
      return [];
    }
  }

  static async addFloatTruck(floatTruck) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('float_trucks')
        .insert([floatTruck])
        .select();

      if (error) {
        console.error('❌ Error adding float truck:', error);
        throw error;
      }

      console.log('✅ Float truck added:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ FloatTrucksService.addFloatTruck error:', error);
      throw error;
    }
  }

  static async updateFloatTruck(id, updates) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('float_trucks')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Error updating float truck:', error);
        throw error;
      }

      console.log('✅ Float truck updated:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ FloatTrucksService.updateFloatTruck error:', error);
      throw error;
    }
  }

  static async deleteFloatTruck(id) {
    try {
      checkSupabaseConnection();

      const { error } = await supabase
        .from('float_trucks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting float truck:', error);
        throw error;
      }

      console.log('✅ Float truck deleted:', id);
      return true;
    } catch (error) {
      console.error('❌ FloatTrucksService.deleteFloatTruck error:', error);
      throw error;
    }
  }
}

// User Favorites Service
export class UserFavoritesService {
  static async getUserFavorites(userId) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching user favorites:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ UserFavoritesService.getUserFavorites error:', error);
      return [];
    }
  }

  static async addFavorite(userId, itemId, itemType) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: userId,
          item_id: itemId,
          item_type: itemType,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('❌ Error adding favorite:', error);
        throw error;
      }

      console.log('✅ Favorite added:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ UserFavoritesService.addFavorite error:', error);
      throw error;
    }
  }

  static async removeFavorite(userId, itemId, itemType) {
    try {
      checkSupabaseConnection();

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('item_type', itemType);

      if (error) {
        console.error('❌ Error removing favorite:', error);
        throw error;
      }

      console.log('✅ Favorite removed');
      return true;
    } catch (error) {
      console.error('❌ UserFavoritesService.removeFavorite error:', error);
      throw error;
    }
  }

  static async isFavorite(userId, itemId, itemType) {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('item_type', itemType)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error checking favorite:', error);
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('❌ UserFavoritesService.isFavorite error:', error);
      return false;
    }
  }
}

// Real-time Service
export class RealtimeService {
  static subscribeToFoodStalls(callback) {
    try {
      checkSupabaseConnection();

      const subscription = supabase
        .channel('food_stalls_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'food_stalls' },
          callback
        )
        .subscribe();

      console.log('✅ Subscribed to food stalls real-time updates');
      return subscription;
    } catch (error) {
      console.error('❌ RealtimeService.subscribeToFoodStalls error:', error);
      return null;
    }
  }

  static subscribeToArtists(callback) {
    try {
      checkSupabaseConnection();

      const subscription = supabase
        .channel('artists_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'artists' },
          callback
        )
        .subscribe();

      console.log('✅ Subscribed to artists real-time updates');
      return subscription;
    } catch (error) {
      console.error('❌ RealtimeService.subscribeToArtists error:', error);
      return null;
    }
  }

  static subscribeToFloatTrucks(callback) {
    try {
      checkSupabaseConnection();

      const subscription = supabase
        .channel('float_trucks_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'float_trucks' },
          callback
        )
        .subscribe();

      console.log('✅ Subscribed to float trucks real-time updates');
      return subscription;
    } catch (error) {
      console.error('❌ RealtimeService.subscribeToFloatTrucks error:', error);
      return null;
    }
  }

  static subscribeToUserFavorites(userId, callback) {
    try {
      checkSupabaseConnection();

      const subscription = supabase
        .channel(`user_favorites_${userId}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'user_favorites', filter: `user_id=eq.${userId}` },
          callback
        )
        .subscribe();

      console.log('✅ Subscribed to user favorites real-time updates');
      return subscription;
    } catch (error) {
      console.error('❌ RealtimeService.subscribeToUserFavorites error:', error);
      return null;
    }
  }
}

// Initialize default data
export async function initializeDefaultData() {
  try {
    checkSupabaseConnection();

    console.log('🚀 Initializing default data...');

    // Check if data already exists
    const { data: existingFoodStalls } = await supabase
      .from('food_stalls')
      .select('count')
      .limit(1);

    if (existingFoodStalls && existingFoodStalls.length > 0) {
      console.log('✅ Default data already exists, skipping initialization');
      return;
    }

    // Insert default food stalls
    const defaultFoodStalls = [
      {
        name: "Jerk Chicken Paradise",
        description: "Authentic Jamaican jerk chicken with rice and peas",
        location: { lat: 51.5194, lng: -0.1270 },
        cuisine: "Jamaican",
        price_range: "£8-12",
        rating: 4.5,
        hours: "10:00-22:00"
      },
      {
        name: "Caribbean Curry Corner",
        description: "Spicy curry goat and roti",
        location: { lat: 51.5200, lng: -0.1280 },
        cuisine: "Caribbean",
        price_range: "£6-10",
        rating: 4.3,
        hours: "11:00-21:00"
      }
    ];

    const { error: foodStallsError } = await supabase
      .from('food_stalls')
      .insert(defaultFoodStalls);

    if (foodStallsError) {
      console.error('❌ Error inserting default food stalls:', foodStallsError);
    } else {
      console.log('✅ Default food stalls inserted');
    }

    // Insert default artists
    const defaultArtists = [
      {
        name: "Steel Pulse",
        description: "Legendary reggae band",
        genre: "Reggae",
        performance_time: "15:00",
        stage: "Main Stage",
        rating: 4.8
      },
      {
        name: "Soca Warriors",
        description: "High-energy soca music",
        genre: "Soca",
        performance_time: "16:30",
        stage: "Dance Stage",
        rating: 4.6
      }
    ];

    const { error: artistsError } = await supabase
      .from('artists')
      .insert(defaultArtists);

    if (artistsError) {
      console.error('❌ Error inserting default artists:', artistsError);
    } else {
      console.log('✅ Default artists inserted');
    }

    // Insert default float trucks
    const defaultFloatTrucks = [
      {
        name: "Mas Band Float 1",
        description: "Traditional masquerade float",
        route: "Notting Hill Gate to Ladbroke Grove",
        start_time: "14:00",
        end_time: "18:00",
        capacity: 50
      },
      {
        name: "Steel Band Float",
        description: "Steel pan music float",
        route: "Portobello Road to Westbourne Grove",
        start_time: "15:30",
        end_time: "19:30",
        capacity: 30
      }
    ];

    const { error: floatTrucksError } = await supabase
      .from('float_trucks')
      .insert(defaultFloatTrucks);

    if (floatTrucksError) {
      console.error('❌ Error inserting default float trucks:', floatTrucksError);
    } else {
      console.log('✅ Default float trucks inserted');
    }

    console.log('✅ Default data initialization complete!');
  } catch (error) {
    console.error('❌ initializeDefaultData error:', error);
  }
}

// Set the global supabase instance
export function setSupabaseInstance(supabaseInstance) {
  supabase = supabaseInstance;
}
