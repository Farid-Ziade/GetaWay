# GetaWay 

## Phase 1: UI and basic firebase

## Project Overview

GetaWay v2 is a production-oriented Flutter application designed to help users plan smart weekend getaways.

The app will:
- Authenticate users securely
- Use the user’s location
- Display nearby places on a map
- Use weather data to improve recommendations
- Generate AI-based trip plans (via backend)
- Allow budget customization
- Save trips and avoid duplicate recommendations

---

## Current Project State

At this stage, the application has been structured using a clean and scalable architecture.

### Focus so far:
- Project structure setup
- UI foundation
- App entrypoint refactoring (thin main.dart)
- Firebase initialization (basic)
- Feature-based architecture

No backend, AI logic, or advanced features have been implemented yet.

---

## Project Structure
```
lib/
├── main.dart
├── app/
│   └── getaway_app.dart
├── core/
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── widgets/
│   │   └── services/
│   ├── home/
│   │   ├── screens/
│   │   └── widgets/
│   └── ...
└── shared/
```
---

## Entry Point

File: lib/main.dart

This file is the starting point of the application.

Responsibilities:
- Initialize Flutter bindings
- Initialize Firebase
- Launch the main app widget

Flow:
- WidgetsFlutterBinding.ensureInitialized() prepares Flutter
- Firebase.initializeApp() connects the app to Firebase
- runApp(GetawayApp) starts the UI

Important:
- This file is intentionally minimal (thin entrypoint)
- No UI or business logic should be placed here

---

## App Configuration

File: lib/app/getaway_app.dart

This file defines the main application configuration.

Responsibilities:
- Define MaterialApp
- Manage routing/navigation
- Apply global theme
- Set initial screen

Why this separation:
- Keeps main.dart clean
- Makes scaling easier
- Centralizes app-level configuration

---

## Architecture Approach

The app uses a feature-based architecture.

Each feature is isolated inside lib/features/.

Example structure:

```
features/
├── auth/
│   ├── screens/
│   ├── widgets/
│   └── services/
├── home/
│   ├── screens/
│   └── widgets/
```

Benefits:
- Modular design
- Easier maintenance
- Better scalability
- Clear separation of concerns

---

## Authentication (Current State)

Location: lib/features/auth/

Contains:
- login_screen.dart → handles UI for user login
- auth_service.dart → handles authentication logic

Current status:
- UI is implemented
- Firebase Authentication is connected
- Basic login flow exists

Important behavior:
- Firebase automatically prevents duplicate emails
- Errors like:
  - email-already-in-use
  - invalid-email
  - weak-password
  must be handled in the UI

Current limitation:
- Error handling is not fully implemented yet

---

## Home Feature

Location: lib/features/home/

Purpose:
- Acts as the main screen after login

Current state:
- Basic placeholder UI

Future responsibilities:
- Display map
- Show AI recommendations
- Handle trip planning

---

## Firebase Setup

Current setup:
- Firebase is initialized in main.dart
- firebase_options.dart is present
- Authentication is partially working

Current initialization:
Firebase.initializeApp()

Future improvement (recommended):
Use platform-specific configuration:

Firebase.initializeApp(
  options: DefaultFirebaseOptions.currentPlatform
)

---

## Application Flow

1. App starts from main.dart
2. Flutter bindings initialize
3. Firebase initializes
4. GetawayApp is launched
5. MaterialApp loads configuration
6. Initial route opens login screen
7. Login screen uses auth_service
8. On success → user navigates to Home screen

---

## Known Limitations

- Authentication error handling is incomplete
- No route protection (auth guard)
- No Firestore database yet
- No backend implemented
- No AI integration
- No map/location features yet
- No weather integration yet

---

## Current Testing Status

- App builds successfully
- Firebase initializes correctly
- UI loads properly
- Navigation works at basic level

---

## Next Planned Step

Before adding new features:

- Improve authentication system:
  - Proper error handling
  - Input validation
  - Clear user feedback
- Add route protection
- Clean auth service logic

---

