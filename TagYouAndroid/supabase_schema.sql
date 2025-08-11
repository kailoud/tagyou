-- TagYou Festival Tracker - Supabase Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    is_pro_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User locations table for real-time tracking
CREATE TABLE public.user_locations (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy FLOAT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    display_name TEXT
);

-- Food stalls table
CREATE TABLE public.food_stalls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Float trucks table
CREATE TABLE public.float_trucks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    route TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User groups table
CREATE TABLE public.user_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members junction table
CREATE TABLE public.group_members (
    group_id UUID REFERENCES public.user_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.float_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User locations policies
CREATE POLICY "Anyone can view user locations" ON public.user_locations
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own location" ON public.user_locations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own location" ON public.user_locations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Food stalls policies (read-only for users, admin can modify)
CREATE POLICY "Anyone can view food stalls" ON public.food_stalls
    FOR SELECT USING (true);

-- Float trucks policies (read-only for users, admin can modify)
CREATE POLICY "Anyone can view float trucks" ON public.float_trucks
    FOR SELECT USING (true);

-- User groups policies
CREATE POLICY "Users can view groups they're members of" ON public.user_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create groups" ON public.user_groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view group members" ON public.group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_id AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Group creators can add members" ON public.group_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_groups 
            WHERE id = group_id AND created_by = auth.uid()
        )
    );

-- Functions for real-time updates

-- Function to update user's last active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET last_active = NOW() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active when location changes
CREATE TRIGGER update_user_last_active_trigger
    AFTER INSERT OR UPDATE ON public.user_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Function to get nearby users (within 1km)
CREATE OR REPLACE FUNCTION get_nearby_users(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ul.user_id,
        ul.display_name,
        ul.latitude,
        ul.longitude,
        (
            6371000 * acos(
                cos(radians(user_lat)) * 
                cos(radians(ul.latitude)) * 
                cos(radians(ul.longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * 
                sin(radians(ul.latitude))
            )
        ) AS distance_meters
    FROM public.user_locations ul
    WHERE (
        6371000 * acos(
            cos(radians(user_lat)) * 
            cos(radians(ul.latitude)) * 
            cos(radians(ul.longitude) - radians(user_lng)) + 
            sin(radians(user_lat)) * 
            sin(radians(ul.latitude))
        )
    ) <= radius_meters
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Enable real-time for location tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.food_stalls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.float_trucks;

-- Sample data for testing
INSERT INTO public.food_stalls (name, description, latitude, longitude, category) VALUES
('Taco Truck', 'Authentic Mexican tacos', 37.7749, -122.4194, 'Mexican'),
('Pizza Corner', 'Fresh wood-fired pizza', 37.7849, -122.4094, 'Italian'),
('Burger Joint', 'Gourmet burgers and fries', 37.7649, -122.4294, 'American');

INSERT INTO public.float_trucks (name, description, latitude, longitude, route) VALUES
('Parade Float 1', 'Main parade float', 37.7749, -122.4194, 'Main Street'),
('Parade Float 2', 'Secondary parade float', 37.7849, -122.4094, 'Oak Avenue');
