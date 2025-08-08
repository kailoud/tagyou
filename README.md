# GroupTracker 🗺️

A real-time group location tracking application for events, festivals, and meetups. Built with HTML5, CSS3, and JavaScript with Leaflet.js for interactive mapping.

## ✨ Features

- **Real-time Location Tracking**: Share your location with group members
- **Interactive Map**: Powered by Leaflet.js with OpenStreetMap
- **Group Management**: Create and join groups with unique codes
- **Member Search**: Find group members by name or phone number
- **Emergency Alerts**: Send emergency notifications to your group
- **Mobile Responsive**: Optimized for mobile devices
- **Privacy Controls**: Manage your location sharing preferences

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tagyou.git
   cd tagyou
   ```

2. **Open in browser**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Or simply open grouptracker.html in your browser
   ```

3. **Access the application**
   - Open `http://localhost:8000` in your browser
   - Allow location permissions when prompted

## 📱 Usage

### Creating a Group
1. Click the group button (top-left)
2. Enter a group name
3. Click "Create Group"
4. Share the generated code with friends

### Joining a Group
1. Click the group button
2. Enter the 6-digit group code
3. Click "Join Group"

### Location Sharing
- Toggle the location sharing button (bottom-right)
- Green = sharing enabled
- Red = sharing disabled

### Emergency Alerts
1. Go to the Emergency tab
2. Click "Send Emergency Alert"
3. Select emergency type and add message
4. Alert will be sent to all group members

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js
- **Maps**: OpenStreetMap
- **Icons**: SVG icons (built-in)
- **Styling**: Custom CSS with modern design

## 📁 Project Structure

```
grouptracker/
├── grouptracker.html      # Main application file
├── README.md             # Project documentation
├── .gitignore           # Git ignore rules
├── LICENSE              # MIT License
├── package.json         # Node.js dependencies (optional)
└── deploy/             # Deployment configurations
    ├── vercel.json     # Vercel deployment config
    └── netlify.toml    # Netlify deployment config
```

## 🌐 Deployment Options

### GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your app will be available at `https://yourusername.github.io/tagyou`

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Netlify
1. Drag and drop the project folder to Netlify
2. Or connect your GitHub repository
3. Automatic deployments on push

## 🔧 Configuration

### Environment Variables
For production deployment, you may want to add:
- `MAP_TILE_URL`: Custom map tile provider
- `API_ENDPOINT`: Backend API URL (if using server)

### Customization
- **Colors**: Modify CSS variables in the `<style>` section
- **Map Center**: Change default coordinates in `initializeMap()`
- **Update Intervals**: Adjust timing in JavaScript functions

## 🔒 Privacy & Security

- Location data is processed client-side only
- No data is stored on external servers
- Location sharing requires explicit user consent
- Emergency features use native browser APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Leaflet.js](https://leafletjs.com/) for interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [SVG Icons](https://heroicons.com/) for UI icons

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the browser console for error messages
- Ensure location permissions are enabled

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- Real-time location tracking
- Group management
- Emergency alerts
- Mobile responsive design

---

Made with ❤️ for safe group coordination at events and festivals.
