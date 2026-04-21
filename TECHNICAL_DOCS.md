# SmartHome — Technical Documentation

> **Project:** DADN - Nhom 17 v1.0  
> **Stack:** Next.js 16 · React 19 · TypeScript · Prisma · MariaDB · MQTT · TailwindCSS v4  
> **Purpose:** A full-stack IoT smart home management dashboard with real-time sensor monitoring, remote device control, and global notification context.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Data Flow & Logic](#4-data-flow--logic)
5. [Authentication System](#5-authentication-system)
6. [MQTT & Global Context Layer](#6-mqtt--global-context-layer)
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
│      ↕ Managed globally via <SmartHomeProvider>
│
├── Next.js App (Frontend + Backend)
│      ├── /app/(app)/...          → Protected pages (Dashboard, Devices, Profile, Notifications, Settings)
│      ├── /app/(auth)/...         → Public pages (Login, Register)
│      ├── /app/api/auth/...       → NextAuth.js handlers
│      └── /app/api/user/...       → Custom REST API endpoints (Profile, Password)
│
└── Prisma ORM ───────────────────── MariaDB (Aiven Cloud)
                                     (Users, Sessions, Accounts)
```

The application follows a **hybrid client/server rendering** model:
- **Auth, API, and DB operations** → Server Components / Route Handlers
- **Real-time sensor state, Notifications, and UI state** → Client Components via Global Context Provider (`SmartHomeContext`)
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
| Time Formatting | date-fns | ^4 | Timestamp formatting |
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
│   │   ├── layout.tsx              # App shell (SmartHomeProvider, Sidebar + Topbar)
│   │   ├── dashboard/page.tsx      # Dashboard page (sensor cards + charts + door logs)
│   │   ├── devices/page.tsx        # Device management & automation thresholds
│   │   ├── profile/page.tsx        # User profile configuration
│   │   ├── notifications/page.tsx  # Central Notification Inbox
│   │   └── settings/page.tsx       # Theme settings and password management
│   │
│   ├── (auth)/                     # Route group: PUBLIC pages (no shell)
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   │
│   └── api/                        # Backend API Route Handlers
│       ├── auth/
│       │   └── [...nextauth]       # NextAuth logic
│       └── user/
│           ├── profile/            # Profile endpoints
│           └── password/           # Password update logic
│
├── components/                     # Reusable React components
│   ├── layout/ ...
│   ├── dashboard/ ...
│   ├── devices/ ...
│   ├── auth/ ...
│   └── toggle/ ...
│
├── src/                            # Business logic, hooks, config
│   ├── contexts/
│   │   └── SmartHomeContext.tsx    # Global state (MQTT + UI + Notifications)
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth configuration
│   │   └── prisma.ts               # Singleton Prisma client instance
│   ├── hooks/
│   │   └── useSensorMQTT.ts        # Core real-time MQTT hook
│   └── config/...
│
├── prisma/
│   └── schema.prisma               # DB schema: User, Account, Threshold, DoorLog
│
└── .env                            # Environment variables (not committed)
```

---

## 4. Data Flow & Logic

### Real-time Sensor Flow & Notifications (SmartHomeContext)
```text
IoT Sensor → Publishes to Adafruit IO
   ↓
useSensorMQTT.ts (Core Hook) → Grabs data via WebSockets
   ↓
SmartHomeContext (Provider in app/(app)/layout.tsx)
   ├─ Distributes { temperature, humidity, doorStatus, ... } globally
   ├─ Runs logic: If Temp > 30°C → Generates `CRITICAL` Notification
   └─ Runs logic: If Fan > 3hrs → Generates `WARNING` Notification
         ↓
Dashboard, Devices, Topbar (bell badge), Sidebar (collapse state)
```

### Password Update Flow
```text
User enters Current + New Password in /settings
    → POST /api/user/password
        → auth() validates session
        → bcrypt.compare(Old Password) vs DB
        → bcrypt.hash(New Password)
        → prisma.user.update(...)
    → returns success → Sonner shows Toast
```

---

## 5. Authentication System

**Files Involved**: `src/lib/auth.ts`, `app/api/auth/...`, `components/auth/...`
- **Session type:** `jwt`
- **Providers:** Google OAuth + Email/Password Credentials.
- **Account linking:** Google accounts auto-link with existing email accounts via Prisma adapter handling.
- **Security:** Modifying passwords checks `bcrypt.compare`. OAuth accounts cannot have their password changed since they don't have one manually stored in Prisma.

---

## 6. MQTT & Global Context Layer

### `SmartHomeContext.tsx`
Since the application layout transitions from page to page frequently, MQTT state is hoisted explicitly into `SmartHomeContext`.

**Responsibilities:**
- Maintains a constant WebSockets connection while navigating the layout.
- Provides `isSidebarOpen` to collapse the Navigation Sidebar gracefully.
- Stores `notifications: AppNotification[]` array in volatile state.
- Emits throttled notifications: `Welcome Back`, `High Temperature Alert` (Wait 1 Hour To Re-Trigger), `Fan Left ON` (Wait 1 Hour).

### Map `useSensorMQTT.ts`
Subscribes to standard Adafruit IO HTTP calls for static chart initialization, then streams live updates into arrays to feed `recharts`. Contains automatic feedback loops internally for Motion detection opening smart doors.

---

## 7. Database Layer

**Prisma Schema details (`prisma/schema.prisma`):**
- **User**: Core identities table (+ Image hosting provided via ImgBB).
- **Threshold**: Stores custom automation settings for User environment (e.g. Turn Fan On when Temp > x).
- **DoorLog**: Tracks historical entry accesses.

Singleton connected effectively via `globalThis` to prevent connection exhaustion.

---

## 8. API Routes

- `POST /api/auth/register`: Create user + hash password.
- `GET/PUT /api/user/profile`: Serve and replace standard User Data (ImgBB for pictures).
- `POST /api/user/password`: Change secure passwords actively.

---

## 9. Pages

- **`/dashboard`**: Consumes `SmartHomeContext`. Shows 4 metric cards (`StatCard.tsx`), dual-line historical Charts, dynamic Auto Mode switches, and an entry Door Log history block.
- **`/devices`**: Lists smart appliances as interactive blocks. Holds `ThresholdSettings` configurations letting users stipulate automated limits natively.
- **`/profile`**: Showcases raw account IDs, Avatar configuration modules (cancel/save), and an external routing anchor to system Settings.
- **`/notifications`**: Visual Inbox of system `Alerts`, categorizes by severity standard, utilizing `date-fns` for time deltas. Marks messages uniformly parsed.
- **`/settings`**: A two tab layout managing Appearance (`next-themes`) & Security Password Management via `credentials`.

---

## 10. Components

- **`Sidebar.tsx`**: Dynamic width context mapping via `isSidebarOpen`. Shrinks seamlessly leaving only icon arrays visible upon top menu hamburger tap.
- **`Topbar.tsx`**: Features `next-themes` Toggle, User contextual dropdown, Hamburger Menu hook integration, and Live Notification Red Badge syncing direct from `unreadCount` Context calculations.
- **`DeviceCard.tsx` / `ThresholdSettings`**: Encapsulates toggle properties & boundary variable injections dynamically into the DB per module.

---

## 11. Theming System

### System Integration
Uses `next-themes` appending `<html class="dark">` securely with fallback logic.
Variables mapped exclusively in `:root` vs `.dark` in `app/globals.css`.

| Variable | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--bg` | `#f4f6fb` | `#0f172a` | Page background |
| `--card` | `#ffffff` | `#1e293b` | Card/panel background |
| `--muted` | `#64748b` | `#94a3b8` | Secondary/muted text |
| `--border` | `#dbe2ee` | `#334155` | Borders & dividers |
| `--primary` | `#2563eb` | `#2563eb` | Brand blue |

These variables seamlessly integrate into `Tailwind CSS 4.0` standard via `@theme` definitions, converting `--color-card` directly to utilities like `bg-card`.

---

## 12. File Dependency Map

```
app/layout.tsx
  └── wraps App with <SessionProvider> + <ThemeProvider>
app/(app)/layout.tsx
  └── wraps UI with <SmartHomeProvider> → Holds context + global API limits
       ├── Sidebar.tsx
       ├── Topbar.tsx
       └── {children} (Pages inside App Layout access hook `useSmartHome()`)
```

---

## 13. Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | MariaDB connection string (Aiven) |
| `AUTH_SECRET` | NextAuth signed JWT Key |
| `AUTH_GOOGLE_ID` / `SECRET` | OAuth Authentication Keys |
| `IMGBB_API_KEY` | Public Avatar Image Uploader Key |
| `NEXT_PUBLIC_ADAFRUIT_HOST` | Socket URL |
| `NEXT_PUBLIC_ADAFRUIT_USERNAME` | Web MQTT User |
| `NEXT_PUBLIC_ADAFRUIT_AIO_KEY` | Realtime API Key |

---

## Known Limitations & Future Work

- **No middleware route guard:** `app/(app)` routes can be rendered without sessions safely; but they will just crash or redirect lazily. Next.js `middleware.ts` should be inserted.
- **Stateless Client Notifications:** Notifications are stored within UI Volatile React Context. Upon manual F5 Refresh, logs currently clear and regenerate "Welcome Back". Implementing Database Notification arrays (`Notification` table) would make push histories highly robust.
