# TripLite

TripLite is a travel-planning web app for organizing trips, itineraries, checklists, and expenses.

## Features

- Account registration and login
- Trip management and trip details
- Itinerary planning
- Travel checklist
- Budget and expense tracking
- Destination management
- MongoDB-backed saved data

## Tech stack

- React, TypeScript, Vite, and Tailwind CSS
- Express API
- MongoDB with Mongoose
- JWT-based authentication
- pnpm for dependency management

## Project structure

```text
TripLite/
├── client/                 # Frontend application
│   ├── components/         # Shared app components and UI primitives
│   ├── hooks/              # Reusable React hooks
│   ├── lib/                # API client and utilities
│   ├── pages/              # Route-level pages
│   ├── App.tsx             # Frontend routes and providers
│   └── global.css          # Global styles
├── server/                 # Express backend
│   ├── routes/             # Authentication and trip APIs
│   ├── auth.ts             # Authentication middleware/helpers
│   ├── db.ts               # MongoDB connection
│   ├── models.ts           # Database models
│   └── index.ts            # API setup
├── public/                 # Static assets
├── netlify/                # Netlify serverless API adapter
├── .env.example            # Environment variable template
├── package.json            # Scripts and dependencies
├── pnpm-lock.yaml          # Locked dependency versions
├── vite.config.ts          # Frontend and development server config
└── vite.config.server.ts   # Production server build config
```

## Requirements

- Node.js 22
- pnpm 10
- MongoDB running locally or a MongoDB connection string

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and set your local values:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/triplite
   JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
   CORS_ORIGINS=http://localhost:8080
   ```

   Use a strong, unique JWT secret outside local development. Never commit `.env`.

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open the local URL printed by Vite (the project is configured for port 8080).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the frontend and backend |
| `pnpm build:client` | Build the frontend only |
| `pnpm build:server` | Build the backend only |
| `pnpm start` | Start the production server |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run tests |

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `CORS_ORIGINS` | Comma-separated list of allowed browser origins |

## Deployment

Deployment configuration is retained for the providers currently present in the repository. Keep only the configuration for the provider you actually use when the deployment target is finalized.
