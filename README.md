# TripLite

TripLite is a travel-planning web app for organizing trips, itineraries, checklists, and expenses.

## Features

- Account registration and login
- Trip and itinerary management
- Travel checklists
- Budget and expense tracking
- Destination management
- MongoDB-backed saved data

## Tech stack

- React, TypeScript, Vite, and Tailwind CSS
- Express API
- MongoDB with Mongoose
- JWT authentication
- pnpm

## Project structure

```text
TripLite/
├── frontend/             # React pages, components, styles and API client
├── backend/              # Express server, auth, database and API routes
├── netlify/              # Netlify serverless API adapter
├── public/               # Static assets
├── .env.example          # Environment variable template
├── package.json          # Scripts and dependencies
├── pnpm-lock.yaml        # Locked dependency versions
├── index.html            # Frontend HTML entry
├── vite.config.ts        # Frontend/dev server configuration
├── vite.config.server.ts # Backend production build
├── tailwind.config.ts    # Styling configuration
└── tsconfig.json         # TypeScript configuration
```

## Setup

Requirements: Node.js 22, pnpm 10, and MongoDB.

1. Install dependencies: `pnpm install`
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGINS`.
3. Start the app: `pnpm dev`
4. Build: `pnpm build`

Never commit your local `.env` file or real credentials.
