# Saarthi - Real-time Bus Tracking App

A comprehensive React Native mobile application for real-time bus tracking in tier-2 cities, built with Expo and featuring role-based access for Commuters and Drivers.

## 🚀 Features

### Authentication & Roles
- **Email/Phone + Password** login and registration
- **Role-based navigation**: Commuter and Driver dashboards
- **Secure JWT token** authentication with AsyncStorage persistence
- **Automatic role-based redirection** after login

### For Commuters
- **Real-time Map View**: Live bus locations with WebSocket updates
- **Interactive Bus Cards**: Tap to view bus details and occupancy
- **ETA Information**: Estimated Time of Arrival for selected stops
- **Crowd Feedback**: Submit occupancy levels (Low/Medium/High)
- **Offline Support**: Cache data and submit feedback when offline
- **Location-based Services**: Find nearby buses automatically

### For Drivers
- **Trip Management**: Start/Stop trips with route selection
- **GPS Tracking**: Automatic location updates every 5 seconds
- **Route Visualization**: See assigned routes and stops on map
- **Real-time Updates**: Live location sharing via WebSocket
- **Status Dashboard**: Monitor trip status and route information

### Technical Features
- **Offline Caching**: AsyncStorage for routes and schedules
- **Real-time Updates**: WebSocket integration for live data
- **Error Handling**: Comprehensive error states and retry logic
- **Loading States**: Smooth UX with loading indicators
- **Network Awareness**: Offline mode detection and sync

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router with role-based routing
- **State Management**: Redux Toolkit + React Query
- **Maps**: React Native Maps (Google Maps)
- **Storage**: AsyncStorage for offline caching
- **Real-time**: Socket.io for WebSocket communication
- **Location**: Expo Location for GPS tracking
- **UI**: Custom components with responsive design

## 📱 App Structure

```
/app
  /auth
    login.tsx          # Login screen
    register.tsx       # Registration screen
  /commuter
    index.tsx          # Map view with live buses
    eta.tsx           # ETA information
    feedback.tsx      # Crowd feedback form
  /driver
    index.tsx         # Driver dashboard
  /components
    BusCard.tsx       # Bus information card
    ETACard.tsx       # ETA display component
  /services
    api.ts           # REST API client
    websocket.ts     # WebSocket service
    offline.ts       # Offline caching service
  /store
    index.ts         # Redux store configuration
    /slices
      authSlice.ts   # Authentication state
      busSlice.ts    # Bus and route data
      locationSlice.ts # Location tracking
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Android Studio / Xcode (for device testing)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd Saarthi
   npm install
   ```

2. **Configure backend URLs**:
   Update `app.json` with your backend endpoints:
   ```json
   {
     "expo": {
       "extra": {
         "apiBaseUrl": "https://your-api-host.com",
         "wsUrl": "wss://your-ws-host.com"
       }
     }
   }
   ```

3. **Run the app**:
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   
   # For Web (development)
   npm run web
   ```

### Backend Integration

The app expects the following API endpoints:

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

#### Commuter Endpoints
- `GET /commuter/buses/nearby` - Get nearby buses
- `GET /commuter/bus/{id}/eta/{stopId}` - Get ETA for bus at stop
- `POST /commuter/feedback` - Submit crowd feedback

#### Driver Endpoints
- `GET /driver/routes` - Get assigned routes
- `POST /driver/trip/start` - Start trip
- `POST /driver/trip/stop` - Stop trip
- `POST /driver/location` - Update location

#### WebSocket Events
- `bus:location` - Real-time bus location updates
- `driver:location` - Driver location updates
- `route:update` - Route information updates
- `eta:update` - ETA updates

## 🔧 Configuration

### Environment Variables
Set your backend URLs in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "http://localhost:8000",
      "wsUrl": "ws://localhost:8000"
    }
  }
}
```

### Android Configuration
The app is configured with:
- Package name: `com.saarthi.app`
- Location permissions for GPS tracking
- Background location for driver tracking

### iOS Configuration
- Location permissions configured
- Background modes for location updates

## 📱 Usage

### For Commuters
1. **Register/Login** with email and password
2. **Select Commuter role** during registration
3. **View live map** with nearby buses
4. **Tap bus cards** to see ETA information
5. **Submit feedback** about bus occupancy
6. **Works offline** - data syncs when online

### For Drivers
1. **Register/Login** with Driver role
2. **Select assigned route** from dropdown
3. **Start trip** to begin GPS tracking
4. **Monitor route** on interactive map
5. **Stop trip** when finished

## 🔄 Offline Support

The app includes comprehensive offline support:
- **Cached Data**: Routes and bus schedules stored locally
- **Offline Feedback**: Submit feedback when offline, syncs when online
- **Network Detection**: Automatic online/offline mode switching
- **Data Sync**: Automatic sync when connection restored

## 🎨 UI/UX Features

- **Clean Design**: Modern, intuitive interface
- **Role-based Navigation**: Different layouts for Commuters and Drivers
- **Loading States**: Smooth loading indicators throughout
- **Error Handling**: User-friendly error messages
- **Offline Indicators**: Clear offline mode notifications
- **Responsive Layout**: Works on various screen sizes

## 🚀 Deployment

### Android
1. Configure `app.json` with production URLs
2. Build APK: `expo build:android`
3. Or use EAS Build: `eas build --platform android`

### iOS
1. Configure `app.json` with production URLs
2. Build for iOS: `expo build:ios`
3. Or use EAS Build: `eas build --platform ios`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for better public transportation in tier-2 cities**
