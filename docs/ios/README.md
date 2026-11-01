# Mina for iPhone

The primary delivery target is a separate iPhone app for App Store distribution. The existing Next.js/React product is shared with the web preview and packaged with Capacitor 8.6.0 into a local iOS app. This is a hybrid UIKit/WKWebView app, not a SwiftUI rewrite and not a Safari installation.

## App structure

- Today: calendar, main photo action, sensations and actual care completion.
- Photos: local capture/check/annotation, result, explicit archive and comparison.
- Care: independent AM/PM checklists, evening comfort and educational notes.
- Journal: calendar and weekly history; opening a record goes to its day.
- Settings: explicit diary saving, deletion confirmation, session reset and privacy.

Sections remain mounted while hidden, so navigation does not discard open photo state or a local save. The bottom bar respects the home indicator; headers and the full-screen scanner respect the notch/status area. System fonts are used, with no font CDN dependency.

## Native photo selection

`ios/App/App/MinaBridgeViewController.swift` registers the local `MinaPhoto` bridge. Gallery selection uses PHPicker with a one-image limit. It does not request full or limited library authorization, enumerate the library, write to Photos or upload an image. Only the chosen item's data is passed to Mina. The system may manage its own temporary files/caches, including retrieval of an iCloud-backed selected item.

Data is bounded to 30 MiB/60 MP before ImageIO downsamples to a maximum side of 960 px. Orientation is normalized and JPEG is re-encoded without EXIF/filename metadata. The bridge returns an in-memory data URL; Mina creates no intermediate native URI file. The camera uses the system camera, requests permission only after its explicit button, and does not save to Photos. Its hardware path requires testing on a real iPhone.

The initial generic camera plugin requested full library permission during QA. That request was denied, the dependency removed, and the PHPicker bridge replaced it. Do not reintroduce that plugin as a silent fallback.

`SceneDelegate` must instantiate `MinaBridgeViewController`, which registers the custom plugin. Changing only the storyboard is insufficient for this Capacitor template because its scene delegate constructs the controller in code.

## Observed Intel-simulator limitation

On the available Intel Mac with iOS 26.3 simulator, selecting the public test portrait and starting the WASM scanner terminated WebKit and reloaded the page. The crash report identifies `JavaScriptCore / Wasm::prepareSignalingMemory` with `EXC_BAD_ACCESS`; repeating with a verified ad-hoc signature reproduced the same symptom. This is not evidence that an actual ARM64 iPhone has passed or failed the scan.

The native bridge therefore marks **x86_64 simulator** captures as `manual-simulator`. That explicitly labelled test mode skips the known-crashing automatic path, permits manual annotation and exercises the photo journal without fabricating inference. ARM64 device builds retain the actual local model path, which must be tested on a physical iPhone before any release. Do not claim that simulator UI checks validate automatic skin analysis.

Apple's [photo selection documentation](https://developer.apple.com/documentation/photokit/selecting-photos-and-videos-in-ios) describes selected-item access without library permission. Capacitor's [custom iOS code guide](https://capacitorjs.com/docs/ios/custom-code) describes bridge registration.

## Build

Requirements: Node/npm, Xcode 26+, iOS simulator runtime. Deployment target: iOS 17+, iPhone only. No paid analysis API key is needed.

```bash
npm install
npm run build:ios
npm run check:ios
npm run ios:open
```

`build:ios` verifies/prepares local models, builds a static export in an isolated temporary directory and syncs it into Xcode. It excludes the retired server API, `.env` files and screenshot/test fixtures. Generated `dist-ios/` and `ios/App/App/public/` are ignored. The bundle has no development-server URL. Native app storage is separate from the web preview.

Project: `ios/App/App.xcodeproj`, scheme `App`. Local placeholder bundle ID: `app.mina.skincare`. Before signing for the owner's phone or App Store, select the owner's team and a bundle ID they control. No team, provisioning profile, account or credentials are stored by this change.

Simulator compile without signing:

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /private/tmp/mina-ios-derived CODE_SIGNING_ALLOWED=NO build
```

Unsigned device compile:

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -sdk iphoneos -destination 'generic/platform=iOS' -derivedDataPath /private/tmp/mina-ios-derived CODE_SIGNING_ALLOWED=NO build
```

An unsigned build is not an installable App Store submission. Signing, archive/upload, privacy/support URLs and final App Store Connect declarations must be reviewed by the owner. No purchase, Apple agreement, account login or submission has been performed. A simulator does not validate physical camera behaviour, mobile performance or skin-analysis accuracy.

## Model release limitation

The detector's uploader card says MIT while ONNX metadata says AGPL-3.0/Ultralytics. This remains unresolved. Native local packaging does not resolve permission to distribute it. Keep this as a local prototype until applicable rights/obligations are clarified; Mina's licence has not changed. The model remains an experimental source of editable suggestions, not a diagnostic/severity engine.

## Storage

Journal saving remains opt-in, and each photo requires its own save action. Images/geometry never enter the text diary. Native storage is sandboxed WebKit storage; saved data can be lost on app/site-data removal. System backups are managed by iOS and outside Mina's application-level controls. No cloud account or Mina server copy exists.

New prepared photos capture version-2 metadata: their original local addition day/timezone and completed/manual/unavailable analysis status. A completed run stores the local model ID/hash even with no retained boxes; failures and simulator/manual choices use bounded reason codes. Travel and confirmation across midnight cannot move the photo-review fact or result to another day. Old/unsupported metadata is never silently rewritten: the image/marks remain viewable, time is labelled UTC, status is unknown and no diary day is guessed. The existing IndexedDB name/version and explicit saving controls are retained.

## Verification on 1 November 2026

- All 57 existing behavior groups passed after the final UI changes. Static export (including types/lint), standalone-bundle checks and both Xcode builds passed: ad-hoc Debug simulator and unsigned Release iPhone. These checks do not validate model accuracy or App Store eligibility.
- In the isolated Intel iPhone simulator: all four tabs, AM/PM independence, truthful weekly partial completion, settings without automatic saving, selected-item PHPicker, explicit manual-simulator provenance, manual marking, confirmation, result-to-care navigation and retained state across tabs were exercised. A separately saved public test portrait survived app termination/relaunch and appeared in the photo archive.
- Long-page scrolling was exercised using hardware Page Down. Automated pointer swipes were inconclusive; touch behaviour, camera, automatic WASM analysis and performance still require a physical iPhone. The confirmed photo action is fixed above the home indicator on phone layouts.
- Native UI evidence: `/Users/user/Documents/ChatGPT/ai agents/mina-iphone-app-2026-11-01.png`. Final build logs: `/private/tmp/mina-ios-export-confirm.log`, `/private/tmp/mina-ios-confirm-simulator.log`, `/private/tmp/mina-ios-device-confirm.log`; test log: `/private/tmp/mina-ios-final-tests.log`.
