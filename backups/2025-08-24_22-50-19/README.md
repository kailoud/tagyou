# TagYou2 - London Festival Map

A modern, interactive London map application for festival-goers, featuring real-time data from Supabase.

## Features

- 🗺️ Interactive London map with Leaflet.js
- 🎭 Notting Hill Carnival route and information
- 🍽️ Food stalls with real-time data
- 🎵 Artists and bands information
- ❤️ User favorites system
- 📱 Responsive design for all devices
- 🔄 Real-time updates via Supabase
- 🎨 Modern, clean UI

## Getting Started

### Prerequisites

- Node.js installed
- A Supabase project (see [Supabase Setup Guide](SUPABASE_SETUP.md))

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Follow the [Supabase Setup Guide](SUPABASE_SETUP.md)
   - Update `supabase-config-secret.js` with your Supabase credentials

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
├── supabase-config.js      # Supabase configuration
├── supabase-service.js     # Supabase data services
├── supabase-auth-service.js # Supabase authentication
├── package.json            # Node.js dependencies
├── SUPABASE_SETUP.md       # Supabase setup guide
└── README.md               # This documentation file
```

## Supabase Integration

This project uses Supabase for:
- **PostgreSQL Database**: Store food stalls, artists, and user data
- **Real-time Updates**: Live data synchronization via PostgreSQL subscriptions
- **User Favorites**: Save user preferences
- **Authentication**: Built-in auth with multiple providers
- **Scalability**: Handle growing user base

### Tables

- `food_stalls`: Food stall information and locations
- `artists`: Artist and band details
- `float_trucks`: Float truck information and routes
- `user_favorites`: User favorite items

## Development

### Available Scripts

- `npm start`: Start development server
- `npm run dev`: Start development server with live reload
- `npm run build`: Build for production (placeholder)
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

### Adding New Features

1. **Add new data types**: Update `supabase-service.js`
2. **Add new UI components**: Modify `script.js` and `styles.css`
3. **Add authentication**: Extend Supabase Auth integration
4. **Add offline support**: Implement service workers

## Deployment

1. Set up Vercel or Netlify:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Upload dist/ folder to your hosting provider
   ```

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
