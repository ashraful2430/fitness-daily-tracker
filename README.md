# Planify Life Frontend

Planify Life is a personal productivity and finance dashboard built with Next.js. It connects to the Planify Life backend and gives one place to manage money, lending, learning, fitness, habits, focus sessions, reports, settings, and account access.

The app is designed for personal use: compact, fast, friendly, and a little savage without being harsh. Backend messages are preserved in the UI so successful actions and errors keep the same playful tone across the product.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [Backend Integration](#backend-integration)
- [API Response Handling](#api-response-handling)
- [Authentication](#authentication)
- [Performance Notes](#performance-notes)
- [Accessibility and UX](#accessibility-and-ux)
- [Quality Checks](#quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Features

- Personal dashboard with summary metrics and recent activity.
- Money management for expenses, income, savings, and loans.
- Lending workflows for people you lend to or borrow from.
- Learning dashboard for tracking study sessions and progress.
- Fitness, habits, focus, reports, categories, settings, and admin screens.
- Authentication flow with local app session handling.
- Backend-powered success and error messages with friendly product copy.
- Paginated list handling and client-side caching for read-heavy screens.
- Responsive dashboard UI for desktop and mobile.

## Tech Stack

| Area           | Technology               |
| -------------- | ------------------------ |
| Framework      | Next.js 16               |
| UI             | React 19                 |
| Styling        | Tailwind CSS 4           |
| Animation      | Framer Motion            |
| Icons          | Lucide React             |
| Charts         | Recharts                 |
| Notifications  | React Hot Toast          |
| Language       | TypeScript               |
| Auth utilities | JSON Web Token, bcryptjs |
| Data proxy     | Next.js route handlers   |

## Project Structure

```text
.
+-- app/                  # Next.js app router routes and layouts
|   +-- (app)/            # Authenticated application pages
|   +-- api/              # Frontend API/proxy route handlers
|   +-- auth/             # Login and registration pages
|   +-- page.tsx          # Public entry page
+-- components/           # Feature and shared UI components
+-- hooks/                # Data and state hooks used by dashboard modules
+-- lib/                  # API client, auth helpers, proxy, database helpers
+-- types/                # Shared TypeScript types
+-- public/               # Static assets
+-- package.json          # Scripts and dependencies
```

## Getting Started

### Prerequisites

- Node.js 20 or newer recommended.
- npm.
- A running Planify Life backend, or access to the deployed backend URL.

### Install Dependencies

```bash
npm install
```

### Run Locally With a Local Backend

The default development command points the proxy to a backend running on port `5000`.

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

### Run Against the Deployed Backend

```bash
npm run prod
```

This starts the Next.js development server while pointing `EXTERNAL_API_URL` to the deployed backend configured in `package.json`.

## Environment Variables

Create a `.env.local` file when you need to override defaults.

```env
EXTERNAL_API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/planify-life
JWT_SECRET=replace-with-a-strong-secret
```

| Variable               | Required                                | Purpose                                                      |
| ---------------------- | --------------------------------------- | ------------------------------------------------------------ |
| `EXTERNAL_API_URL`     | Recommended                             | Backend base URL used by the Next.js proxy routes.           |
| `NEXT_PUBLIC_API_URL`  | Optional                                | Public API base URL for direct client requests when enabled. |
| `NEXT_PUBLIC_SITE_URL` | Optional                                | Site URL used by public app metadata or redirects.           |
| `MONGODB_URI`          | Required for local auth/database routes | MongoDB connection string.                                   |
| `JWT_SECRET`           | Required for auth                       | Secret used to sign and verify app tokens.                   |

## Available Scripts

```bash
npm run dev
```

Starts the app in development mode with `EXTERNAL_API_URL=http://localhost:5000`.

```bash
npm run prod
```

Starts the app in development mode against the deployed backend URL.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production build.

```bash
npm run lint
```

Runs the Next.js lint command.

```bash
npm run typecheck
```

Runs TypeScript without emitting files.

## Application Routes

| Route            | Purpose                                                    |
| ---------------- | ---------------------------------------------------------- |
| `/`              | Public entry page.                                         |
| `/auth/login`    | User login.                                                |
| `/auth/register` | User registration.                                         |
| `/dashboard`     | Main personal dashboard.                                   |
| `/money`         | Expenses, income, savings, loans, and financial summaries. |
| `/lending`       | Lending and borrowed-money workflows.                      |
| `/learning`      | Learning sessions and study progress.                      |
| `/fitness`       | Fitness tracking.                                          |
| `/habits`        | Habit tracking.                                            |
| `/focus`         | Focus and productivity sessions.                           |
| `/reports`       | Reports and analytics.                                     |
| `/categories`    | Category management.                                       |
| `/settings`      | User and app settings.                                     |
| `/admin`         | Admin area.                                                |

## Backend Integration

The frontend expects API responses in this shape:

```ts
type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: unknown;
};
```

The app uses `lib/api.ts` for client request helpers and `lib/proxy.ts` for proxying requests through Next.js route handlers. This keeps backend URLs configurable and lets the frontend keep a stable internal API surface while the backend can run locally or remotely.

## API Response Handling

- Show `message` from the backend whenever it exists.
- Use short, calm success toasts for successful mutations.
- Show backend validation errors near the related field when field-level data is available.
- Use a toast or inline page alert for general errors.
- Only fall back to generic copy when a network request fails before a backend response is received.
- Keep optional note-style fields valid when they are missing, blank, `null`, or `undefined`.

Important backend behaviors reflected in the UI:

- Expense `note` is optional.
- Income and savings `note` is optional.
- Loan `reason` is optional. When omitted, the backend stores `No reason provided.`.
- Lending note and reason-style fields are optional.
- Learning session `notes` may be missing, `null`, or blank.

## Authentication

The app includes login and registration screens under `/auth`. Auth utilities live in `lib/auth.ts`, and app API routes can use cookies and JWT helpers for session-aware behavior.

For production, use a strong `JWT_SECRET` and serve the app over HTTPS so secure cookie behavior works as expected.

## Performance Notes

- Use backend pagination values instead of loading large collections at once.
- Debounce filters and search inputs before sending requests.
- Cache dashboard and list requests briefly on the client.
- Revalidate the affected data after mutations instead of refetching every page.
- Keep dashboard pages dense but readable so common workflows stay fast.

## Accessibility and UX

- Interface language should stay compact, friendly, and useful.
- Backend messages can be witty, but UI copy should never feel insulting or guilt-heavy.
- Destructive actions should be confirmed with lightweight dialogs.
- Empty states should include one clear next action.
- Buttons, forms, navigation, and modal flows should remain keyboard accessible.
- Icons should use `lucide-react` where possible.

## Quality Checks

Before shipping meaningful changes, run:

```bash
npm run typecheck
npm run lint
npm run build
```

For UI-heavy changes, also verify the main app routes manually in desktop and mobile viewport sizes.

## Deployment

The app can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or a Node.js server.

Production checklist:

- Set `EXTERNAL_API_URL` to the production backend URL.
- Set `NEXT_PUBLIC_SITE_URL` to the deployed frontend URL.
- Set `MONGODB_URI` if local frontend API routes need database access.
- Set a strong `JWT_SECRET`.
- Run `npm run build` successfully before deployment.

## Troubleshooting

### API Requests Fail Locally

Check that the backend is running and that `EXTERNAL_API_URL` points to the correct backend origin.

```env
EXTERNAL_API_URL=http://localhost:5000
```

### Auth Does Not Persist

Confirm `JWT_SECRET` is set and that browser cookies are not blocked. In production, make sure the app is served over HTTPS.

### Build Fails on Types

Run:

```bash
npm run typecheck
```

Fix the first TypeScript error reported, then run the command again.

### Deployed App Still Calls Localhost

Check deployment environment variables. `EXTERNAL_API_URL` must be set in the hosting provider, not only in `.env.local`.

## License

This is a private personal productivity project. Add a license before distributing or publishing it publicly.
