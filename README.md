# OmniConvert ⚡
> Fast, In-House, 100% Private File & Document Converter for Web, iOS (App Store), and Android (Google Play Store).

OmniConvert is a cross-platform file converter designed to run **on-device (client-side)** using modern Web APIs, WebAssembly, Canvas, and Capacitor. Files **never leave the user's device**, guaranteeing zero cloud hosting bills, instant offline conversions, and 100% privacy compliance.

---

## 🌟 Key Features

- **100% On-Device Processing**: No remote server uploads. Instant conversion at local CPU/GPU hardware speed.
- **Cross-Platform**:
  - **Laptop / Desktop**: Modern responsive web application (PWA ready).
  - **iOS**: Ready for Xcode & Apple App Store.
  - **Android**: Ready for Android Studio & Google Play Store.
- **Supported Formats**:
  - **Images**: PNG, JPG/JPEG, WebP, AVIF, GIF, BMP, ICO, SVG, HEIC / HEIF (Apple iPhone photos).
  - **PDF Tools**:
    - Convert Images to PDF (with Page Size options: Auto Fit, A4, US Letter, Orientation, Margins).
    - Convert Multi-Page PDFs into high-resolution images (PNG, JPG, WebP).
    - Merge multiple PDFs into a single document with drag/reorder support.
    - Split and extract specific page ranges from any PDF.
- **Batch Processing**: Convert dozens of files simultaneously and download individually or packaged in a single ZIP.
- **Customizable Output Options**: Fine-tune quality sliders (10%–100%), resize dimensions (maintain aspect ratio), background fill for transparency, and DPI resolution.
- **Native Mobile Integration**: Native iOS/Android file saving and native Share Sheet integration via `@capacitor/share` and `@capacitor/filesystem`.

---

## 🚀 Getting Started (Laptop / Web)

### 1. Development Mode
To run locally on your laptop:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Production Web Build
```bash
npm run build
npm run preview
```
The optimized static bundle is output to `dist/`. You can deploy this folder directly to any static host (Vercel, Netlify, Cloudflare Pages, AWS S3, or GitHub Pages).

---

## 📱 Publishing to Mobile App Stores

OmniConvert is configured with **Capacitor 6**, which automatically wraps the web app into native iOS (Xcode) and Android (Android Studio) projects.

### 🍎 Deploying to Apple App Store (iOS)

1. Build the production web bundle and copy to iOS:
   ```bash
   npm run build
   npx cap sync ios
   ```
2. Open the native project in Xcode:
   ```bash
   npx cap open ios
   ```
3. In Xcode:
   - Go to **Signing & Capabilities** and select your **Apple Developer Team**.
   - Ensure the Bundle Identifier matches your App Store Connect record (e.g., `com.omniconvert.app`).
   - App permissions (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSPhotoLibraryAddUsageDescription`) are already configured in `ios/App/App/Info.plist`.
   - Select **Product > Destination > Any iOS Device (arm64)**.
   - Click **Product > Archive** and submit directly to TestFlight and the App Store!

> **App Store Privacy Advantage**: Because conversions run 100% client-side, you can declare **"Data Not Collected"** in your App Store Connect Privacy Nutrition Labels.

---

### 🤖 Deploying to Google Play Store (Android)

1. Build the production web bundle and copy to Android:
   ```bash
   npm run build
   npx cap sync android
   ```
2. Open the native project in Android Studio:
   ```bash
   npx cap open android
   ```
3. In Android Studio:
   - Verify Gradle syncs successfully.
   - Go to **Build > Generate Signed Bundle / APK**.
   - Select **Android App Bundle (.aab)**.
   - Choose or create your Release Keystore.
   - Click **Create**.
   - Upload the generated `.aab` file to the Google Play Console under Production or Open Testing.

> **Google Play Data Safety**: In the Google Play Console Data Safety questionnaire, declare **"No user data is collected or shared with third parties"**, resulting in rapid store approval.

---

## 🏗️ Project Architecture

```
File Convertor/
├── android/               # Native Android project (Android Studio / Gradle)
├── ios/                   # Native iOS project (Xcode / Swift)
├── public/                # Static assets (logo, icons)
├── src/
│   ├── components/        # React UI components
│   │   ├── ConversionToolbar.tsx # Batch controls & target selectors
│   │   ├── FileDropzone.tsx      # Drag-and-drop, file picker, camera, Cmd+V paste
│   │   ├── FileList.tsx          # File item cards, conversion status, progress, download
│   │   ├── Header.tsx            # Brand bar, dark mode, store guide button
│   │   ├── OptionsModal.tsx      # Image quality, dimensions, PDF page sizes & DPI
│   │   ├── PdfStudioTab.tsx      # Multi-PDF merge studio & page extractor
│   │   └── PlatformGuideModal.tsx# In-app deployment instructions
│   ├── services/          # Core conversion logic
│   │   ├── conversionEngine.ts   # Dispatcher & format detection
│   │   ├── imageConverter.ts     # Canvas/WASM/heic2any image conversions
│   │   ├── pdfConverter.ts       # pdf-lib & pdfjs-dist engines
│   │   ├── nativeShare.ts        # Capacitor native file/share bridge
│   │   └── zipService.ts         # JSZip batch archiver
│   ├── types/             # TypeScript definitions
│   ├── App.tsx            # Root application state & layout
│   ├── index.css          # Tailwind CSS & safe-area styling
│   └── main.tsx           # React entry point
├── capacitor.config.ts    # Cross-platform Capacitor settings
├── tailwind.config.js     # Styling configuration
└── vite.config.ts         # Vite build & chunk splitting configuration
```

---

## 🔒 Privacy & Security

- **Zero Network Transmission**: User files never travel over the network.
- **Sandbox Execution**: Everything runs inside browser and webview memory sandboxes.
- **Enterprise-Ready**: Suitable for sensitive documents, personal IDs, financial files, and confidential photographs.
