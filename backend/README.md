# Simple NestJS Application

A basic NestJS application with a simple REST API.

## Features

- Basic "Hello World" endpoint
- Health check endpoint
- TypeScript support
- Testing setup with Jest
- ESLint with Airbnb configuration
- Prettier code formatting
- pnpm package manager

## Installation

```bash
pnpm install
```

## Running the app

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# production mode
pnpm run start:prod
```

## Code Quality

```bash
# lint and fix code
pnpm run lint

# check linting without fixing
pnpm run lint:check

# format code with prettier
pnpm run format
```

## Test

```bash
# unit tests
pnpm test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## API Endpoints

- `GET /` - Returns a hello world message
- `GET /health` - Returns application health status

## Project Structure

```
src/
├── app.controller.ts    # Main controller with route handlers
├── app.module.ts        # Root application module
├── app.service.ts       # Application service with business logic
├── app.controller.spec.ts # Unit tests for the controller
└── main.ts             # Application entry point
```