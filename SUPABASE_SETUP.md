# Supabase Setup Guide for TagYou2

This guide will help you set up Supabase for your TagYou2 London Map project.

## Prerequisites

- A GitHub account (for Supabase signup)
- Node.js installed on your system
- Supabase CLI (optional, for advanced features)

## Step 1: Create a Supabase Project

1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Click "New Project" or "Create a new project"
3. Choose your organization (or create one)
4. Enter a project name (e.g., "tagyou2-london-map")
5. Enter a database password (save this securely)
6. Choose a region (select the closest to your users)
7. Click "Create new project"

## Step 2: Get Your Supabase Configuration

1. In your Supabase project dashboard, click "Settings" in the left sidebar
2. Click "API" in the settings menu
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Set Up Your Database Tables

1. In your Supabase dashboard, click "Table Editor" in the left sidebar
2. Click "Create a new table" for each of the following:

### Food Stalls Table
```sql
CREATE TABLE food_stalls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location JSONB,
  cuisine TEXT,
  price_range TEXT,
  rating DECIMAL(3,2),
  hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Artists Table
```sql
CREATE TABLE artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  performance_time TEXT,
  stage TEXT,
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Float Trucks Table
```sql
CREATE TABLE float_trucks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  route TEXT,
  start_time TEXT,
  end_time TEXT,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Favorites Table
```sql
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);
```

## Step 4: Update Your Configuration

1. Copy the template file:
   ```bash
   cp supabase-config-secret.template.js supabase-config-secret.js
   ```

2. Edit `supabase-config-secret.js` with your actual Supabase credentials:
   ```javascript
   const supabaseConfig = {
     supabaseUrl: "https://your-project-id.supabase.co",
     supabaseAnonKey: "your-anon-key-here"
   };
   
   export default supabaseConfig;
   ```

## Step 5: Set Up Row Level Security (RLS)

1. In your Supabase dashboard, go to "Authentication" → "Policies"
2. For each table, enable RLS and add the following policies:

### Food Stalls Policy
```sql
-- Enable RLS
ALTER TABLE food_stalls ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON food_stalls
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access" ON food_stalls
  FOR ALL USING (auth.role() = 'authenticated');
```

### Artists Policy
```sql
-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON artists
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access" ON artists
  FOR ALL USING (auth.role() = 'authenticated');
```

### Float Trucks Policy
```sql
-- Enable RLS
ALTER TABLE float_trucks ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON float_trucks
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access" ON float_trucks
  FOR ALL USING (auth.role() = 'authenticated');
```

### User Favorites Policy
```sql
-- Enable RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own favorites
CREATE POLICY "Users can manage their own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);
```

## Step 6: Configure Authentication

1. In your Supabase dashboard, go to "Authentication" → "Settings"
2. Configure your site URL (e.g., `http://localhost:5501` for development)
3. Add redirect URLs:
   - `http://localhost:5501`
   - `http://localhost:5501/index.html`
   - Your production domain (when ready)

## Step 7: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to your app
3. Open the browser's developer console (F12)
4. You should see messages like:
   - "🚀 Starting Supabase initialization..."
   - "✅ Supabase initialized successfully"
   - "✅ Loaded food stalls: X"
   - "✅ Loaded artists: X"

## Step 8: Verify Data in Supabase Console

1. Go to your Supabase dashboard
2. Click "Table Editor"
3. You should see your tables created with default data:
   - `food_stalls` - Contains food stall data
   - `artists` - Contains artist data
   - `float_trucks` - Contains float truck data
   - `user_favorites` - Will contain user favorites (when users interact)

## Troubleshooting

### Common Issues:

1. **"Supabase SDK not loaded"**
   - Make sure the Supabase CDN script is loaded in your HTML
   - Check your internet connection

2. **"Supabase not initialized - no configuration found"**
   - Double-check your `supabase-config-secret.js` file
   - Make sure you copied the correct URL and anon key

3. **"permission-denied"**
   - Check your RLS policies
   - Make sure you're authenticated for protected operations

4. **Module import errors**
   - Make sure you're serving the files through a web server (not opening HTML directly)
   - Use `npm run dev` or `live-server`

### Development vs Production

For development:
- Use RLS policies that allow public read access
- Use localhost as your site URL
- Allow all authentication providers

For production:
- Implement proper RLS policies
- Use your production domain
- Configure authentication providers as needed
- Set up proper CORS settings

## Security Best Practices

1. **Never expose your service role key** - only use the anon key in client-side code
2. **Use RLS policies** - always enable Row Level Security
3. **Validate data** - implement proper validation on both client and server
4. **Use HTTPS** - always use HTTPS in production
5. **Regular backups** - set up automated database backups

## Next Steps

1. **Customize your data** - Add your own food stalls, artists, and float trucks
2. **Implement user features** - Add user registration, favorites, and profiles
3. **Add real-time features** - Implement live updates for data changes
4. **Deploy to production** - Deploy your app to a hosting platform

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com/)
