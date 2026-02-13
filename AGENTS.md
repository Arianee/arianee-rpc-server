# AGENTS.md

<!--
  This file is the AI entry point for this repository.
  Keep it up to date — agents rely on it to understand the project.
  See: https://github.com/Arianee/arianee-knowledge-base/blob/main/templates/AGENTS-GUIDELINES.md
-->

## Overview

The Arianee RPC Server provides RPC endpoints for the Arianee protocol. It acts as a gateway for clients to interact with the Arianee blockchain and associated services.

<!-- TODO: needs human input — more specific description of what RPCs are exposed -->

## Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Framework | Fastify |
| Database | MongoDB (MikroORM) |
| Runtime | Node.js 22+ |
| Package manager | npm |
| Observability | OpenTelemetry, GCP Trace Exporter, Pino (logging), Sentry |
| DI | tsyringe |

## Architecture

```
src/
├── controllers/    # Route handlers
├── db/             # Database setup
├── entities/       # MikroORM entities
├── environment/    # Env config
├── helpers/        # Utility helpers
├── migrations/     # MongoDB migrations
├── routes/         # Route definitions
├── schemas/        # JSON schemas (fluent-json-schema)
├── services/       # Business logic
├── types/          # Type definitions
├── utils/          # Utilities
├── validators/     # Input validators
├── app.ts          # Fastify app setup
└── index.ts        # Entry point
```

## Dependencies

### Depends on
- `@arianee/privacy-circuits` — Privacy circuit builds
- MongoDB
- GCP (for telemetry export)

### Depended on by
<!-- TODO: needs human input — which services/clients call this RPC server? -->

## Deployment

Dockerized service deployed via CircleCI + GCP.

| Environment | URL / Host | Deploy method |
|-------------|-----------|---------------|
| Production | <!-- TODO: needs human input --> | Docker + GCP |
| Staging | <!-- TODO: needs human input --> | Docker + GCP |

### CI/CD
- **CircleCI** — build, test, Docker image push to GCP Artifact Registry
- Node.js 18.16.0

## Configuration

### Required env vars
```
CIRCUITS_BUILD_PATH=  # Path to privacy circuits (default: ./node_modules/@arianee/privacy-circuits/build)
READER_API_KEY=       # API key for read access
MONGODB_URI=          # MongoDB connection URI
```

## Development

### Setup
```bash
git clone https://github.com/Arianee/arianee-rpc-server.git
cd arianee-rpc-server
npm install
```

### Common commands
```bash
npm run dev        # Dev server with hot reload
npm run build      # Build
npm start          # Start from dist/
npm run test       # Run tests
npm run lint       # Lint
```

## Conventions

<!-- TODO: needs human input -->

## Ownership

| Role | Team / Person |
|------|--------------|
| Squad | <!-- TODO: needs human input --> |
| Main contributors | <!-- TODO: needs human input --> |
