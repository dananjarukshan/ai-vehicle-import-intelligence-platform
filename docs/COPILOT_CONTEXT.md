# AI Vehicle Import Intelligence Platform - Project Context

IMPORTANT INSTRUCTIONS FOR AI ASSISTANTS

This document is the source of truth for understanding this project.

DO NOT modify this document.

Before generating, editing, refactoring, or creating code, always refer to this document.

If any future request conflicts with this document, ask for clarification instead of making assumptions.

---

## Project Overview

This project is an AI-powered vehicle import intelligence platform.

The system helps vehicle import businesses analyze auction vehicles and estimate selling prices.

The platform will:

1. Accept auction images uploaded by users.
2. Extract vehicle information using OCR and AI.
3. Store vehicle information in a PostgreSQL database (Supabase).
4. Calculate import costs.
5. Calculate estimated selling prices.
6. Allow manual profit adjustments.
7. Display market analytics and trends.
8. Provide quotations for customers.

---

## Current Technology Stack

Frontend:
- React
- Tailwind CSS

Backend:
- Node.js
- Express.js

Database:
- PostgreSQL (Supabase)

Automation:
- n8n

AI:
- OpenAI Vision

Version Control:
- Git
- GitHub

Project Management:
- GitHub Projects

---

## Development Philosophy

The developer is learning software engineering.

Therefore:

1. Explain all generated code.
2. Add comments throughout code.
3. Explain every function.
4. Explain every endpoint.
5. Use beginner-friendly explanations.
6. Prefer clarity over cleverness.
7. Follow industry best practices.
8. Maintain scalability.
9. Avoid unnecessary complexity.

---

## Folder Structure

backend/
src/
config/
controllers/
middleware/
routes/
services/

Future additions:
database/
frontend/
automation/
docs/
tests/

---

## Backend Standards

Always:

- Use environment variables.
- Separate routes, controllers and services.
- Use async/await.
- Add error handling.
- Add comments.

Never:

- Hardcode secrets.
- Put business logic directly in routes.
- Create monolithic files.

---

## Future Features

- User authentication
- Vehicle management
- OCR processing
- Price estimation engine
- Analytics dashboard
- Admin panel
- Audit logging
- Mobile application support

---

## Current Development Stage

Completed:
- GitHub Repository
- GitHub Project Board
- Database Design
- Supabase Setup
- Backend Initialization

Current Task:
- Connect Backend to Supabase

Future Tasks:
- Vehicle CRUD APIs
- OCR Integration
- Pricing Engine
- Frontend Development