# GoldAxis Maps

Interactive map application for discovering businesses that accept the GoldAxis token. Built with a premium dark UI, real-time geolocation, route tracing, and a secure multi-user admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)

## Features

### Map & Navigation
- **Dark premium map** powered by CARTO Dark tiles (no Google API required)
- **Real-time geolocation** with Safari iOS compatibility and fallback strategies
- **Route tracing** between user location and any commerce via OSRM (free routing API)
- **Distance calculation** using the Haversine formula, sorted by proximity
- **Custom markers** with gold-themed styling matching the GoldAxis brand

### Commerce Discovery
- **Expandable commerce list** sorted by distance from user
- **Detail cards** with logo, category, description, address, and distance
- **One-tap navigation** with route distance and estimated travel time
- **Google Maps fallback** for users who decline location sharing

### Admin Dashboard
- **Multi-user authentication** with email/password stored in MongoDB (bcrypt-hashed)
- **Two-Factor Authentication (2FA)** per user via TOTP (Google Authenticator / Authy)
- **Full CRUD** for commerce management (create, read, update, delete)
- **Address autocomplete** via Nominatim geocoding (Colombia & Argentina)
- **Icon selector** with 9 business category icons
- **Stats dashboard** with commerce counts by category
- **Rate limiting** on login (5 attempts / 15 minutes per IP)

### Security
- JWT sessions with `httpOnly` cookies (8-hour expiration)
- Mandatory 2FA verification for all admin access
- Protected API routes (GET public, POST/PUT/DELETE require auth + 2FA)
- QR-based TOTP setup on first login per user
- Middleware-enforced route protection on `/admin/*`

### Privacy
- Custom location permission dialog explaining data usage before browser prompt
- Location data stays local on the device, never stored server-side

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Maps | [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/) |
| Tiles | [CARTO Dark](https://carto.com/basemaps/) (no API key needed) |
| Routing | [OSRM](http://project-osrm.org/) (free, open-source) |
| Geocoding | [Nominatim](https://nominatim.openstreetmap.org/) (OpenStreetMap) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Auth | [jose](https://github.com/panva/jose) (JWT) + [otpauth](https://github.com/nicolo-ribaudo/otpauth) (TOTP) |
| Password Hashing | [bcryptjs](https://github.com/nicolo-ribaudo/bcryptjs) |
| QR Codes | [qrcode](https://github.com/soldair/node-qrcode) |
| UI | React 19, mobile-first responsive design |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- npm

### Installation

```bash
git clone https://github.com/sebasIeth/goldaxies-maps.git
cd goldaxies-maps
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Auth
JWT_SECRET=your-secret-key-change-in-production

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/goldaxis
```

### Seed Admin Users

Start the dev server, then call the seed endpoint once:

```bash
npm run dev
curl -X POST http://localhost:3000/api/seed-admins
```

This creates the initial admin users in MongoDB. Each user sets up their own 2FA on first login.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the map and [http://localhost:3000/login](http://localhost:3000/login) for the admin panel.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main map page
│   ├── login/page.tsx              # Login + 2FA setup/verify
│   ├── admin/page.tsx              # Admin dashboard (CRUD)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # Email/password auth + rate limiting
│   │   │   ├── logout/route.ts     # Session cleanup
│   │   │   ├── setup-2fa/route.ts  # TOTP QR generation + first code verify
│   │   │   └── verify-2fa/route.ts # Subsequent 2FA code verification
│   │   ├── commerces/route.ts      # Full CRUD (GET public, mutations protected)
│   │   └── seed-admins/route.ts    # One-time admin user seeding
│   └── globals.css                 # Dark theme + animations
├── components/
│   ├── MapView.tsx                 # Main map with markers, routing, geolocation
│   ├── CommerceList.tsx            # Expandable nearby commerce list
│   ├── CommerceCard.tsx            # Commerce detail card with navigation
│   ├── LocationPermission.tsx      # Privacy-first location dialog
│   └── AddressSearch.tsx           # Nominatim geocoding autocomplete
├── lib/
│   ├── auth/
│   │   ├── jwt.ts                  # JWT creation/verification, cookie management
│   │   ├── totp.ts                 # TOTP generation and verification
│   │   └── protect.ts             # Route protection helper
│   ├── mongodb.ts                  # MongoDB connection with singleton pooling
│   ├── geo.ts                      # Haversine distance + formatting
│   └── routing.ts                  # OSRM route fetching
├── types/
│   └── commerce.ts                 # Commerce TypeScript interface
└── middleware.ts                   # Auth guard for /admin/* routes
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/commerces` | Public | List all commerces |
| `POST` | `/api/commerces` | Admin + 2FA | Create a new commerce |
| `PUT` | `/api/commerces` | Admin + 2FA | Update an existing commerce |
| `DELETE` | `/api/commerces?id=` | Admin + 2FA | Delete a commerce |
| `POST` | `/api/auth/login` | Public | Authenticate with email/password |
| `POST` | `/api/auth/logout` | Public | Clear session |
| `POST` | `/api/auth/setup-2fa` | Session | Generate TOTP QR code |
| `PUT` | `/api/auth/setup-2fa` | Session | Verify first TOTP code |
| `POST` | `/api/auth/verify-2fa` | Session | Verify TOTP code on login |
| `POST` | `/api/seed-admins` | Public (one-time) | Seed admin users |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables (`JWT_SECRET`, `MONGODB_URI`)
4. Deploy
5. Call `POST /api/seed-admins` once to create admin users

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Set Network Access to `0.0.0.0/0` (allow from anywhere) for Vercel compatibility
3. Create a database user and use the connection string in `MONGODB_URI`

## License

Private project - All rights reserved.
