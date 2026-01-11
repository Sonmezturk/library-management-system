class UserBookHistory {
  constructor(UserBookModel) {
    this.UserBook = UserBookModel;
  }

  async borrowBook(userBookData) {
    const { bookId, userId, borrowedAt } = userBookData;
    return this.UserBook.create({
      bookId,
      userId,
      borrowedAt,
    });
  }

  async findActiveBorrow(userId, bookId) {
    return this.UserBook.findOne({
      where: {
        userId,
        bookId,
        returnedAt: null,
      },
    });
  }

  async returnBook(userId, bookId, score) {
    const lastRecord = await this.UserBook.findOne({
      order: [["borrowedAt", "DESC"]],
      where: {
        bookId,
        userId,
        returnedAt: null,
      },
    });

    if (!lastRecord) {
      throw new Error("No borrow record found for this book and user");
    }

    await this.UserBook.update(
      {
        score,
        returnedAt: new Date(),
      },
      {
        where: {
          id: lastRecord.id,
        },
      }
    );
  }
}

module.exports = UserBookHistory;
