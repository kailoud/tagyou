# Supabase Setup Guide for GroupTracker Admin Portal

This guide will help you connect your GroupTracker admin portal to a Supabase database.

## 🚀 **Step 1: Create a Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `grouptracker-admin`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

## 🗄️ **Step 2: Set Up Database Schema**

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase_schema.sql`
3. Paste and run the SQL script
4. This will create all necessary tables and sample data

## 🔑 **Step 3: Get Your API Keys**

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. You'll see something like:
   ```
   Project URL: https://your-project-id.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## ⚙️ **Step 4: Update Your Code**

1. Open `grouptracker.html`
2. Find the Supabase configuration section (around line 4580)
3. Replace the placeholder values:

```javascript
// Supabase Configuration
const SUPABASE_URL = 'https://your-project-id.supabase.co'; // Your actual URL
const SUPABASE_ANON_KEY = 'your-actual-anon-key'; // Your actual anon key
```

## 🧪 **Step 5: Test the Connection**

1. Open your `grouptracker.html` in a browser
2. Log in as an admin user (demo@tagyou.com)
3. Open the Admin Portal
4. You should see data loading from Supabase
5. Try adding, editing, and deleting items

## 📊 **Database Tables Created**

### **food_stalls**
- Basic stall information (name, category, location)
- Contact details (phone, email)
- Operating hours and ratings
- Image storage (as data URLs)
- GPS coordinates for mapping

### **float_trucks**
- Mobile truck information
- Real-time tracking data
- GPS coordinates and status
- Driver contact information
- Schedule and route information

### **groups**
- User groups and communities
- Member counts and descriptions
- Admin contact information

### **friends**
- User profiles and contact info
- Join dates and status
- Location information

## 🔒 **Security Features**

- **Row Level Security (RLS)**: Optional, can be enabled for production
- **API Key Authentication**: Uses Supabase's built-in auth
- **Input Validation**: Client-side validation before database operations
- **Error Handling**: Comprehensive error messages and logging

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Error loading admin data"**
   - Check your Supabase URL and API key
   - Ensure tables exist in your database
   - Check browser console for detailed errors

2. **"Access denied"**
   - Make sure you're logged in as an admin user
   - Check email format (demo@tagyou.com or @admin.com)

3. **"Network error"**
   - Check your internet connection
   - Verify Supabase project is active
   - Check CORS settings if needed

### **Debug Mode:**
Open browser console (F12) to see detailed error messages and API responses.

## 🔄 **Data Migration**

If you have existing data, you can:

1. **Export from current system**: Save your current adminData
2. **Import to Supabase**: Use the SQL INSERT statements in the schema
3. **Update references**: Ensure all image URLs and coordinates are valid

## 📱 **Mobile Optimization**

The admin portal is fully optimized for mobile devices:
- Responsive design
- Touch-friendly interface
- Optimized table layouts
- Full-bleed expansion on mobile

## 🎯 **Next Steps**

1. **Production Deployment**: Deploy to your hosting platform
2. **Custom Domain**: Set up your custom domain
3. **SSL Certificate**: Ensure HTTPS for security
4. **Backup Strategy**: Set up regular database backups
5. **Monitoring**: Add error tracking and analytics

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Test with the sample data first
4. Check Supabase documentation for API changes

---

**Happy coding! 🎪✨**
