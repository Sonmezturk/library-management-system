class BookService {
  constructor(bookRepository, redisService) {
    this.bookRepository = bookRepository;
    this.redisClient = redisService;
  }

  async getAllBooks() {
    return this.bookRepository.findAllBooks();
  }

  async getBookById(bookId) {
    let bookData = await this.getFromRedis(bookId);
    if (bookData) {
      return bookData;
    }
    bookData = await this.bookRepository.findBookById(bookId);
    if (!bookData) {
      throw new Error("Book does not exist");
    }

    const scores = bookData.userBookHistory
      .map((item) => item.score)
      .filter((score) => score !== null);

    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : null;

    const bookWithScore = {
      ...bookData.dataValues,
      averageScore,
    };

    await this.saveToRedis(bookId, bookWithScore);
    return bookWithScore;
  }

  async saveToRedis(bookId, data) {
    return this.redisClient.set(`books:${bookId}`, data);
  }

  async getFromRedis(bookId) {
    return this.redisClient.get(`books:${bookId}`);
  }

  async createBook(bookData) {
    const book = await this.bookRepository.createBook(bookData);
    await this.saveToRedis(book.id, {
      ...book.dataValues,
      averageScore: null,
    });
    return book;
  }

  async borrowBook(bookId) {
    const success = await this.bookRepository.borrowBook(bookId);
    if (!success) {
      throw new Error("Book already borrowed");
    }
    await this.redisClient.delete(`books:${bookId}`);
  }

  async returnBook(bookId) {
    const success = await this.bookRepository.returnBook(bookId);
    if (!success) {
      throw new Error("Book not borrowed yet");
    }
    await this.redisClient.delete(`books:${bookId}`);
  }
}

module.exports = BookService;
