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
- Authentication flow backed by the external API through frontend proxy routes.
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
+-- lib/                  # API clients and proxy helpers
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

Create `.env.local` with the local backend URL:

```env
EXTERNAL_API_URL=http://127.0.0.1:5000
```

Then start the frontend:

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

This starts the Next.js development server while pointing `EXTERNAL_API_URL` to the EC2 backend URL configured in `package.json`.

## Environment Variables

Frontend environment files should only contain frontend-safe values. The backend owns MongoDB, JWT, auth cookies, and protected API logic.

```env
EXTERNAL_API_URL=http://127.0.0.1:5000
```

| Variable           | Required | Purpose                                            |
| ------------------ | -------- | -------------------------------------------------- |
| `EXTERNAL_API_URL` | Yes      | Backend base URL used by frontend API proxy routes. |

## Available Scripts

```bash
npm run dev
```

Starts the app in development mode. Local proxy routes use `EXTERNAL_API_URL` from `.env.local`.

```bash
npm run prod
```

Starts the app in development mode against the EC2 backend URL from the script.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production build on `0.0.0.0:3000`.

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

The app includes login and registration screens under `/auth`. Browser code calls relative frontend API routes such as `/api/auth/login`, `/api/auth/me`, and `/api/auth/logout`.

The backend owns MongoDB, JWT signing, auth cookies, and protected API logic. Frontend API routes forward browser cookies to the backend and forward backend `Set-Cookie` headers back to the browser.

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

EC2 checklist:

- Keep `.env.production` or the server environment set to `EXTERNAL_API_URL=http://127.0.0.1:5000` when frontend and backend run on the same EC2 server.
- Run `git pull origin master`.
- Run `npm ci`.
- Run `npm run build`.
- Run `npm start`.

## Troubleshooting

### API Requests Fail Locally

Check that the backend is running and that `EXTERNAL_API_URL` points to the correct backend origin.

```env
EXTERNAL_API_URL=http://127.0.0.1:5000
```

### Auth Does Not Persist

Confirm the backend login/register endpoints set the `token` httpOnly cookie and that the frontend proxy forwards `Set-Cookie`. Browser requests should use relative `/api/*` URLs with `credentials: "include"`.

### Build Fails on Types

Run:

```bash
npm run typecheck
```

Fix the first TypeScript error reported, then run the command again.

### Deployed App Still Calls Localhost

Check the EC2 frontend environment. When frontend and backend are on the same server, `EXTERNAL_API_URL` should be `http://127.0.0.1:5000`.

## License

This is a private personal productivity project. Add a license before distributing or publishing it publicly.
