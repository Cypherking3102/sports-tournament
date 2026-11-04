# SportSphere — Multi-Sport Tournament & Bracket Management Platform

A responsive, modern full-stack web application for organizing, scheduling, and managing sports tournaments with automated bracket generation, round-robin standings tables, dynamic official rulebooks, and an admin scorekeeper.

---

## ⚡ Features

- **Multi-Sport Support**: Football ⚽, Basketball 🏀, Cricket 🏏, Volleyball 🏐, Tennis 🎾, Esports 🎮, Badminton 🏸, or any custom sport.
- **Automated Tournament Engine**:
  - **Single Elimination / Direct Knockout**: Visual interactive tree brackets with balanced seeding ($2^n$), automatic byes, and winner auto-advancement to next-round slots.
  - **Round Robin / League Format**: Automatic schedule generator (circle method) with live auto-calculated standings (Played, Won, Drawn, Lost, Points, Score For, Score Against, Goal Difference).
- **Interactive Rulebook**:
  - Categorized tournament rules (Gameplay, Overtime & Tie-Breakers, Rosters & Subs, Conduct).
  - Searchable by keywords.
  - Custom rule creation from the Admin panel.
- **Admin Scorekeeper & Live Updates**:
  - Mobile-first quick score buttons (`+` and `-`).
  - Match status toggle: `SCHEDULED`, `LIVE NOW`, and `COMPLETED`.
  - Automatic progression of winners into championship matches.
  - Protected with an Admin Passkey (`admin123`).
- **Mobile-First Design**: Optimized for smartphones with horizontal swipe brackets, touch-friendly score controls, and responsive dark athletic UI.

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build for production**:
   ```bash
   npm run build
   ```

3. **Start the production server**:
   ```bash
   npm run start
   ```
   Open [http://localhost:3000](http://localhost:3000) on your device.

4. **Development mode**:
   ```bash
   npm run dev
   ```

---

## 🔐 Admin Passkey

- **Default Passkey**: `admin123`
- To customize, set the environment variable:
  ```env
  ADMIN_PASSKEY=your_secret_passkey
  ```

---

## 🌐 Deploying Online (Free Live URL for Phone)

### Option 1: Deploy with Vercel (Recommended)
Next.js deploys in 1 click to Vercel:
```bash
npx vercel
```
Or push to a GitHub repository and import into [Vercel](https://vercel.com).

### Option 2: Expose via Cloudflare Tunnel
To view instantly on your phone from this instance:
```bash
npx cloudflared tunnel --url http://localhost:3000
```
This gives you an instant, secure public `trycloudflare.com` URL.
