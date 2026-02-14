# Embraze

A real-time crisis support platform that connects people in emergency situations with nearby volunteers through an interactive 3D map interface. Built to bridge the gap between those who need help and those who can provide it during critical moments.

## The Problem

During emergencies and crises, traditional support systems can be overwhelmed or inaccessible. People in need often struggle to find immediate help, while willing volunteers nearby have no way to discover who needs assistance. Embraze solves this by creating a real-time, location-based network that makes crisis support immediate and accessible.

## Key Features

### For Those Seeking Help

- **Emergency Alerts**: Broadcast your location and situation instantly to nearby volunteers
- **Donation Requests**: Request specific essential items (food, water, medical supplies, shelter)
- **Boost System**: Prioritize urgent requests to get faster responses
- **Real-time Tracking**: Share your live location so help can find you quickly
- **Activity History**: Track all your past requests and received support

### For Volunteers

- **Interactive 3D Map**: View all active alerts on a tilted map with real-time markers
- **Turn-by-Turn Navigation**: Get directions to people who need help
- **Alert Details**: See comprehensive information about each emergency
- **Response Tracking**: Monitor which alerts you've responded to

### Security & Privacy

- **Google Authentication**: Secure sign-in to prevent abuse
- **Location Privacy**: Users control when and how their location is shared
- **Activity Logging**: Complete audit trail of all platform interactions

## Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS with custom animations
- **Mapping**: MapLibre GL with 3D terrain support
- **Backend**: Firebase Realtime Database
- **Authentication**: Firebase Auth with Google OAuth
- **Animations**: Framer Motion
- **Icons**: Font Awesome, React Icons
- **Routing**: Mapbox Directions API

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Realtime Database enabled
- Google OAuth credentials configured in Firebase
- Mapbox API token (for routing functionality)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/embraze-react.git
cd embraze-react
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MAPBOX_TOKEN=your_mapbox_token
```

4. Deploy Firebase database rules:

```bash
firebase deploy --only database
```

Or manually copy the rules from `database.rules.json` to your Firebase console.

5. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Creating an Emergency Alert

1. Sign in with your Google account
2. Click the red emergency button in the bottom-right corner
3. Select alert type (Emergency or Donation)
4. Fill in details about your situation
5. Your alert appears on the map for nearby volunteers

### Responding to Alerts

1. Browse the map to see active alerts
2. Click any marker to view details
3. Use "Get Directions" to navigate to the location
4. Follow the turn-by-turn navigation panel

### Managing Your Profile

1. Open the side panel from the top-right menu
2. Navigate to Profile tab to view your information
3. Check History tab to see past alerts and responses
4. Use Settings to customize your experience

## Project Structure

```
embraze-react/
├── src/
│   ├── components/        # React components
│   │   ├── tabs/         # Side panel tab components
│   │   ├── Map.jsx       # Main map component
│   │   ├── AlertModal.jsx
│   │   └── ...
│   ├── config/           # Firebase and Mapbox configuration
│   ├── utils/            # Helper functions (auth, routing, logging)
│   └── App.jsx           # Main application component
├── public/               # Static assets
├── database.rules.json   # Firebase security rules
└── package.json
```

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory, ready for deployment.

## Deployment

The app can be deployed to any static hosting service:

- Firebase Hosting
- Vercel
- Netlify
- GitHub Pages

Example deployment to Firebase:

```bash
npm run build
firebase deploy --only hosting
```

## Future Enhancements

- Push notifications for nearby alerts
- In-app messaging between users and volunteers
- Multi-language support
- Offline mode with service workers
- Advanced filtering (alert type, distance, urgency)
- Volunteer verification system
- Integration with emergency services
- Mobile app versions (iOS/Android)

## Known Limitations

- Requires active internet connection
- Location services must be enabled for full functionality
- Routing requires Mapbox API token (free tier available)
- Real-time updates depend on Firebase connection quality

## Contributing

This project was built for a hackathon. Contributions, issues, and feature requests are welcome!

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with modern web technologies to make crisis support accessible to everyone. Special thanks to the open-source community for the amazing tools that made this possible.
