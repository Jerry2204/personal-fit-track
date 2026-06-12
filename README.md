# FitTrack Pro

A fullstack personal fitness tracking application for gym workouts, running activities, body progress, and daily habits.

Built as a portfolio project to demonstrate fullstack development skills with modern tooling.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (coming soon) |

## Prerequisites

- Node.js 18+
- pnpm 9+
- Docker & Docker Compose (for PostgreSQL)

## Getting Started

```bash
# Clone and enter the project
git clone <repo-url> && cd fittrack-pro

# Create environment file
cp .env.example .env

# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up -d

# Run backend (development)
pnpm dev:backend

# Run frontend (development)
pnpm dev:frontend
```

The backend API runs at `http://localhost:3000` and the frontend at `http://localhost:3001`.

### Docker PostgreSQL

The `docker-compose.yml` starts a PostgreSQL 18 Alpine container with:

| Setting | Value |
|---------|-------|
| Database | `fittrack_pro` |
| User | `fittrack_dev` |
| Password | `fittrack_dev_password` |
| Port | `5432` |
| Volume | `postgres_data` (persistent) |

To stop the database:

```bash
docker compose down
```

To reset all data:

```bash
docker compose down -v
```

## Project Structure

```
/
├── backend/         # NestJS API server
│   ├── src/         # Application source
│   └── test/        # E2E tests
├── frontend/        # Next.js web app
│   └── src/         # Application source
├── docs/
│   └── PROJECT_BRIEF.md
├── docker-compose.yml
├── .env.example
├── AGENTS.md
├── PROGRESS.md
├── pnpm-workspace.yaml
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:backend` | Start NestJS in watch mode |
| `pnpm dev:frontend` | Start Next.js dev server |
| `pnpm build:backend` | Build NestJS |
| `pnpm build:frontend` | Build Next.js |
| `pnpm build` | Build both projects |
| `pnpm lint` | Lint both projects |
| `pnpm test` | Run backend tests |

## Features (WIP)

- [ ] Gym workout tracking
- [ ] Running activity tracking
- [ ] Body progress tracking
- [ ] Daily habit tracking
- [ ] Goals
- [ ] Calendar view
- [ ] Dashboard analytics
- [ ] Monthly and yearly reports
- [ ] Personal records
- [ ] Shoe mileage tracking
- [ ] Gamification

See `docs/PROJECT_BRIEF.md` for full requirements.
