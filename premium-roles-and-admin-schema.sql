-- Premium Roles and Admin Schema for Carnival Tracker
-- This schema extends the existing carnival tracking system with premium features

-- ============================================================================
-- PREMIUM USER ROLES AND ADMIN TABLES
-- ============================================================================

-- 1. Premium User Roles Table
-- Links premium users to their admin capabilities
CREATE TABLE IF NOT EXISTS premium_user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    premium_user_id UUID REFERENCES premium_users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL DEFAULT 'admin', -- admin, moderator, member
    squad_limit INTEGER DEFAULT 10, -- Maximum squad members this admin can manage
    can_delete_members BOOLEAN DEFAULT true,
    can_add_members BOOLEAN DEFAULT true,
    can_manage_squad_settings BOOLEAN DEFAULT true,
    can_view_analytics BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}', -- Flexible permissions storage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(premium_user_id, user_id)
);

-- 2. Squad Groups Table
-- Allows premium users to organize squad members into groups
CREATE TABLE IF NOT EXISTS squad_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    premium_user_id UUID REFERENCES premium_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Squad Member Groups Junction Table
-- Links squad members to groups
CREATE TABLE IF NOT EXISTS squad_member_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    squad_member_id INTEGER REFERENCES carnival_squad_members(id) ON DELETE CASCADE,
    group_id UUID REFERENCES squad_groups(id) ON DELETE CASCADE,
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(squad_member_id, group_id)
);

-- ============================================================================
-- CARNIVAL TRACKING ENHANCEMENTS
-- ============================================================================

-- 4. Carnival Attendance Tracking
-- Track which carnivals users and their squad members attend
CREATE TABLE IF NOT EXISTS carnival_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    squad_member_id INTEGER REFERENCES carnival_squad_members(id) ON DELETE SET NULL,
    attendance_status VARCHAR(50) DEFAULT 'planned', -- planned, attending, attended, cancelled
    arrival_time TIMESTAMP WITH TIME ZONE,
    departure_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    photos JSONB, -- Array of photo URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Carnival Favorites
-- Allow users to save favorite carnivals
CREATE TABLE IF NOT EXISTS carnival_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(carnival_id, user_id)
);

-- 6. Carnival Reviews and Ratings
-- User reviews for carnivals
CREATE TABLE IF NOT EXISTS carnival_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    photos JSONB, -- Array of photo URLs
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(carnival_id, user_id)
);

-- ============================================================================
-- LOCATION AND SAFETY FEATURES
-- ============================================================================

-- 7. Location History
-- Track location history for safety and analytics
CREATE TABLE IF NOT EXISTS location_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    squad_member_id INTEGER REFERENCES carnival_squad_members(id) ON DELETE CASCADE,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    location_area VARCHAR(255),
    accuracy DECIMAL(5, 2), -- GPS accuracy in meters
    battery_level INTEGER, -- Device battery percentage
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Safety Alerts
-- Track safety incidents and alerts
CREATE TABLE IF NOT EXISTS safety_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    squad_member_id INTEGER REFERENCES carnival_squad_members(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL, -- lost, emergency, check_in, sos
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_area VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, resolved, false_alarm
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Check-in Points
-- Define check-in locations at carnivals
CREATE TABLE IF NOT EXISTS check_in_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    radius INTEGER DEFAULT 100, -- Check-in radius in meters
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Check-ins
-- Track when squad members check in at specific points
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    squad_member_id INTEGER REFERENCES carnival_squad_members(id) ON DELETE CASCADE,
    check_in_point_id UUID REFERENCES check_in_points(id) ON DELETE CASCADE,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COMMUNICATION AND NOTIFICATIONS
-- ============================================================================

-- 11. Squad Messages
-- Internal messaging system for squad members
CREATE TABLE IF NOT EXISTS squad_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    squad_member_id INTEGER REFERENCES carnival_squad_members(id) ON DELETE CASCADE,
    message_type VARCHAR(50) DEFAULT 'text', -- text, location, photo, emergency
    message_text TEXT,
    location_data JSONB, -- For location messages
    media_urls JSONB, -- Array of media URLs
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Notification Preferences
-- User notification settings
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    location_alerts BOOLEAN DEFAULT true,
    safety_alerts BOOLEAN DEFAULT true,
    carnival_updates BOOLEAN DEFAULT true,
    squad_messages BOOLEAN DEFAULT true,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- ANALYTICS AND INSIGHTS
-- ============================================================================

-- 13. User Activity Log
-- Track user activity for analytics
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- login, location_update, squad_add, etc.
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Squad Analytics
-- Analytics data for premium users
CREATE TABLE IF NOT EXISTS squad_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    premium_user_id UUID REFERENCES premium_users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    location_shares INTEGER DEFAULT 0,
    check_ins INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    safety_alerts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(premium_user_id, date)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Premium user roles indexes
CREATE INDEX IF NOT EXISTS idx_premium_user_roles_user_id ON premium_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_user_roles_premium_id ON premium_user_roles(premium_user_id);

-- Squad groups indexes
CREATE INDEX IF NOT EXISTS idx_squad_groups_premium_id ON squad_groups(premium_user_id);
CREATE INDEX IF NOT EXISTS idx_squad_groups_active ON squad_groups(is_active);

-- Squad member groups indexes
CREATE INDEX IF NOT EXISTS idx_squad_member_groups_member_id ON squad_member_groups(squad_member_id);
CREATE INDEX IF NOT EXISTS idx_squad_member_groups_group_id ON squad_member_groups(group_id);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_carnival_attendance_carnival_id ON carnival_attendance(carnival_id);
CREATE INDEX IF NOT EXISTS idx_carnival_attendance_user_id ON carnival_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_carnival_attendance_status ON carnival_attendance(attendance_status);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_carnival_favorites_user_id ON carnival_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_carnival_favorites_carnival_id ON carnival_favorites(carnival_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_carnival_reviews_carnival_id ON carnival_reviews(carnival_id);
CREATE INDEX IF NOT EXISTS idx_carnival_reviews_rating ON carnival_reviews(rating);

-- Location history indexes
CREATE INDEX IF NOT EXISTS idx_location_history_member_id ON location_history(squad_member_id);
CREATE INDEX IF NOT EXISTS idx_location_history_recorded_at ON location_history(recorded_at);

-- Safety alerts indexes
CREATE INDEX IF NOT EXISTS idx_safety_alerts_user_id ON safety_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_status ON safety_alerts(status);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_type ON safety_alerts(alert_type);

-- Check-in points indexes
CREATE INDEX IF NOT EXISTS idx_check_in_points_carnival_id ON check_in_points(carnival_id);
CREATE INDEX IF NOT EXISTS idx_check_in_points_active ON check_in_points(is_active);

-- Check-ins indexes
CREATE INDEX IF NOT EXISTS idx_check_ins_member_id ON check_ins(squad_member_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_carnival_id ON check_ins(carnival_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_squad_messages_sender_id ON squad_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_squad_messages_member_id ON squad_messages(squad_member_id);
CREATE INDEX IF NOT EXISTS idx_squad_messages_read ON squad_messages(is_read);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_squad_analytics_premium_id ON squad_analytics(premium_user_id);
CREATE INDEX IF NOT EXISTS idx_squad_analytics_date ON squad_analytics(date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE premium_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_member_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnival_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnival_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE carnival_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_analytics ENABLE ROW LEVEL SECURITY;

-- Premium user roles policies
CREATE POLICY "Users can view their own premium roles" ON premium_user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Premium users can manage their roles" ON premium_user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM premium_users 
            WHERE id = premium_user_id 
            AND auth.jwt() ->> 'email' = email
        )
    );

-- Squad groups policies
CREATE POLICY "Premium users can manage their squad groups" ON squad_groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM premium_users 
            WHERE id = premium_user_id 
            AND auth.jwt() ->> 'email' = email
        )
    );

-- Squad member groups policies
CREATE POLICY "Users can view their squad member groups" ON squad_member_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM carnival_squad_members csm
            JOIN premium_users pu ON pu.id IN (
                SELECT premium_user_id FROM premium_user_roles 
                WHERE user_id = csm.user_id
            )
            WHERE csm.id = squad_member_id
            AND (csm.user_id = auth.uid() OR pu.email = auth.jwt() ->> 'email')
        )
    );

-- Carnival attendance policies
CREATE POLICY "Users can manage their own attendance" ON carnival_attendance
    FOR ALL USING (user_id = auth.uid());

-- Carnival favorites policies
CREATE POLICY "Users can manage their own favorites" ON carnival_favorites
    FOR ALL USING (user_id = auth.uid());

-- Carnival reviews policies
CREATE POLICY "Users can manage their own reviews" ON carnival_reviews
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public reviews" ON carnival_reviews
    FOR SELECT USING (is_public = true);

-- Location history policies
CREATE POLICY "Users can view their squad location history" ON location_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM carnival_squad_members 
            WHERE id = squad_member_id 
            AND user_id = auth.uid()
        )
    );

-- Safety alerts policies
CREATE POLICY "Users can manage their own safety alerts" ON safety_alerts
    FOR ALL USING (user_id = auth.uid());

-- Check-in points policies (read-only for users)
CREATE POLICY "Users can view check-in points" ON check_in_points
    FOR SELECT USING (true);

-- Check-ins policies
CREATE POLICY "Users can manage their squad check-ins" ON check_ins
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM carnival_squad_members 
            WHERE id = squad_member_id 
            AND user_id = auth.uid()
        )
    );

-- Squad messages policies
CREATE POLICY "Users can manage their squad messages" ON squad_messages
    FOR ALL USING (sender_id = auth.uid());

-- Notification preferences policies
CREATE POLICY "Users can manage their notification preferences" ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- User activity log policies
CREATE POLICY "Users can view their own activity" ON user_activity_log
    FOR SELECT USING (user_id = auth.uid());

-- Squad analytics policies
CREATE POLICY "Premium users can view their analytics" ON squad_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM premium_users 
            WHERE id = premium_user_id 
            AND auth.jwt() ->> 'email' = email
        )
    );

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_premium_user_roles_updated_at
    BEFORE UPDATE ON premium_user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_squad_groups_updated_at
    BEFORE UPDATE ON squad_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carnival_reviews_updated_at
    BEFORE UPDATE ON carnival_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_alerts_updated_at
    BEFORE UPDATE ON safety_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION create_user_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification preferences for new users
CREATE TRIGGER create_notification_preferences_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_notification_preferences();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON premium_user_roles TO authenticated;
GRANT ALL ON squad_groups TO authenticated;
GRANT ALL ON squad_member_groups TO authenticated;
GRANT ALL ON carnival_attendance TO authenticated;
GRANT ALL ON carnival_favorites TO authenticated;
GRANT ALL ON carnival_reviews TO authenticated;
GRANT ALL ON location_history TO authenticated;
GRANT ALL ON safety_alerts TO authenticated;
GRANT SELECT ON check_in_points TO authenticated;
GRANT ALL ON check_ins TO authenticated;
GRANT ALL ON squad_messages TO authenticated;
GRANT ALL ON notification_preferences TO authenticated;
GRANT SELECT ON user_activity_log TO authenticated;
GRANT SELECT ON squad_analytics TO authenticated;

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- View for premium user dashboard data
CREATE OR REPLACE VIEW premium_user_dashboard AS
SELECT 
    pu.id as premium_user_id,
    pu.email,
    pu.is_premium,
    pu.expires_at,
    COUNT(DISTINCT csm.id) as total_squad_members,
    COUNT(DISTINCT CASE WHEN csm.is_sharing THEN csm.id END) as active_sharing_members,
    COUNT(DISTINCT sg.id) as total_groups,
    COUNT(DISTINCT ca.id) as total_attendance_records,
    COUNT(DISTINCT sa.id) as total_safety_alerts,
    MAX(csm.last_update) as last_squad_activity
FROM premium_users pu
LEFT JOIN premium_user_roles pur ON pu.id = pur.premium_user_id
LEFT JOIN carnival_squad_members csm ON pur.user_id = csm.user_id
LEFT JOIN squad_groups sg ON pu.id = sg.premium_user_id
LEFT JOIN carnival_attendance ca ON csm.id = ca.squad_member_id
LEFT JOIN safety_alerts sa ON csm.id = sa.squad_member_id
WHERE pu.is_premium = true
GROUP BY pu.id, pu.email, pu.is_premium, pu.expires_at;

-- View for squad member summary
CREATE OR REPLACE VIEW squad_member_summary AS
SELECT 
    csm.id,
    csm.name,
    csm.phone,
    csm.relationship,
    csm.is_sharing,
    csm.location_area,
    csm.last_update,
    pu.email as owner_email,
    COUNT(DISTINCT sg.id) as group_count,
    COUNT(DISTINCT ca.id) as attendance_count,
    COUNT(DISTINCT sa.id) as safety_alert_count,
    COUNT(DISTINCT sm.id) as message_count
FROM carnival_squad_members csm
LEFT JOIN auth.users u ON csm.user_id = u.id
LEFT JOIN premium_users pu ON u.email = pu.email
LEFT JOIN squad_member_groups smg ON csm.id = smg.squad_member_id
LEFT JOIN squad_groups sg ON smg.group_id = sg.id
LEFT JOIN carnival_attendance ca ON csm.id = ca.squad_member_id
LEFT JOIN safety_alerts sa ON csm.id = sa.squad_member_id
LEFT JOIN squad_messages sm ON csm.id = sm.squad_member_id
GROUP BY csm.id, csm.name, csm.phone, csm.relationship, csm.is_sharing, 
         csm.location_area, csm.last_update, pu.email;

-- Grant permissions on views
GRANT SELECT ON premium_user_dashboard TO authenticated;
GRANT SELECT ON squad_member_summary TO authenticated;
GRANT SELECT ON premium_user_dashboard TO service_role;
GRANT SELECT ON squad_member_summary TO service_role;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE premium_user_roles IS 'Defines admin roles and permissions for premium users';
COMMENT ON TABLE squad_groups IS 'Groups for organizing squad members (premium feature)';
COMMENT ON TABLE squad_member_groups IS 'Junction table linking squad members to groups';
COMMENT ON TABLE carnival_attendance IS 'Tracks carnival attendance for users and squad members';
COMMENT ON TABLE carnival_favorites IS 'User favorites for carnivals';
COMMENT ON TABLE carnival_reviews IS 'User reviews and ratings for carnivals';
COMMENT ON TABLE location_history IS 'Historical location data for squad members';
COMMENT ON TABLE safety_alerts IS 'Safety incidents and emergency alerts';
COMMENT ON TABLE check_in_points IS 'Defined check-in locations at carnivals';
COMMENT ON TABLE check_ins IS 'Squad member check-ins at specific points';
COMMENT ON TABLE squad_messages IS 'Internal messaging system for squad members';
COMMENT ON TABLE notification_preferences IS 'User notification settings';
COMMENT ON TABLE user_activity_log IS 'User activity tracking for analytics';
COMMENT ON TABLE squad_analytics IS 'Daily analytics data for premium users';

COMMENT ON VIEW premium_user_dashboard IS 'Dashboard view for premium users showing key metrics';
COMMENT ON VIEW squad_member_summary IS 'Summary view of squad members with activity counts';
