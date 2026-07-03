# ROM Handbook Archive Backend API

Backend service for the ROM Handbook Archive ecosystem.

## API Documentation

After starting the backend, open the interactive Swagger UI at:

```text
http://localhost:8080/swagger/
```

The raw OpenAPI 3.0 document is available at:

```text
http://localhost:8080/openapi.json
```

Swagger UI supports public archive endpoints and authenticated community/admin
endpoints. Discord authentication uses the `rom_session` HTTP-only cookie, so
authenticated requests work from Swagger after logging in through the same host.

This API will power authentication, community systems, archived game data services, and future interactive features for the ROM Handbook Archive platform.

---

# Project Vision

ROM Handbook Archive aims to preserve historical Ragnarok Mobile data before the original ROMHandbook shutdown.

The backend API exists to support:

- User authentication
- Community features
- Comments & discussions
- Favorites & bookmarks
- AI-powered systems
- Historical archive APIs
- Future interactive systems

---

# Planned Features

## Authentication

User authentication system:

- Login
- Register
- JWT authentication
- Refresh token support
- OAuth support (future)
- Profile system
- Role permissions

---

## Comments System

Community interaction features:

- Post comments
- Reply threads
- Like system
- Report moderation
- Markdown support
- Real-time updates (future)

---

## Favorites & Collections

Allow users to:

- Save cards
- Bookmark pets
- Favorite mounts
- Create custom collections
- Sync archive progress

---

## Archive APIs

Public/internal APIs for:

- Cards
- Monsters
- Pets
- Skills
- Buffs
- Mounts
- Formulas
- Things

---

## AI Features (Future)

Experimental systems:

- AI formula explanation
- Build recommendations
- Item relation analysis
- Smart search
- Semantic archive indexing

---

# Tech Stack (Planned)

## Backend

- Golang
- Gin / Fiber
- JWT Authentication
- PostgreSQL
- Redis (future)
- Docker support

---

## Frontend

- Next.js
- TypeScript
- TailwindCSS

---

# Architecture Goals

The backend is designed to be:

- Fast
- Lightweight
- Scalable
- Easy to maintain
- API-first
- Mobile-ready
- Future microservice compatible

---
