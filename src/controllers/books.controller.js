const express = require("express");
const router = express.Router();
const container = require("../bootstrap/container");
const { bookValidator, idValidator } = require("../validators/books.validator");
const bookService = container.bookService;

router.get("/", async (req, res, next) => {
  try {
    const books = await bookService.getAllBooks();
    res.json(books.map(({ id, name }) => ({ id, name })));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", idValidator, async (req, res, next) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    const score =
      book.averageScore !== null ? book.averageScore.toFixed(2) : -1;
    res.json({ id: book.id, name: book.name, score });
  } catch (error) {
    next(error);
  }
});

router.post("/", bookValidator, async (req, res, next) => {
  try {
    await bookService.createBook(req.body);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
