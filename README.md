# HoopIG — Mobile MVP Demo

HoopIG is a basketball-inspired social discovery app prototype built with Expo and React Native. This MVP demonstrates the main onboarding and discovery experience, with fictional local profiles and simulated interactions for product demos.

## Features

- Google sign-in connected to Supabase Auth.
- Profile onboarding for nickname, birthday, gender, country, interests, and profile photo.
- Profile data saved to Supabase.
- Discover screen with sample profiles, three photos per profile, and swipe gestures.
- Demo profile details, interests, and Instagram handles.
- Local-only skip and add-friend interactions designed for showcasing the user flow.
- Profile, rewards, and settings screens.

## Demo scope

This repository is a visual MVP, not a production dating or social platform. Discover profiles and photos are fictional demo content. Swipe actions and match-related UI are simulated; messaging, real matching, profile moderation, and production discovery are not connected to a backend service.

## Tech stack

- React Native
- Expo SDK 54
- Expo Router
- TypeScript
- Supabase Auth and database
- AsyncStorage for the Supabase session on native platforms

## Run locally

```bash
npm install
npx expo start
```

Open the project in an Android emulator, an iOS simulator, or a development build. Native Google Sign-In requires a development build; it is not supported in Expo Go.

## Environment configuration

Create a `.env` file in the project root and provide the configuration for your own Supabase and Google OAuth projects:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id
GOOGLE_IOS_URL_SCHEME=your-google-ios-url-scheme
```

Use the credentials from your own provider projects. Never commit private credentials or a Supabase service-role key. The `.env` file is ignored by Git.

## Project structure

```text
app/
  (app)/       Discover, profile, and settings
  (public)/    Sign-in
  (setup)/     Profile onboarding
constants/     Theme and fictional demo profiles
assets/        Local app and demo-profile images
components/    Shared UI components
lib/           Supabase, Google sign-in, and profile helpers
providers/     Authentication state
types/         Profile types
```

## License

This repository is a client-demo prototype. Add a license before reusing or distributing the code.
