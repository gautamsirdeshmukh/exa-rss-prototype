# Exa RSS Feed

A cross-platform mobile application that creates a curated RSS feed using the Exa AI API. Built with React Native and Expo for iOS and web deployment.

## Features

- **Topic Management**: Add, edit, and manage topics of interest
- **Real-time Updates**: Automatic fetching of new articles based on your topics
- **Smart Notifications**: Configurable notification settings with quiet hours
- **Cross-platform**: Runs on both iOS and web
- **Offline Support**: Articles are cached locally for offline reading
- **AI-powered Search**: Uses Exa AI's semantic search capabilities

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Exa AI API key (sign up at https://exa.ai/)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd exa-rss-feed
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running the App

- **Web**: Press `w` in the terminal or visit `http://localhost:19006`
- **iOS**: Press `i` in the terminal (requires Xcode)
- **Android**: Press `a` in the terminal (requires Android Studio)

### Configuration

1. **API Key Setup**: 
   - Launch the app and go to the Settings tab
   - Enter your Exa AI API key
   - The key will be securely stored locally

2. **Add Topics**:
   - Navigate to the Topics tab
   - Tap "Add Topic" to create new topics
   - Enter a topic name and search query
   - Toggle notifications as needed

3. **Notification Settings**:
   - Configure notification frequency (immediate, hourly, daily)
   - Set quiet hours to avoid notifications during specific times
   - Enable/disable notifications globally

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
│   ├── FeedScreen.tsx   # Article feed display
│   ├── TopicsScreen.tsx # Topic management
│   └── SettingsScreen.tsx # App settings
├── services/           # API and utility services
│   ├── ExaApiService.ts    # Exa AI API integration
│   ├── StorageService.ts   # Local data persistence
│   └── NotificationService.ts # Background notifications
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Features Explained

### Topic Management
- Create topics with custom search queries
- Enable/disable topics individually
- Configure per-topic notification settings
- Topics are automatically synced in the background

### Smart Notifications
- Background fetch for new articles
- Configurable notification frequency
- Quiet hours support
- Rich notifications with article counts

### Article Feed
- Chronological display of articles
- Topic-based filtering
- Pull-to-refresh functionality
- Mark articles as read
- Direct links to original sources

## API Integration

The app uses the Exa AI API for intelligent content discovery:

- **Neural Search**: Semantic search for more relevant results
- **Content Extraction**: Automatic article summarization
- **Time-based Filtering**: Fetch only recent articles
- **Domain Management**: Include/exclude specific domains

## Storage and Privacy

- All data is stored locally on the device
- API keys are securely stored using Expo SecureStore
- No user data is sent to external servers (except Exa AI API calls)
- Users can clear all data at any time

## Building for Production

### Web Build
```bash
npm run build:web
```

### iOS Build
```bash
eas build --platform ios
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and feature requests, please create an issue in the GitHub repository.
