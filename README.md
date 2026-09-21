# HoopIG — Mobile Social Discovery Demo

HoopIG is an independent mobile social discovery app demo built with Expo and React Native. It explores how people might meet new people, make friends, and discover potential connections through swipe-style profiles. The demo uses fictional local profiles and simulated interactions for product presentations.

## Product inspiration

The swipe-based discovery interaction is inspired by Tinder, while the social profile and connection flow is inspired by Hoop. These references are product inspiration only. HoopIG is an independent demo and is not affiliated with, endorsed by, or connected to Tinder or Hoop.

## Features

- Google sign-in connected to Supabase Auth.
- Profile onboarding for nickname, birthday, gender, country, interests, and profile photo.
- User profile data saved to Supabase when the project is configured with a Supabase backend.
- Discover screen with fictional local sample profiles, three photos per profile, and swipe gestures.
- Demo profile details, interests, and Instagram handles.
- Simulated local-only skip and add-friend interactions, including a match-style profile panel.
- Profile, rewards, and settings screens.

## Demo scope and limitations

This repository is a visual MVP, not a production social or dating platform. The discover profiles and photos are fictional local demo content bundled with the app. Swipe, add-friend, and match-related interactions are simulated in the client and are not connected to a matching service or persistent connection system.

Messaging, production matching, profile moderation, and live discovery are not implemented. The Instagram actions are also demo-only and do not open an external app. Supabase Auth and profile persistence require the project's own backend configuration; the sample discover profiles remain local demo data.

## Tech stack

- React Native
- Expo SDK 54
- Expo Router
- TypeScript
- Supabase Auth and database
- AsyncStorage for the Supabase session and local profile draft on native platforms

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
