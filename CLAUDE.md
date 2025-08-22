# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript architecture reference guide demonstrating best practices for large-scale applications with:
- **Zedux** for atom-based state management
- **Zod** for schema validation  
- **Axios** for API communication
- **Three-layer UI architecture**: Pages → Features → Components

## Architecture Structure

### Core Principles
- **Centralized business logic** in `/services`, `/types`, and `/schemas`
- **Feature-based UI modules** for domain-specific components
- **Atomic state management** with Zedux atoms, ions, and selectors
- **Type-safe API contracts** with Zod validation

### Key Directories

```
src/
├── pages/          # Route-level containers (UI orchestration only)
├── features/       # Domain-specific UI modules with business logic
├── components/     # Generic, reusable UI components
├── atoms/          # All state management (atoms, ions, selectors)
├── services/       # API services with embedded request/response schemas
├── types/          # Universal business types only
├── schemas/        # Universal business validation schemas only
├── ecosystem/      # Zedux ecosystem configuration
└── app/           # Application root and providers
```

## Development Guidelines

### Component Placement Rules
- **Pages**: Route containers, no business logic, compose features
- **Features**: Domain-specific components with state access
- **Components**: Generic, reusable, no domain knowledge

### State Management with Zedux
- All state lives in `/atoms` organized by domain
- Use atoms for primary state, ions for derived state
- Access via `useAtomValue()`, `useAtomState()`, `useAtomInstance()`

### Service Layer Pattern
- Services encapsulate all API communication
- Request/response schemas defined within service files
- Universal business entities in centralized `/schemas` and `/types`
- Services return validated, type-safe data using Zod

### Type Organization
- **Universal types/schemas** (`/types`, `/schemas`): Core business entities used across the app
- **Service-specific contracts**: API request/response types kept within service files for high cohesion

## Important Documentation

Key guides in `/docs`:
- `react-project-architecture-doc.md` - Complete architecture overview
- `pages-vs-features-vs-components-guide.md` - UI layer boundaries
- `services-layer-guide.md` - API abstraction patterns
- `types-schemas-guide.md` - Type system organization
- `app-ecosystem-docs.md` - Zedux ecosystem setup