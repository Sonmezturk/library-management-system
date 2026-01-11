require("dotenv").config();
const express = require("express");
const app = express();
const booksController = require("./src/controllers/books.controller");
const usersController = require("./src/controllers/users.controller");
const { errorHandler } = require("./src/utils/error-handler");

const db = require("./src/bootstrap/database");
const isDevelopment = process.env.NODE_ENV === "dev";
app.use(express.json());

app.use("/books", booksController);
app.use("/users", usersController);
app.use(errorHandler);

db.sync({ force: isDevelopment })
  .then(() => {
    console.log("Database synced");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to sync database:", error);
  });
