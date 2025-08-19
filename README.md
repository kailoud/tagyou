# TagYou2 - London Festival Map

A modern, interactive London map application for festival-goers, featuring real-time data from Firebase.

## Features

- 🗺️ Interactive London map with Leaflet.js
- 🎭 Notting Hill Carnival route and information
- 🍽️ Food stalls with real-time data
- 🎵 Artists and bands information
- ❤️ User favorites system
- 📱 Responsive design for all devices
- 🔄 Real-time updates via Firebase
- 🎨 Modern, clean UI

## Getting Started

### Prerequisites

- Node.js installed
- A Firebase project (see [Firebase Setup Guide](FIREBASE_SETUP.md))

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Follow the [Firebase Setup Guide](FIREBASE_SETUP.md)
   - Update `firebase-config.js` with your Firebase credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5500`

## Project Structure

```
tagyou2/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── script.js               # Main JavaScript functionality
├── firebase-config.js      # Firebase configuration
├── firebase-service.js     # Firebase data services
├── package.json            # Node.js dependencies
├── FIREBASE_SETUP.md       # Firebase setup guide
└── README.md               # This documentation file
```

## Firebase Integration

This project uses Firebase for:
- **Firestore Database**: Store food stalls, artists, and user data
- **Real-time Updates**: Live data synchronization
- **User Favorites**: Save user preferences
- **Scalability**: Handle growing user base

### Collections

- `foodStalls`: Food stall information and locations
- `artists`: Artist and band details
- `userFavorites`: User favorite items

## Development

### Available Scripts

- `npm start`: Start development server
- `npm run dev`: Start development server with live reload
- `npm run build`: Build for production (placeholder)
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

### Adding New Features

1. **Add new data types**: Update `firebase-service.js`
2. **Add new UI components**: Modify `script.js` and `styles.css`
3. **Add authentication**: Extend Firebase Auth integration
4. **Add offline support**: Implement service workers

## Deployment

1. Set up Firebase Hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```

2. Build and deploy:
   ```bash
   firebase deploy
   ```

## Admin Portal

The admin portal for managing festival data is now in a separate repository for security reasons. The admin portal includes:

- Real-time artist tracking
- Pre-event setup and registration
- Data management tools
- Interactive mapping interface

Contact the development team for access to the admin portal.

## Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for modern web development and festival experiences.
