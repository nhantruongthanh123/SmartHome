# SmartHome — Technical Documentation

> **Project:** DADN - Nhom 17 v1.0  
> **Stack:** Next.js 16 · React 19 · TypeScript · Prisma · MariaDB · MQTT · TailwindCSS v4  
> **Purpose:** A full-stack IoT smart home management dashboard with real-time sensor monitoring and remote device control.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Data Flow & Logic](#4-data-flow--logic)
5. [Authentication System](#5-authentication-system)
6. [MQTT Real-time Layer](#6-mqtt-real-time-layer)
7. [Database Layer](#7-database-layer)
8. [API Routes](#8-api-routes)
9. [Pages](#9-pages)
10. [Components](#10-components)
11. [Theming System](#11-theming-system)
12. [File Dependency Map](#12-file-dependency-map)
13. [Environment Variables](#13-environment-variables)

---

## 1. Architecture Overview

```
Browser (Client)
│
├── MQTT WebSocket ───────────────── Adafruit IO Cloud (IoT Sensors/Actuators)
│      ↕ real-time pub/sub
│
├── Next.js App (Frontend + Backend)
│      ├── /app/(app)/...          → Protected pages (Dashboard, Devices, Profile)
│      ├── /app/(auth)/...         → Public pages (Login, Register)
│      ├── /app/api/auth/...       → NextAuth.js handlers
│      └── /app/api/user/...       → Custom REST API endpoints
│
└── Prisma ORM ───────────────────── MariaDB (Aiven Cloud)
                                     (Users, Sessions, Accounts)
```

The application follows a **hybrid client/server rendering** model:
- **Auth, API, and DB operations** → Server Components / Route Handlers
- **Real-time sensor state and device toggle** → Client Components via MQTT WebSocket hook
- **Theme, Session** → Globally provided via `ThemeProvider` and `SessionProvider` in the root layout

---

## 2. Technology Stack

| Layer | Technology | Version | Role |
|---|---|---|---|
| Framework | Next.js | 16.2.1 | App router, SSR, API routes |
| UI Library | React | 19.2.4 | Component rendering |
| Language | TypeScript | ^5 | Type safety |
| Styling | Tailwind CSS | ^4 | Utility-first CSS |
| Database ORM | Prisma | ^7.6.0 | Type-safe DB access |
| Database Driver | `@prisma/adapter-mariadb` | ^7.6.0 | MariaDB connection |
| Authentication | NextAuth.js | ^5.0.0-beta.30 | Session, JWT, OAuth |
| Password Hashing | bcryptjs | ^3.0.3 | Secure password storage |
| IoT Communication | mqtt | ^5.15.0 | MQTT WebSocket client |
| Charts | recharts | ^3.8.1 | Real-time line charts |
| Icons | lucide-react | ^0.577.0 | UI icons |
| Toast Notifications | sonner | ^2.0.7 | User feedback toasts |
| Theme Management | next-themes | ^0.4.6 | Light/dark mode switching |
| Image Hosting | ImgBB API | (external) | User avatar storage |

---

## 3. Project Structure

```
smart-home/
│
├── app/                            # Next.js App Router root
│   ├── layout.tsx                  # ROOT LAYOUT — wraps EVERYTHING
│   ├── page.tsx                    # Root redirect (→ /dashboard)
│   ├── globals.css                 # Global CSS variables & utility classes
│   │
│   ├── (app)/                      # Route group: PROTECTED pages
│   │   ├── layout.tsx              # App shell (Sidebar + Topbar wrapper)
│   │   ├── dashboard/page.tsx      # Dashboard page (sensor cards + charts)
│   │   ├── devices/page.tsx        # Device management page
│   │   └── profile/page.tsx        # User profile page
│   │
│   ├── (auth)/                     # Route group: PUBLIC pages (no shell)
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   │
│   └── api/                        # Backend API Route Handlers
│       ├── auth/
│       │   ├── [...nextauth]/route.ts   # NextAuth catch-all handler
│       │   └── register/route.ts        # POST /api/auth/register
│       └── user/
│           └── profile/route.ts         # GET + PUT /api/user/profile
│
├── components/                     # Reusable React components
│   ├── layout/
│   │   ├── Sidebar.tsx             # Left navigation sidebar
│   │   └── Topbar.tsx              # Top bar with search, theme toggle, user dropdown
│   ├── dashboard/
│   │   ├── StatCard.tsx            # Sensor value card (temperature, humidity, light)
│   │   └── SensorChart.tsx         # Line chart for sensor history
│   ├── devices/
│   │   └── DeviceCard.tsx          # Individual device toggle card
│   ├── auth/
│   │   ├── LoginForm.tsx           # Email/password + Google login form
│   │   └── RegisterForm.tsx        # New user registration form
│   └── toggle/
│       └── ThemeToggle.tsx         # Light/dark mode toggle button
│
├── src/                            # Business logic, hooks, config
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth configuration (providers, JWT strategy)
│   │   └── prisma.ts               # Singleton Prisma client instance
│   ├── hooks/
│   │   └── useSensorMQTT.ts        # Core real-time MQTT hook
│   ├── config/
│   │   └── mqtt.ts                 # MQTT broker config & feed names
│   └── services/                   # (Empty — reserved for future service layer)
│
├── prisma/
│   └── schema.prisma               # DB schema: User, Account, Session, VerificationToken
│
└── .env                            # Environment variables (not committed)
```

---

## 4. Data Flow & Logic

### Login Flow
```
User → LoginForm.tsx
     → signIn("credentials", {email, password})    [next-auth/react]
     → src/lib/auth.ts → authorize()
         → prisma.user.findUnique(email)
         → bcrypt.compare(password, hash)
     → JWT session created
     → redirect to /dashboard
```

### Real-time Sensor Flow (MQTT)
```
IoT Sensor (BBC Micro:bit / ESP32)
    → publishes to Adafruit IO topic: "username/feeds/bbc-temp"

useSensorMQTT.ts (browser hook)
    → mqtt.connect(MQTT_CONFIG.host, { username, password: apiKey })
    → subscribe to ["bbc-temp", "bbc-humidity", "bbc-light"]
    → on('message') → setTemperature / setHumidity / setLight
    → append to history array (max 20 points)

DashboardPage
    → reads { temperature, humidity, light, tempHistory, ... }
    → renders StatCard (current value) + SensorChart (history)
    → Auto Mode: if temperature > 30 → toggleDevice("fan", "ON")
```

### Device Control Flow
```
User clicks toggle on DeviceCard
    → DeviceCard.onToggle(isOn) → DevicePage calls toggleDevice("led", "ON")
    → useSensorMQTT.toggleDevice()
    → mqttClient.publish("username/feeds/bbc-led", "1")
    → Adafruit IO relays to physical hardware
```

### Profile Update Flow
```
User selects image → FileReader → previewImage (base64 DataURL)
User clicks "Save" → handleSaveProfile()
    → FormData { name, image (File) }
    → PUT /api/user/profile
        → auth() validates session
        → fetch ImgBB API to upload image → returns URL
        → prisma.user.update({ name, image: imgbbUrl })
    → update local state → toast.success()
```

---

## 5. Authentication System

### Files Involved
| File | Role |
|---|---|
| `src/lib/auth.ts` | Core NextAuth config: providers, JWT strategy, `authorize()` |
| `src/lib/prisma.ts` | Prisma client singleton passed to `PrismaAdapter` |
| `app/api/auth/[...nextauth]/route.ts` | Exports NextAuth handlers for GET/POST |
| `app/api/auth/register/route.ts` | Custom `POST` endpoint for new user creation |
| `components/auth/LoginForm.tsx` | Client-side form calling `signIn()` |
| `components/auth/RegisterForm.tsx` | Client-side form POSTing to `/api/auth/register` |
| `app/layout.tsx` | Wraps everything with `<SessionProvider>` |
| `components/layout/Topbar.tsx` | Reads `useSession()`, calls `signOut()` |
| `app/(app)/profile/page.tsx` | Calls `signOut()` on Sign Out button |

### Strategy
- **Session type:** `jwt` (required when using Credentials provider)
- **JWT max age:** 1 day
- **Providers:** Google OAuth (via `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`) + Email/Password Credentials
- **Account linking:** Google accounts auto-link with existing email accounts
- **Password storage:** bcrypt hash (10 rounds), stored in `password_hash` column
- **Custom signin page:** redirected to `/login` instead of NextAuth default

### Security Notes
- The `GET /api/user/profile` route uses `auth()` from NextAuth server-side to verify session before returning user data — passwords are explicitly excluded from the `select` clause
- Passwords are **never** returned by any API endpoint

---

## 6. MQTT Real-time Layer

### Files Involved
| File | Role |
|---|---|
| `src/config/mqtt.ts` | MQTT broker URL, credentials keys, feed name mapping |
| `src/hooks/useSensorMQTT.ts` | Core hook: connection, subscriptions, state, device publish |
| `app/(app)/dashboard/page.tsx` | Consumer: reads sensor data + history for display |
| `app/(app)/devices/page.tsx` | Consumer: calls `toggleDevice()` |

### Feed Mapping (`src/config/mqtt.ts`)
```
bbc-temp      → Temperature sensor
bbc-humidity  → Humidity sensor
bbc-light     → Light sensor (Lux)
bbc-led       → LED / Smart Lighting actuator
bbc-fan       → Cooling Fan actuator
```
> **Note:** A `pump` feed is referenced in `devices/page.tsx` for the Smart Pump, but it is not yet explicitly mapped in `mqtt.ts`. The hook falls back to using the key directly as the feed name.

### Hook: `useSensorMQTT()`
**Returns:**
- `temperature`, `humidity`, `light` — latest sensor readings (number)
- `tempHistory`, `humiHistory`, `lightHistory` — rolling arrays of `ChartDataPoint[]` (max 20 points each)
- `isConnected` — boolean MQTT connection status
- `toggleDevice(feedKey, 'ON' | 'OFF')` — publishes `"1"` or `"0"` to the mapped feed topic

**Lifecycle:**
- Connects on mount (`useEffect([], [])`), cleans up on unmount (removes listeners, calls `end(true)`)
- Reconnects automatically every 3 seconds if disconnected
- Uses `clientRef` (a `useRef`) to persist the MQTT client across renders without triggering re-renders

---

## 7. Database Layer

### Files Involved
| File | Role |
|---|---|
| `prisma/schema.prisma` | DB model definitions |
| `src/lib/prisma.ts` | Singleton Prisma client with MariaDB adapter |

### Schema Models

```prisma
User {
  id            String   (CUID, primary key)
  name          String?
  email         String   (unique)
  emailVerified DateTime?
  image         String?  (avatar URL, stored on ImgBB)
  password      String?  (bcrypt hash — null for OAuth users)
  createdAt     DateTime
  updatedAt     DateTime
  accounts      Account[]
  sessions      Session[]
}

Account {              // OAuth provider links (e.g. Google)
  userId, provider, providerAccountId, tokens...
}

Session {              // DB sessions (used by PrismaAdapter)
  sessionToken, userId, expires
}

VerificationToken {    // Email verification tokens
  identifier, token, expires
}
```

### Connection Strategy
`src/lib/prisma.ts` uses the **"global singleton"** pattern to prevent creating multiple Prisma client instances during Next.js hot-module reloading in development. In production, a fresh instance is created once.

```typescript
const globalForPrisma = globalThis as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 8. API Routes

### `POST /api/auth/register`
**File:** `app/api/auth/register/route.ts`  
**Auth required:** No  
**Logic:**
1. Read `{ email, username, password }` from request body
2. Check all fields are present (400 if not)
3. Check if email already exists in DB (409 if duplicate)
4. `bcrypt.hash(password, 10)` → save hashed password
5. `prisma.user.create({ email, name: username, password: hash })`
6. Return 201 on success

### `GET /api/user/profile`
**File:** `app/api/user/profile/route.ts`  
**Auth required:** Yes (JWT session)  
**Logic:**
1. `auth()` → get session, extract email
2. `prisma.user.findUnique({ where: { email }, select: { id, name, email, image, createdAt, updatedAt } })`
3. Return user data (200), 401 if unauthenticated, 404 if not found

### `PUT /api/user/profile`
**File:** `app/api/user/profile/route.ts`  
**Auth required:** Yes (JWT session)  
**Logic:**
1. `auth()` → validate session
2. Parse `FormData`: extract `name` string and optional `image` File
3. If image provided: upload to **ImgBB API** (`IMGBB_API_KEY`), get back public URL
4. `prisma.user.update({ data: { name, image: imgbbUrl } })`
5. Return updated user (200)

### `GET/POST /api/auth/[...nextauth]`
**File:** `app/api/auth/[...nextauth]/route.ts`  
**Role:** NextAuth catch-all — handles login, logout, OAuth callbacks, CSRF, session checks

---

## 9. Pages

### Root (`app/page.tsx`)
Minimal redirects to `/dashboard`.

### Root Layout (`app/layout.tsx`)
Wraps the entire app:
- `<SessionProvider>` — makes `useSession()` available to all client components
- `<ThemeProvider attribute="class" defaultTheme="light">` — manages light/dark mode by toggling the `dark` class on `<html>`
- Imports `globals.css`

### App Layout (`app/(app)/layout.tsx`)
Renders the **protected shell** for authenticated users:
```
<div class="app-layout-shell flex h-screen">
  <Sidebar />            ← fixed left navigation
  <div flex-col>
    <Topbar />           ← fixed top bar
    <main>
      {children}         ← page content
    </main>
  </div>
</div>
```
> **No auth guard in layout:** Route protection should be handled via middleware (`middleware.ts`) — recommended to add for production security.

### `/dashboard` (`app/(app)/dashboard/page.tsx`)
- **"use client"** — requires MQTT WebSocket
- Calls `useSensorMQTT()` for all real-time data
- **Auto Mode Logic:** `useEffect` watches `temperature` and `light`; automatically publishes fan/led commands when thresholds are crossed
- Fires `toast.error()` when temperature > 35°C
- Renders: header with MQTT status indicator, 3× `StatCard`, 2× `SensorChart`

### `/devices` (`app/(app)/devices/page.tsx`)
- **"use client"**
- Calls `useSensorMQTT()` for `toggleDevice` and `isConnected`
- Contains an inline `BrightnessSlider` component (local state only, doesn't publish to MQTT yet)
- 3× `DeviceCard` for Lighting (LED), Fan, and Pump

### `/profile` (`app/(app)/profile/page.tsx`)
- **"use client"**
- On mount: fetches `GET /api/user/profile` to populate `userData` state
- **Avatar flow:** `FileReader` for local preview → `PUT /api/user/profile` (FormData) → ImgBB URL stored in DB
- Edit mode: toggled by "Edit Profile" button; updates name only until saved
- Sign-out: calls `signOut({ callbackUrl: "/login" })`

### `/login` (`app/(auth)/login/page.tsx`)
- Renders `<LoginForm />` inside an auth panel layout

### `/register` (`app/(auth)/register/page.tsx`)
- Renders `<RegisterForm />` inside an auth panel layout

---

## 10. Components

### `components/layout/Sidebar.tsx`
**Role:** Left navigation panel  
**Logic:**
- `"use client"` — uses `usePathname()` to detect active route
- Renders `MenuItem` sub-component with `active` prop to apply `.menu-item.active` CSS class
- Links: `/dashboard`, `/devices`, `/profile`
- Quick Actions (Add Device, Notifications, Settings) are static — no routing yet

**Related to:** `globals.css` (`.sidebar-shell`, `.menu-item`, `.sidebar-footer-card`, etc.)

---

### `components/layout/Topbar.tsx`
**Role:** Top navigation bar with search, theme toggle, and user dropdown  
**Logic:**
- `"use client"` — uses `useSession()`, `useState`, `useRef`
- Reads session via `useSession()` to display user name and avatar
- Manages `isOpen` dropdown state; listens for `mousedown` outside to auto-close
- Avatar: shows `user.image` (OAuth photo) or first letter of name as fallback
- Dropdown options: My Profile (`/profile`), Settings (`/settings`), Sign Out (`signOut()`)
- Includes `<ThemeToggle />` component

**Related to:** `src/lib/auth.ts` (session), `components/toggle/ThemeToggle.tsx`

---

### `components/dashboard/StatCard.tsx`
**Role:** Individual sensor reading card  
**Props:** `label`, `value`, `unit`, `icon`, `trend?`, `color?`  
**Logic:** Maps `color` prop to Tailwind classes (supports blue, orange, red, yellow) with dark mode variants  
**Related to:** `app/(app)/dashboard/page.tsx`

---

### `components/dashboard/SensorChart.tsx`
**Role:** Line chart showing last 20 sensor readings  
**Props:** `data: ChartDataPoint[]`, `title`, `color?`  
**Logic:** Uses `recharts` `LineChart`. All chart colors (`stroke`, `fill`, tooltip background) reference CSS variables (`var(--border)`, `var(--card)`, `var(--muted)`) for theme compatibility  
**Related to:** `app/(app)/dashboard/page.tsx`, `src/hooks/useSensorMQTT.ts` (data source)

---

### `components/devices/DeviceCard.tsx`
**Role:** Toggleable device card with icon, status, and slot for extra controls  
**Props:** `name`, `icon`, `onToggle?`, `disabled?`, `defaultOn?`, `children?`  
**Logic:**
- Manages `active` state internally; syncs with `defaultOn` prop via `useEffect`
- `children` slot: used to render `BrightnessSlider` or other controls  
**Related to:** `app/(app)/devices/page.tsx`

---

### `components/auth/LoginForm.tsx`
**Role:** Email/password and Google OAuth login form  
**Logic:**
- `signIn("credentials", { email, password, redirect: false })` → checks `result.error`
- `signIn("google", { redirect: true, callbackUrl: "/dashboard" })` for OAuth  
**Related to:** `src/lib/auth.ts` (provider config), `app/(auth)/login/page.tsx`

---

### `components/auth/RegisterForm.tsx`
**Role:** New account registration form  
**Logic:**
- Client-side validation (required fields, password length, password match)
- `POST /api/auth/register` with `{ email, username, password }`
- On success: display success message, redirect to `/login` after 1.5s  
**Related to:** `app/api/auth/register/route.ts`

---

### `components/toggle/ThemeToggle.tsx`
**Role:** Light/dark mode toggle button  
**Logic:**
- `useTheme()` from `next-themes` — reads `theme`, calls `setTheme()`
- Uses `mounted` state to delay render until client-side to prevent hydration mismatch
- Renders Moon icon (light mode) / Sun icon (dark mode)  
**Related to:** `app/layout.tsx` (`<ThemeProvider>`), `app/globals.css` (`.dark` variables)

---

## 11. Theming System

### File: `app/globals.css`

The theming system uses **CSS Custom Properties (variables)** defined on `:root` (light) and `.dark` (dark), toggled by `next-themes` adding/removing the `dark` class on `<html>`.

### Key Variables

| Variable | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--bg` | `#f4f6fb` | `#0f172a` | Page background |
| `--bg-soft` | `#f8fafc` | `#0b1220` | Content area background |
| `--card` | `#ffffff` | `#1e293b` | Card/panel background |
| `--card-hover` | `#fcfdfe` | `#212e45` | Card hover state |
| `--text` | `#0f172a` | `#f8fafc` | Primary text |
| `--muted` | `#64748b` | `#94a3b8` | Secondary/muted text |
| `--border` | `#dbe2ee` | `#334155` | Borders & dividers |
| `--primary` | `#2563eb` | `#2563eb` | Brand blue |
| `--primary-soft` | `#dbeafe` | `#1e3a8a` | Icon/badge backgrounds |
| `--heading` | `#1e293b` | `#e2e8f0` | Heading text |
| `--control-bg` | `#f8fafc` | `#1f2a3d` | Input/control backgrounds |
| `--shadow-soft` | light shadow | dark shadow | Card elevation |

### Global Utility Classes

| Class | Purpose |
|---|---|
| `.bg-main` | Page wrapper background (uses `--bg-soft`) |
| `.card-surface` | Standard card: background, border, shadow, hover transition |
| `.card-title` | Theme-aware heading text |
| `.card-muted` | Theme-aware muted/secondary text |
| `.input-field` | Styled form input (background, border, focus ring) |
| `.icon-box` | Icon container with `--primary-soft` background |
| `.device-track-on/off` | MQTT device toggle track colors |
| `.device-status-on` | Blue status text when device is active |
| `.auth-*` | Auth page specific classes (panel, input, alert, etc.) |
| `.topbar-*` | Topbar specific classes |
| `.sidebar-*` | Sidebar specific classes |
| `.menu-item` | Sidebar nav item with active state |

### Tailwind `@theme` Integration

Custom color tokens are mapped into Tailwind's theme so `bg-card`, `border-border`, etc. resolve to the correct CSS variable:

```css
@theme {
  --color-card: var(--card);
  --color-border: var(--border);
  --color-muted: var(--muted);
  /* ... */
}
```

---

## 12. File Dependency Map

```
app/layout.tsx
  └── imports globals.css
  └── wraps with SessionProvider  (next-auth/react)
  └── wraps with ThemeProvider    (next-themes)

app/(app)/layout.tsx
  ├── components/layout/Sidebar.tsx
  │     └── uses usePathname()    (next/navigation)
  └── components/layout/Topbar.tsx
        ├── uses useSession()     (next-auth/react)
        ├── uses signOut()        (next-auth/react)
        └── components/toggle/ThemeToggle.tsx
              └── uses useTheme() (next-themes)

app/(app)/dashboard/page.tsx
  ├── src/hooks/useSensorMQTT.ts
  │     └── src/config/mqtt.ts
  ├── components/dashboard/StatCard.tsx
  └── components/dashboard/SensorChart.tsx

app/(app)/devices/page.tsx
  ├── src/hooks/useSensorMQTT.ts
  └── components/devices/DeviceCard.tsx

app/(app)/profile/page.tsx
  ├── fetch() → /api/user/profile (GET, PUT)
  └── signOut() (next-auth/react)

app/api/auth/register/route.ts
  ├── src/lib/prisma.ts
  └── bcryptjs

app/api/user/profile/route.ts
  ├── src/lib/auth.ts   (auth() server-side session)
  ├── src/lib/prisma.ts
  └── ImgBB API (external HTTP call)

src/lib/auth.ts
  ├── src/lib/prisma.ts  (PrismaAdapter)
  └── bcryptjs

src/lib/prisma.ts
  └── @prisma/adapter-mariadb + DATABASE_URL env var

components/auth/LoginForm.tsx
  └── signIn() (next-auth/react)

components/auth/RegisterForm.tsx
  └── fetch() → /api/auth/register (POST)
```

---

## 13. Environment Variables

| Variable | Used In | Description |
|---|---|---|
| `DATABASE_URL` | `src/lib/prisma.ts` | MariaDB connection string (Aiven) |
| `AUTH_SECRET` | NextAuth | JWT/session signing secret |
| `AUTH_GOOGLE_ID` | `src/lib/auth.ts` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | `src/lib/auth.ts` | Google OAuth Client Secret |
| `IMGBB_API_KEY` | `app/api/user/profile/route.ts` | ImgBB image hosting API key |
| `NEXT_PUBLIC_ADAFRUIT_HOST` | `src/config/mqtt.ts` | MQTT broker WebSocket URL |
| `NEXT_PUBLIC_ADAFRUIT_USERNAME` | `src/config/mqtt.ts` | Adafruit IO username |
| `NEXT_PUBLIC_ADAFRUIT_AIO_KEY` | `src/config/mqtt.ts` | Adafruit IO API/AIO key |

> **Note:** Variables prefixed `NEXT_PUBLIC_` are exposed to the browser — safe for public broker credentials. Server-only secrets (`DATABASE_URL`, `AUTH_SECRET`, `IMGBB_API_KEY`) must never have this prefix.

---

## Known Limitations & Future Work

- **No middleware route guard:** `app/(app)` routes are not protected by `middleware.ts`. An unauthenticated user could browse directly to `/dashboard` if the server-side session check is bypassed.
- **Brightness slider is UI-only:** The `BrightnessSlider` in `devices/page.tsx` changes local state but does not publish any MQTT message.
- **Smart Pump feed not mapped:** The `pump` feed key in `devices/page.tsx` isn't in `mqtt.ts`; it falls back to publishing to `"username/feeds/pump"` directly.
- **Settings page missing:** The Settings link in the sidebar and Topbar dropdown points to `/settings`, which is not yet implemented.
- **Quick Actions are static:** "Add Device" and "Notifications" in the sidebar have no functionality.
- **History not persisted:** `tempHistory`, `humiHistory`, `lightHistory` are in-memory only; a page refresh clears all chart history.
