# Weather Map

## Live Demo

https://weather-map-jahid.vercel.app

Click anywhere on the map to get real-time weather.

## Features

- 🗺️ Interactive map (Leaflet + OpenStreetMap)
- ☀️ Real-time weather from OpenWeatherMap
- 💾 Save favorites with MongoDB + Prisma
- 🐳 Docker support
- ✅ Vitest unit tests

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | Next.js, TypeScript, Tailwind CSS, Leaflet |
| Backend | Next.js API routes, MongoDB, Prisma |
| Testing | Vitest, React Testing Library |
| DevOps | Docker, GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (or use Docker)

### Installation

```bash
# Clone the repo
git clone https://github.com/jahidmainuddinahmed176176/weather-map.git
cd weather-map

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OpenWeatherMap API key

# Run database (if using Docker)
docker-compose up -d

# Run the app
npm run dev



