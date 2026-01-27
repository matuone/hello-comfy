# Copilot Instructions for HelloComfy

## Overview
- **HelloComfy** is a modular e-commerce platform with:
  - Frontend: React + Vite (src/)
  - Backend: Node.js + Express + MongoDB (backend/)
  - Admin panel: Dynamic, modular, persistent layout

## Architecture & Data Flow
- **Frontend** fetches data from backend via `/api/*` endpoints (see vite.config.js for proxy setup)
- **Backend** follows MVC:
  - `models/`: Mongoose schemas (e.g., User, Product, Order)
  - `controllers/`: Business logic per resource
  - `routes/`: Express routers, one per resource
  - `services/`: Integrations (AFIP, Cloudinary, shipping, etc.)
- **Admin panel**: Each section is a view in `src/views/`, with matching CSS in `src/styles/`
- **State**: Local state per component, no global store

## Developer Workflows
- **Install dependencies**:
  - Backend: `cd backend && npm install`
  - Frontend: `npm install`
- **Start servers**:
  - Backend: `cd backend && npm start` (port 5000)
  - Frontend: `npm run dev` (port 5173)
- **Environment**:
  - Backend: `.env` in `backend/` (see GUIA_INSTALACION.md for template)
  - Frontend: No .env needed; API URL proxied
- **Testing**: Manual via browser and API endpoints; see GUIA_INSTALACION.md and backend/AFIP_TESTING.md
- **Debugging**: See logs in both terminals; use browser DevTools; check MongoDB connection

## Project Conventions
- **Naming**:
  - Files: English
  - Variables: Spanish
  - Components: PascalCase
  - CSS: kebab-case, one file per view
- **Frontend**:
  - Data adaptation in frontend after fetch
  - Error handling via notifications
  - Use `useState`/`useEffect` for state/data loading
- **Backend**:
  - One controller, route, and model per resource
  - Integrations (AFIP, GoCuotas, shipping) in `services/`
  - Sensitive files (certs, keys) are gitignored (see backend/config/INSTRUCCIONES_AFIP.md)

## Integration Points
- **AFIP**: Setup in backend/config/, see AFIP_README.md and INSTRUCCIONES_AFIP.md
- **Cloudinary**: For avatar uploads, needs credentials in backend/.env
- **GoCuotas, MercadoPago, Correo Argentino**: Each has its own setup/readme in root or backend/

## Extending the Project
- **Add admin section**: Create view in `src/views/`, CSS in `src/styles/`, add route and sidebar link
- **Add backend resource**: Add model, controller, route, and (if needed) service
- **Add shipping/payment method**: Update backend/services/ and relevant frontend views

## Key Files & Docs
- `README.md`, `GUIA_INSTALACION.md`: Architecture, conventions, onboarding
- `vite.config.js`: Proxy config for API
- `backend/server.js`: Express app entrypoint
- `backend/services/`: Integrations
- `backend/config/INSTRUCCIONES_AFIP.md`: AFIP setup and security

## AI Agent Rules
- Never invent files or endpoints
- Respect existing structure and naming
- Deliver complete files, not fragments
- Explain every change
- Match HelloComfy's style and conventions
