# Handlah — React Native App

A personal and business life-organizer for iOS and Android. One app tracks everything a person or a small business has to keep on top of: **subscriptions, licenses, warranties, insurance, IDs, vehicles, property, finances and documents**, with renewal reminders and an AI assistant.

App name: **NCHRG** · Landing page: [handlah-landing-web.vercel.app](https://handlah-landing-web.vercel.app)

> Built for Platinum North Systems. Keys, signing credentials and internal infrastructure have been removed from this public copy. Bring your own `.env` and Firebase config to run it.

---

## Features

| Area | What it does |
|---|---|
| **Subscriptions & licenses** | Track recurring subscriptions, software and business licenses, renewal dates and costs |
| **Reminders & calendar** | Custom schedules (every X days, monthly, yearly), push notifications, calendar sync |
| **Identity Hub** | Driver's licenses, passports, certifications and other IDs |
| **Life modules** | Insurance, loans, banking, warranties, vehicles, real estate, personal property, pets, health tracker, utilities, legal, social accounts, bookmarks, wallet |
| **Business** | Business contacts, projects and licenses |
| **AI assistant** | Chat with voice input and text-to-speech, AI dashboard during onboarding |
| **Tools** | Daily brief, life events, "Money Finder" (finds subscriptions to cancel) |
| **Sharing** | Connections, shared access and emergency contacts |
| **Paywall** | In-app subscriptions with RevenueCat |
| **20 languages** | Full i18n, including right-to-left (Arabic, Hebrew, Urdu) |

## Engineering highlights

- **Security:** tokens stored in the iOS Keychain / Android Keystore, biometric unlock (Face ID / fingerprint), MFA, jailbreak/root detection, HTTPS-only networking (no cleartext on either platform)
- **Offline-first:** a request queue and sync engine (`src/services/offline`) replays changes when the device comes back online
- **Auth:** email + OTP, Google Sign-In, Apple Sign-In, token refresh interceptor
- **State:** Redux Toolkit with redux-persist
- **Monitoring:** Firebase Crashlytics and Cloud Messaging
- **New Architecture:** React Native 0.83 bridgeless mode, with `patch-package` fixes for native modules that didn't support it (see [Patched modules](#patched-modules))

## Tech stack

React Native 0.83.1 · React 19 · TypeScript · Redux Toolkit · React Navigation 7 · Reanimated 4 · Formik + Yup · i18next · Firebase · RevenueCat · Axios

Android: Gradle 9, compile/target SDK 36, min SDK 24 · iOS: CocoaPods, Swift `AppDelegate`

## Project structure

```
src/
├── app/            # Screens: auth, onboarding, home modules, tools, AI assistant, calendar…
├── components/     # Shared UI and modals
├── config/         # API client (Axios + auth interceptors), env, constants
├── hooks/
├── localization/   # 20 language files
├── navigation/
├── redux/          # Slices and persisted store
├── services/       # Notifications, offline sync, purchases, secure storage, calendar
├── types/
└── utils/
```

---

## Getting started

### Prerequisites

- Node.js 20+, Yarn
- Android Studio with SDK 36
- Xcode and CocoaPods (for iOS)

### 1. Install

```bash
yarn install
```

`postinstall` runs `patch-package` automatically.

### 2. Configure

```bash
cp .env.example .env
```

Fill in your API URLs, Google OAuth client IDs and RevenueCat keys.

Add your own Firebase config files (templates are included):

| Platform | Copy | To |
|---|---|---|
| Android | `android/app/google-services.example.json` | `android/app/google-services.json` |
| iOS | `ios/GoogleService-Info.example.plist` | `ios/GoogleService-Info.plist` |

For iOS, also replace `YOUR_IOS_CLIENT_ID` in `ios/Handlah/Info.plist` and set your team under *Signing & Capabilities* in Xcode.

For Android release builds, put `MYAPP_UPLOAD_STORE_FILE`, `MYAPP_UPLOAD_KEY_ALIAS`, `MYAPP_UPLOAD_STORE_PASSWORD` and `MYAPP_UPLOAD_KEY_PASSWORD` in `~/.gradle/gradle.properties`.

### 3. Run

```bash
yarn start      # Metro bundler
yarn android    # Android
yarn ios        # iOS (run `cd ios && pod install` first)
yarn test       # Jest
```

---

## Patched modules

Two native modules don't support React Native 0.83's New Architecture (bridgeless mode) or Gradle 9 out of the box. The patches live in `patches/` and are applied on every `yarn install`.

### `react-native-tts` 4.1.1

Gradle 9 removed `jcenter()`, so the build failed with `Could not find method jcenter()`. The patch moves the module to `google()` + `mavenCentral()`, Android Gradle Plugin 7.4.2 and SDK 36 (min 24).

### `@react-native-voice/voice` 3.2.4

Voice recognition failed on Android with `Cannot read property 'startSpeech' of null`. In bridgeless mode React Native no longer strips the `RCT` prefix from module names, so `getName()` now returns `"Voice"` instead of `"RCTVoice"`. The patch also moves the module to AndroidX and SDK 36.

To regenerate a patch after editing `node_modules`:

```bash
npx patch-package react-native-tts --use-yarn
npx patch-package @react-native-voice/voice --use-yarn
```
