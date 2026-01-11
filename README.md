# Library Management System

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Express.js | Web framework |
| Sequelize | ORM |
| SQLite | Database |
| Redis | Caching layer |
| express-validator | Input validation |

## Architecture

```
src/
├── bootstrap/          # Application setup
│   ├── container.js    # Dependency injection container
│   ├── database.js     # Sequelize configuration
│   └── redis.js        # Redis client wrapper
├── controllers/        # Route handlers (HTTP layer)
├── services/           # Business logic
├── repositories/       # Data access layer
├── models/             # Sequelize models
├── validators/         # Request validation middleware
└── utils/              # Error handling utilities
```

### Layered Architecture

```
Controller → Service → Repository → Database
                ↓
              Redis (Cache)
```

- **Controllers**: Handle HTTP requests/responses, delegate to services
- **Services**: Business logic, caching strategy, orchestration
- **Repositories**: Database operations via Sequelize ORM

### Dependency Injection

Dependencies are wired in `container.js` and injected through constructors:

```javascript
const bookServiceInstance = new BookService(bookRepositoryInstance, redisClient);
const userServiceInstance = new UserService(
  bookServiceInstance,
  userRepositoryInstance,
  userBookHistoryRepository,
  redisClient
);
```

## API Endpoints

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | List all books |
| GET | `/books/:id` | Get book details with average score |
| POST | `/books` | Create a new book |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user with borrowed books history |
| POST | `/users` | Create a new user |
| POST | `/users/:id/borrow/:bookId` | Borrow a book |
| POST | `/users/:id/return/:bookId` | Return a book with score |

## Data Models

### Book
```javascript
{
  id: Integer,
  name: String,
  isCurrentlyBorrowed: Boolean
}
```

### User
```javascript
{
  id: Integer,
  name: String
}
```

### UserBookHistory
```javascript
{
  id: Integer,
  userId: Integer,
  bookId: Integer,
  score: Integer (1-10),
  borrowedAt: Date,
  returnedAt: Date
}
```

## Key Implementation Details

### Caching Strategy

- **Cache-aside pattern**: Check Redis first, fallback to database
- **Cache invalidation**: Delete cache on update operations
- **Cached data**: User details (with book history), Book details (with average score)

```javascript
async getBookById(bookId) {
  let bookData = await this.getFromRedis(bookId);
  if (bookData) return bookData;

  bookData = await this.bookRepository.findBookById(bookId);
  await this.saveToRedis(bookId, bookData);
  return bookData;
}
```

### Race Condition Prevention

Atomic updates prevent concurrent borrow conflicts:

```javascript
async borrowBook(id) {
  const [affectedRows] = await this.Book.update(
    { isCurrentlyBorrowed: true },
    { where: { id, isCurrentlyBorrowed: false } }
  );
  return affectedRows > 0;
}
```

### Error Handling

Centralized error handler with operational error classification:

```javascript
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

### Input Validation

Express-validator middleware for request validation:

```javascript
const borrowValidator = [
  param("id").notEmpty().isInt({ min: 1 }).withMessage("Valid user ID is required"),
  param("bookId").notEmpty().isInt({ min: 1 }).withMessage("Valid book ID is required"),
  handleValidationErrors,
];
```

## Setup

### Prerequisites

- Node.js 18+
- Redis server

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=dev
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PW=your_password
```

### Run

```bash
npm start
```
