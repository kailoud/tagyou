# TagYou.org Integration System

This system integrates data from `tagyou.org` with your local application using Supabase as the database.

## 🏗️ **System Architecture**

```
tagyou.org (External Data Source)
    ↓ API Calls
TagYou Data Service (JavaScript)
    ↓ Database Operations
Supabase Database (Local Storage)
    ↓ User Interface
Admin Panel (Management Interface)
```

## 📁 **Files Overview**

### **Core Integration Files:**
- `tagyou-data-service.js` - Main data integration service
- `admin-panel.html` - Admin management interface
- `admin-panel.js` - Admin panel functionality
- `carnivals-table.sql` - Database schema for carnivals

### **Configuration Files:**
- `supabase-config-secret.js` - Supabase credentials
- `TAGYOU_INTEGRATION_README.md` - This documentation

## 🚀 **Setup Instructions**

### **1. Database Setup**

Run the SQL script in your Supabase dashboard:

```sql
-- Execute the contents of carnivals-table.sql in Supabase SQL Editor
```

### **2. API Configuration**

Update the API endpoints in `tagyou-data-service.js`:

```javascript
// Update these URLs to match your tagyou.org API structure
this.tagyouApiUrl = 'https://tagyou.org/api'; // Your actual API base URL
```

### **3. Authentication Setup**

If your `tagyou.org` API requires authentication, add your API keys:

```javascript
// In tagyou-data-service.js, update the fetch headers:
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer your-api-key-here'
}
```

## 🎯 **Features**

### **Data Synchronization:**
- ✅ **Carnival Sync** - Fetches and syncs carnival data
- ✅ **User Sync** - Fetches and syncs user profiles
- ✅ **Full Sync** - Syncs all data types at once
- ✅ **Incremental Updates** - Updates existing records

### **Admin Panel:**
- ✅ **Real-time Statistics** - Shows local data counts
- ✅ **Connection Monitoring** - Checks API connectivity
- ✅ **Activity Logs** - Tracks all sync operations
- ✅ **Manual Sync Controls** - Trigger syncs on demand

### **Data Management:**
- ✅ **Conflict Resolution** - Handles duplicate data
- ✅ **Error Handling** - Graceful failure recovery
- ✅ **Data Validation** - Ensures data integrity
- ✅ **Audit Trail** - Tracks sync timestamps

## 🔧 **API Endpoints Expected**

Your `tagyou.org` API should provide these endpoints:

### **Carnivals API:**
```
GET /api/carnivals
Response: Array of carnival objects
```

### **Users API:**
```
GET /api/users
Response: Array of user objects
```

### **Health Check:**
```
GET /api/health
Response: Status object
```

## 📊 **Data Structure**

### **Carnival Object:**
```javascript
{
  id: "unique-id",
  name: "Carnival Name",
  location: "City, Country",
  date: "Aug 24-26, 2025",
  status: "active|upcoming|finished",
  description: "Carnival description",
  website: "https://carnival-website.com",
  expected_attendance: "2+ million",
  highlights: ["Feature 1", "Feature 2"],
  route_data: { /* map route data */ },
  coordinates: { lat: 51.5074, lng: -0.1278 },
  images: ["url1", "url2"],
  tags: ["tag1", "tag2"]
}
```

### **User Object:**
```javascript
{
  email: "user@example.com",
  full_name: "User Full Name",
  avatar_url: "https://avatar-url.com",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z"
}
```

## 🎮 **Usage**

### **Access Admin Panel:**
```
http://localhost:3000/admin-panel.html
```

### **Sync Operations:**
1. **Sync Carnivals** - Fetches latest carnival data
2. **Sync Users** - Fetches latest user data
3. **Full Sync** - Syncs all data types
4. **Refresh Stats** - Updates dashboard statistics

### **Monitoring:**
- **Connection Status** - Real-time API connectivity
- **Activity Logs** - Detailed operation history
- **Statistics** - Data counts and sync timestamps

## 🔒 **Security Considerations**

### **API Security:**
- Use HTTPS for all API calls
- Implement proper authentication
- Rate limit API requests
- Validate all incoming data

### **Database Security:**
- Row Level Security (RLS) enabled
- Proper access policies configured
- Regular data backups
- Audit logging enabled

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **Connection Failed:**
   - Check API endpoint URLs
   - Verify authentication credentials
   - Test API endpoints manually

2. **Sync Errors:**
   - Check database permissions
   - Verify data format matches expected structure
   - Review activity logs for specific errors

3. **Admin Panel Not Loading:**
   - Check browser console for JavaScript errors
   - Verify Supabase credentials
   - Ensure all files are properly loaded

### **Debug Mode:**
Enable detailed logging by checking browser console for debug messages.

## 📈 **Performance Optimization**

### **Sync Optimization:**
- Implement incremental syncs
- Use pagination for large datasets
- Cache frequently accessed data
- Schedule automatic syncs

### **Database Optimization:**
- Create appropriate indexes
- Use connection pooling
- Monitor query performance
- Regular maintenance

## 🔄 **Automation**

### **Scheduled Syncs:**
You can set up automated syncs using:

1. **Cron Jobs** (Server-side)
2. **Browser Extensions** (Client-side)
3. **Cloud Functions** (Serverless)

### **Webhook Integration:**
Set up webhooks to trigger syncs when data changes on `tagyou.org`.

## 📞 **Support**

For issues or questions:
1. Check the activity logs in the admin panel
2. Review browser console for error messages
3. Verify API endpoints and authentication
4. Test database connectivity

## 🔄 **Updates**

To update the integration:
1. Backup current configuration
2. Update API endpoints if needed
3. Test with small datasets first
4. Monitor sync operations
5. Update documentation

---

**Last Updated:** January 2025
**Version:** 1.0.0
