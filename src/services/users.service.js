class UserService {
  constructor(
    bookService,
    userRepository,
    userBookHistoryRepository,
    redisClient
  ) {
    this.bookService = bookService;
    this.userRepository = userRepository;
    this.userBookHistoryRepository = userBookHistoryRepository;
    this.redisClient = redisClient;
  }

  async saveToRedis(userId, data) {
    return this.redisClient.set(`users:${userId}`, data);
  }

  async getFromRedis(userId) {
    return this.redisClient.get(`users:${userId}`);
  }

  async getAllUsers() {
    return this.userRepository.findAllUsers();
  }

  async getUserById(userId) {
    let user = await this.getFromRedis(userId);
    if (user) {
      return user;
    }
    const userData = await this.userRepository.findUserById(userId);
    if (!userData) {
      throw new Error("User does not exist");
    }

    const past = [];
    const present = [];

    for (const history of userData.userBookHistory || []) {
      if (history.returnedAt) {
        past.push({
          name: history.book?.name,
          userScore: history.score,
        });
      } else {
        present.push({
          name: history.book?.name,
        });
      }
    }

    user = {
      id: userData.id,
      name: userData.name,
      books: { past, present },
    };

    await this.saveToRedis(userId, user);
    return user;
  }

  async borrowBook(userId, bookId) {
    await this.getUserById(userId);
    await this.bookService.borrowBook(bookId);
    await this.userBookHistoryRepository.borrowBook({ userId, bookId });
    await this.redisClient.delete(`users:${userId}`);
  }

  async returnBook(userId, bookId, score) {
    await this.getUserById(userId);

    const activeBorrow =
      await this.userBookHistoryRepository.findActiveBorrow(userId, bookId);
    if (!activeBorrow) {
      throw new Error("You did not borrow this book");
    }

    await this.bookService.returnBook(bookId);
    await this.userBookHistoryRepository.returnBook(userId, bookId, score);
    await this.redisClient.delete(`users:${userId}`);
  }

  async createUser(userData) {
    return this.userRepository.createUser(userData);
  }
}

module.exports = UserService;
