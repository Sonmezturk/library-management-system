const express = require("express");
const router = express.Router();
const {
  userValidator,
  borrowValidator,
  returnValidator,
  idValidator,
} = require("../validators/users.validator");

const container = require("../bootstrap/container");

const userService = container.userService;

router.get("/", async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users.map(({ id, name }) => ({ id, name })));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", idValidator, async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/borrow/:bookId", borrowValidator, async (req, res, next) => {
  try {
    const { id, bookId } = req.params;
    await userService.borrowBook(id, bookId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/:id/return/:bookId", returnValidator, async (req, res, next) => {
  try {
    const { id, bookId } = req.params;
    const { score } = req.body;
    await userService.returnBook(id, bookId, score);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/", userValidator, async (req, res, next) => {
  try {
    await userService.createUser(req.body);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
