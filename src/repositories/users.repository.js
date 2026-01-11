const { Book } = require("../models/books.model");

class UserRepository {
  constructor(UserModel, UserBookModel) {
    this.User = UserModel;
    this.UserBookHistory = UserBookModel;
  }

  async findAllUsers() {
    return await this.User.findAll();
  }

  async findUserById(userId) {
    return await this.User.findByPk(userId, {
      include: [
        {
          model: this.UserBookHistory,
          as: "userBookHistory",
          include: [{ model: Book, as: "book" }],
        },
      ],
    });
  }

  async createUser(userData) {
    return await this.User.create(userData);
  }
}

module.exports = UserRepository;
