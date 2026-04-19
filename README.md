# Votely — Real-time Voting App (Backend)

A RESTful API + real-time WebSocket backend for **Votely**, a platform that lets users create polls, cast votes, and chat live within each poll room.

---

## Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Runtime    | Node.js                                                |
| Framework  | Express.js v5                                          |
| Language   | TypeScript                                             |
| Database   | MongoDB + Mongoose + Typegoose                         |
| Real-time  | Socket.io                                              |
| Auth       | JWT (access token + refresh token via HttpOnly cookie) |
| Validation | Joi                                                    |
| Security   | Helmet, CORS, express-rate-limit                       |
| Testing    | Jest + mongodb-memory-server                           |
| API Docs   | Swagger UI (YAML)                                      |

---

## Features

- **Authentication** — Register, login, logout, refresh token with HttpOnly cookie strategy
- **Poll management** — Create, update, close and delete polls; share via unique 6-digit code
- **Real-time voting** — Vote results broadcast instantly to all poll participants via Socket.io
- **Live chat** — Per-poll chat rooms powered by Socket.io, with toggleable chat feature
- **Security** — Rate limiting on auth routes, Helmet CSP/HSTS headers, input validation on all endpoints
- **API documentation** — Interactive Swagger UI at `/api-docs`

---

## Project Structure

```
src/
├── config/          # CORS, database, env validation
├── controllers/     # Request handlers (user, poll, chat)
├── middlewares/     # Auth guard, rate limiter, validation
├── models/          # Mongoose/Typegoose models
├── routes/          # API route definitions
├── schema/          # Joi validation schemas
├── services/        # Business logic layer
│   └── __test__/    # Unit tests
├── types/           # Custom TypeScript types
└── utils/           # AppError, JWT helpers, guards
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/buithachIT/Votely_backend_nodejs.git
cd Votely_backend_nodejs
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=8083
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLIENT_URL=http://localhost:5173
```

### Run

```bash
# Development (hot-reload)
npm run dev

# Production build
npm run build
```

### Tests

```bash
npm test
```

---

## API Documentation

Start the server and navigate to:

```
http://localhost:8083/api-docs
```

### Key Endpoints

| Method | Endpoint                    | Auth   | Description                 |
| ------ | --------------------------- | ------ | --------------------------- |
| POST   | `/api/register`             | —      | Create account              |
| POST   | `/api/login`                | —      | Login, returns access token |
| POST   | `/api/refresh`              | Cookie | Refresh access token        |
| GET    | `/api/me`                   | ✅     | Get current user            |
| POST   | `/api/polls`                | ✅     | Create a poll               |
| GET    | `/api/polls/code/:code`     | —      | Get poll by share code      |
| PATCH  | `/api/polls/:id`            | ✅     | Update poll                 |
| PATCH  | `/api/polls/:id/close`      | ✅     | Close a poll                |
| DELETE | `/api/polls/:id`            | ✅     | Delete a poll               |
| POST   | `/api/polls/:id/vote`       | ✅     | Cast a vote                 |
| GET    | `/api/polls/chat/:pollCode` | —      | Get chat history            |

### Socket.io Events

| Event             | Direction       | Description                    |
| ----------------- | --------------- | ------------------------------ |
| `join-poll`       | Client → Server | Join a poll room               |
| `send-message`    | Client → Server | Send a chat message            |
| `receive-message` | Server → Client | Broadcast new message          |
| `new-vote`        | Server → Client | Broadcast updated vote results |
| `chat-error`      | Server → Client | Chat not available             |

---

## License

MIT
