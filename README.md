# TV Time Tracker

A Progressive Web App (PWA) for tracking your favorite TV shows, upcoming episodes, and managing your watchlist.

![TV Time Tracker](./src/assets/icon.svg)

## Features

- **Track Your Favorite Shows**: Add shows to your watchlist and keep track of what you're watching
- **Upcoming Episodes**: See when new episodes of your favorite shows are airing
- **Show Details**: View comprehensive information about shows, including seasons, episodes, and ratings
- **Search Functionality**: Find new shows to watch
- **Offline Support**: Access your watchlist even when offline
- **Installable**: Install as a PWA on your mobile device or desktop
- **Mobile-Friendly**: Responsive design optimized for mobile devices

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- TMDB API
- Vite
- PWA (Progressive Web App)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/TheGhossst/EpisodeAlertsApp.git
   cd EpisodeAlertsApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your TMDB API key:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

4. Start the development server:
   ```bash
   npm run start
   ```

5. Open your browser and navigate to `http://localhost:5173`

## PWA Setup

This project is configured as a Progressive Web App (PWA), which allows users to install it on their devices and use it offline.

### Setting Up PWA Assets

1. Run the PWA setup script:
   ```bash
   node scripts/setup-pwa.js
   ```

   This script will:
   - Install necessary dependencies
   - Convert the SVG icon to PNG
   - Generate various sized icons and splash screens for different devices

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy to a HTTPS-enabled server (required for PWA functionality)

### PWA Features

- **Offline Support**: The app works offline, allowing users to access their watchlist without an internet connection
- **Installable**: Users can install the app on their home screen
- **Push Notifications**: (Coming soon) Get notified when new episodes of your favorite shows are available
- **Background Sync**: (Coming soon) Updates your watchlist in the background when connectivity is restored

## Deployment

1. Build the production version:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist` directory, which can be deployed to any static hosting service.

3. For PWA functionality, ensure your hosting service supports HTTPS.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## Acknowledgments

- Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/) 