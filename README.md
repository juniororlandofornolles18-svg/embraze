# Embraze

Real-time crisis support platform connecting people in need with volunteers through an interactive map.

## Features

- Emergency alerts with live location tracking
- Donation requests for essential items
- 3D tilted map view with real-time markers
- Boost system to prioritize urgent requests
- Activity history tracking
- Google authentication

## Setup

```bash
npm install
npm run dev
```

Create `.env` file with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Deploy Firebase database rules from `database.rules.json`.

## Tech Stack

React 19 • Vite • Tailwind CSS • MapLibre GL • Firebase • Framer Motion

## License

MIT
