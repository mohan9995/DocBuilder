# DocBuilder ⚡
> Fast, In-House, 100% Private Document Editor, Signer & File Converter for Web, iOS (App Store), and Android (Google Play Store).

**DocBuilder** is a cross-platform, client-side document studio and file converter. Built with modern WebAssembly, Canvas, and Capacitor, all operations run **100% on-device** — files never leave your memory, guaranteeing zero server bandwidth costs, instant offline capability, and seamless App Store & Google Play privacy compliance.

---

## 🌟 Key Capabilities

### 1. ✍️ Document & PDF Studio
- **Click-to-Type Text Annotations**: Click anywhere on a document page to insert dates, invoice text, notes, and form data.
- **Digital Signature Pad**: Draw with finger/mouse in Navy or Black ink and stamp onto agreements.
- **Watermark Engine**: Apply "CONFIDENTIAL", "APPROVED", "DRAFT", or custom text watermarks.
- **Page Management**: Rotate pages by $90^\circ$, delete unwanted pages, or reorder.
- **Permanent On-Device Export**: Bakes annotations and signatures directly into a pristine PDF.

### 2. ⚡ Live Bento File Converter
- **Real-Time Split-Screen Comparison**: Interactive 60fps divider comparing Original vs. Converted quality live.
- **Quality & Weight Budgeting**: Fine-tune compression from 10% to 100% with instant file size predictions.
- **Format Matrix by Intent**:
  - *⚡ Web & Speed*: WEBP, AVIF
  - *🖨️ Universal & Print*: PNG, JPG, PDF
  - *📐 Vectors & Specialist*: SVG, ICO, BMP
- **Liquid Batch Queue**: Drop dozens of files at once, convert individually or batch-export as a ZIP archive.

---

## 🚀 Running Locally (Laptop / Desktop)

```bash
# Start local development server
npm run dev

# Build for production
npm run build
npm run preview
```

---

## 📱 Publishing to Mobile App Stores

### 🍎 Apple App Store (iOS)
```bash
npm run build
npx cap sync ios
npx cap open ios
```
Open in Xcode, choose your Developer Team under *Signing & Capabilities*, and click **Product > Archive**.

### 🤖 Google Play Store (Android)
```bash
npm run build
npx cap sync android
npx cap open android
```
Open in Android Studio, go to **Build > Generate Signed Bundle / APK**, and upload the `.aab` to Google Play Console.

---

## 🌐 Custom Subdomain Hosting (`fileconvertor.mysalesforce.in`)

Host for **$0.00 (Completely Free)** using GitHub Pages, Cloudflare Pages, or Vercel:
1. Build the static bundle (`npm run build`).
2. Add a `CNAME` record in your DNS manager for `mysalesforce.in`:
   - **Host / Name**: `fileconvertor`
   - **Points to**: `cname.vercel-dns.com` (or `<username>.github.io`)
3. Connect your repository — your custom subdomain will be live with free automatic SSL (HTTPS)!
