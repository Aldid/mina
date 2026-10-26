# Mina — AI Facial Skin Diagnostics & Personalized Skincare Protocol

> **Inspired by in-store beauty-tech diagnostic kiosks across Vietnam (Minh Hà) and Asian cosmetic retail.**  
> Built for the **AMD x Lablab.ai AI Academy Challenge (AMD AI League)**.

---

## Overview

**Mina** is an intelligent, in-browser facial skin diagnostic kiosk that analyzes skin biometrics in real time—via webcam or uploaded selfie—and delivers a personalized, evidence-based dermatological skincare protocol.

In modern cosmetic stores across Asia (such as Vietnam's *Minh Hà Cosmetics* or Korea's *Olive Young*), shoppers step in front of high-resolution digital kiosks to scan their skin, uncover hidden barrier damage, and receive immediate product regimens. **Mina** brings this kiosk experience directly into any web browser with **zero cloud image uploads**, **zero tracking**, and **100% ephemeral in-memory processing**.

---

## Key Features

### 1. Interactive Biometric Facial Scanner
- **Live Kiosk Camera:** Real-time user-facing video with biometric face oval guidance, animated scanning sweep lines, and localized target tracking.
- **Upload Mode:** High-resolution portrait analysis for uploaded JPG, PNG, and WebP files.
- **1-Click Asian Climate Presets:** 4 pre-calibrated reference profiles (e.g., *Saigon Urban Combination*, *Reactive Cica Barrier*, *Oily Blemish-Prone*, *Radiant Glass Skin*) for instant testing.

### 2. 6 Core Skin Biomarkers
- **Hydration Level (0–100%):** Deep cellular moisture content and trans-epidermal water loss.
- **Sebum & Shine Control (0–100%):** Sebaceous gland balance across the T-zone and cheeks.
- **Barrier Resilience (0–100%):** Stratum corneum lipid glue (ceramide/cholesterol) integrity.
- **Pore Clarity & Texture (0–100%):** Follicular visibility, micro-congestion, and keratin buildup.
- **Capillary Calmness (0–100%):** Vascular flushing, erythema, and sensitivity markers.
- **Eye Contour Restfulness (0–100%):** Orbital micro-circulation and screen fatigue.

### 3. 5-Zone Localized Face Map
- Detailed regional breakdown for **Forehead**, **T-Zone**, **Cheeks**, **Under-Eye**, and **Chin**.
- Localized observation + dermatologist-grade action recommendation for each zone.

### 4. Dermatological AM & PM Skincare Regimens
- **Morning (AM) Protection:** Step-by-step routine focusing on barrier hydration, antioxidant defense, and non-negotiable broad-spectrum SPF 50+ UV shielding.
- **Evening (PM) Restoration:** Double-cleansing protocol, targeted cellular turnover actives (Retinol, BHA, Peptides), and overnight occlusive recovery.
- **Ingredient Matchmaker:**
  - *Actives to Seek:* Clinical benefits of Centella Asiatica, Niacinamide, Madecassoside, Zinc PCA, and Ceramides.
  - *Ingredients to Avoid:* Explaining contraindications for harsh alcohols, synthetic fragrances, and comedogenic oils.
- **Weekly Rituals & Environmental Advice:** Tailored mask schedules, humidity levels, and hydration targets.
- **Copy & Print Prescription:** One-click copy or formatted printout for physical beauty consultation.

### 5. Privacy-First & AMD Hardware Ready
- **100% Ephemeral In-Memory Vision:** Video frames and uploaded images are processed entirely in RAM and immediately discarded. No photos or biometric data are ever written to disk or sent to external servers.
- **AMD Ryzen AI & ROCm Optimized:** Pure client-side matrix computations calibrated for client NPUs and AMD cloud infrastructure.

---

## Technology Stack

- **Framework:** Next.js 14+ (App Router) & React 18
- **Language:** TypeScript 5.x (Strict typing for all biometric models, zones, and protocols)
- **Styling:** Tailwind CSS (warm luxury aesthetic, custom beauty-tech palette)
- **Icons:** Lucide React
- **Celebration & UX:** Canvas Confetti

---

## Quickstart & Local Installation

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Aldid/mina.git
cd mina

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Running Tests
```bash
npm test
```
*Validates the clinical skincare protocol generator, active ingredient contraindications, and preset metric boundaries.*

---

## Architecture

```
mina/
├── src/
│   ├── app/
│   │   ├── globals.css          # Beauty-tech scanning animations & styles
│   │   ├── layout.tsx           # Luxury font styling & meta configuration
│   │   └── page.tsx             # Main stage orchestration (Scan -> Diagnostics -> Protocol)
│   ├── components/
│   │   ├── Header.tsx           # Kiosk status, RAM privacy indicator & session reset
│   │   ├── ScannerView.tsx      # Live webcam scanner, upload dropzone & 1-click presets
│   │   ├── DiagnosticDashboard.tsx # Health ring, 6 biomarkers & 5-zone face map
│   │   └── ProtocolView.tsx     # AM/PM routines, ingredient matchmaker & export
│   ├── lib/
│   │   └── skinEngine.ts        # Dermatological scoring engine & curated presets
│   └── types/
│       └── index.ts             # Strict TypeScript models for biometrics & routines
├── tests/
│   └── testSkinEngine.ts        # Unit test suite verifying clinical protocols
├── tailwind.config.js           # Custom luxury palette (Mina, Petal, Sage)
└── tsconfig.json                # Strict TypeScript configuration
```

---

## License

MIT License. Designed with care for the **AMD x Lablab.ai AI Academy Challenge 2026**.
