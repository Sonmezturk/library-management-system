const { Book } = require("../models/books.model");
const { User } = require("../models/users.model");
const { UserBookHistory } = require("../models/user-book-history.model");
const Redis = require("./redis");

const BookRepository = require("../repositories/books.repository");
const UserRepository = require("../repositories/users.repository");
const UserBookHistoryRepository = require("../repositories/user-book-history.repository");

const BookService = require("../services/books.service");
const UserService = require("../services/users.service");

// Create instances and inject dependencies
const bookRepositoryInstance = new BookRepository(Book, UserBookHistory);
const userRepositoryInstance = new UserRepository(User, UserBookHistory);
const userBookRepositoryInstance = new UserBookHistoryRepository(UserBookHistory);

const redisClient = new Redis(
  process.env.REDIS_PW,
  process.env.REDIS_HOST,
  process.env.REDIS_PORT
);

const bookServiceInstance = new BookService(bookRepositoryInstance, redisClient);
const userServiceInstance = new UserService(
  bookServiceInstance,
  userRepositoryInstance,
  userBookRepositoryInstance,
  redisClient
);

const container = {
  bookService: bookServiceInstance,
  userService: userServiceInstance,
};

module.exports = container;
