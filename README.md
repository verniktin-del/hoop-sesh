# Hoops - Basketball Court Reservation System

## Features
- Court reservation system with calendar view
- Push notifications for new reservations
- Join request functionality via push notifications
- Game logging with notifications
- Leaderboard system
- PWA support
- **Hosted on GitHub Pages**

## Setup Instructions

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Enable Firestore Database
4. Enable Cloud Messaging
5. Get your Firebase config (already in the code)

### 2. GitHub Pages Deployment
1. Push your code to a GitHub repository
2. Go to repository Settings > Pages
3. Select "Deploy from a branch" and choose `main`
4. Your app will be available at `https://yourusername.github.io/repository-name`

### 3. Firebase Configuration
- Firestore is used for database storage
- Firebase Cloud Messaging is used for push notifications
- No server-side functions needed (works with GitHub Pages)

## Push Notifications Setup

### 1. Generate VAPID Keys
1. Go to Firebase Console > Project Settings > Cloud Messaging
2. Generate new key pair for Web Push certificates
3. Update the VAPID key in `index.html` (line 772)

### 2. Service Worker Registration
The app automatically registers the Firebase messaging service worker for push notifications.

## Features

### Push Notifications
- **Reservation Notifications**: Sent when someone makes a new reservation
- **Game Notifications**: Sent when admin logs a new game
- **Join Requests**: Users can respond to notifications with "Dolazim" or "Ne dolazim"

### Join Request Flow
1. User makes a reservation
2. Push notification sent to all users with join buttons
3. Users can tap "Dolazim" or "Ne dolazim" in the notification
4. Response is stored in Firestore `joinRequests` collection

### Mobile Support
- PWA installation support
- Offline functionality
- Push notifications work on mobile browsers
- Responsive design for mobile devices

## File Structure
```
├── index.html              # Main app
├── service-worker.js       # PWA service worker
├── firebase-messaging-sw.js # Push notification service worker
├── manifest.json           # PWA manifest
├── functions/
│   ├── index.js           # Cloud Functions for notifications
│   └── package.json       # Functions dependencies
└── firebase.json          # Firebase configuration
```

## Testing Push Notifications

1. Deploy the app to Firebase Hosting
2. Access from mobile device
3. Allow notification permissions
4. Create a reservation - all users should receive push notifications
5. Tap join buttons in notifications to test responses
