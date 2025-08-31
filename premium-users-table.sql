-- Premium Users Table Schema
-- Run this in your Supabase SQL Editor

-- Create premium_users table
CREATE TABLE IF NOT EXISTS premium_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    is_premium BOOLEAN DEFAULT true,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_amount INTEGER, -- Amount in pence/cents
    payment_currency TEXT DEFAULT 'gbp',
    stripe_session_id TEXT,
    offer_type TEXT DEFAULT '3-month-promo',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_premium_users_email ON premium_users(email);

-- Create index on is_premium for filtering
CREATE INDEX IF NOT EXISTS idx_premium_users_is_premium ON premium_users(is_premium);

-- Enable Row Level Security (RLS)
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to read their own premium status
CREATE POLICY "Users can view their own premium status" ON premium_users
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Allow service role to manage all premium users (for webhooks and admin)
CREATE POLICY "Service role can manage premium users" ON premium_users
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to update their own premium status
CREATE POLICY "Users can update their own premium status" ON premium_users
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_premium_users_updated_at 
    BEFORE UPDATE ON premium_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial premium users (optional)
-- INSERT INTO premium_users (email, is_premium, offer_type) VALUES 
--     ('kaycheckmate@gmail.com', true, '3-month-promo'),
--     ('truesliks@gmail.com', true, '3-month-promo');

-- Grant necessary permissions
GRANT ALL ON premium_users TO authenticated;
GRANT ALL ON premium_users TO service_role;

-- Create view for active premium users
CREATE OR REPLACE VIEW active_premium_users AS
SELECT 
    id,
    email,
    is_premium,
    payment_date,
    payment_amount,
    payment_currency,
    offer_type,
    expires_at,
    created_at,
    updated_at,
    CASE 
        WHEN expires_at IS NULL THEN true
        WHEN expires_at > NOW() THEN true
        ELSE false
    END as is_active
FROM premium_users 
WHERE is_premium = true;

-- Grant permissions on view
GRANT SELECT ON active_premium_users TO authenticated;
GRANT SELECT ON active_premium_users TO service_role;
