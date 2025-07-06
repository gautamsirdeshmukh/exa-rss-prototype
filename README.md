# Exa RSS Feed

A cross-platform mobile application that creates a curated RSS feed using the Exa AI API. Built with React Native and Expo for iOS and web deployment.

## Features

- **Topic Management**: Add, edit, and manage topics of interest
- **Real-time Updates**: Automatic fetching of new articles based on your topics
- **Smart Notifications**: Configurable notification settings with quiet hours
- **User Profiles**: Manage personal information and preferences
- **Cross-platform**: Runs on both iOS and web
- **Offline Support**: Articles are cached locally for offline reading
- **AI-powered Search**: Uses Exa AI's semantic search capabilities
- **No Setup Required**: Works immediately without API key configuration

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gautamsirdeshmukh/exa-rss-prototype.git
cd exa-rss-feed
```

2. **Configure your Exa API key** (Required):
   - Open `src/services/ExaApiService.ts`
   - Replace `'your-company-exa-api-key-here'` on line 5 with your actual Exa AI API key
   - Save the file

3. Install dependencies:
```bash
npm install --legacy-peer-deps
```

4. Start the development server:
```bash
npm start
```

### Running the App

- **Web**: Press `w` in the terminal or visit `http://localhost:19006`
- **iOS**: Press `i` in the terminal (requires Xcode)
- **Android**: Press `a` in the terminal (requires Android Studio)

### User Guide

1. **Getting Started**: 
   - The app launches with all features immediately available
   - No API key setup required from users

2. **Set Up Your Profile**:
   - Go to Settings tab
   - Enter your email, username, and name
   - Configure notification preferences

3. **Add Topics**:
   - Navigate to the Topics tab
   - Tap "Add Topic" to create new topics
   - Enter a topic name and search query (e.g., "AI Technology" with query "latest AI breakthroughs")
   - Toggle notifications as needed

4. **Browse Articles**:
   - Go to Feed tab
   - Pull down to refresh and fetch new articles
   - Tap articles to read them in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
│   ├── FeedScreen.tsx   # Article feed display
│   ├── TopicsScreen.tsx # Topic management
│   └── SettingsScreen.tsx # User profile & app settings
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
- Configurable notification frequency (immediate, hourly, daily)
- Quiet hours support
- Rich notifications with article counts

### Article Feed
- Chronological display of articles
- Topic-based categorization
- Pull-to-refresh functionality
- Mark articles as read
- Direct links to original sources

### User Profile Management
- Personal information storage
- Email and username management
- Local data persistence
- Cache size monitoring

## API Integration

The app uses the Exa AI API for intelligent content discovery:

- **Neural Search**: Semantic search for more relevant results
- **Content Extraction**: Automatic article summarization from full text
- **Time-based Filtering**: Fetch only recent articles
- **Company API Key Model**: Uses a single company API key for all users

## Storage and Privacy

- All data is stored locally on the device using AsyncStorage
- User profiles and preferences are kept private
- No external database required
- Users can clear all data at any time
- Cache management tools available in Settings

## Development

### Company API Key Model

This app is designed to use a single company Exa API key rather than requiring users to provide their own keys. This approach:

- **Simplifies onboarding**: Users can start using the app immediately
- **Enables usage tracking**: Monitor API usage across all users
- **Supports billing models**: Implement tiered pricing based on usage
- **Improves security**: API keys are never exposed to users

### Building for Production

#### Web Build
```bash
npx expo build:web
```

#### iOS Build
```bash
npx expo build:ios
```

### Environment Variables

For production deployments, consider using environment variables for the API key:

```typescript
const COMPANY_EXA_API_KEY = process.env.EXPO_PUBLIC_EXA_API_KEY || 'fallback-key';
```

## Usage Analytics

The app is structured to support usage analytics and billing:

- User identification through profile system
- Local storage for offline functionality
- Ready for backend integration
- Scalable architecture for multi-tenant usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both web and iOS
5. Submit a pull request

## Deployment Considerations

- **API Key Security**: Store production API keys securely
- **Rate Limiting**: Monitor Exa API usage to avoid limits
- **User Management**: Consider adding authentication for production
- **Analytics**: Implement usage tracking for business insights

## License

This project is licensed under the MIT License.

## Support

For issues and feature requests, please create an issue in the GitHub repository.

---

**Note**: Remember to replace the placeholder API key in `src/services/ExaApiService.ts` with your actual Exa AI API key before running the application.