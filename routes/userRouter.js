const { Router } = require("express");
const userController = require("../controllers/userController");
const { validateBook, validateAuthor, validatePublisher, validateCategory } = require("../controllers/userController");
const usersRouter = Router();

usersRouter.get("/", userController.indexViews);
usersRouter.get("/:id/edit", userController.bookEditGet);
usersRouter.post("/:id/edit", userController.bookEditPost);
usersRouter.post("/:id/delete", userController.bookDeletePost);

usersRouter.get("/booksList", userController.createBookGet);
usersRouter.post("/booksList", validateBook,userController.createBookPost);

usersRouter.get("/createAuthors", userController.createAuthorGet);
usersRouter.get("/authors/:id/edit", userController.authorEditGet);
usersRouter.post("/authors/:id/edit", userController.authorEditPost);
usersRouter.post("/createAuthors", validateAuthor, userController.createAuthorPost);
usersRouter.post("/authors/:id/delete", userController.authorsDeletePost);

usersRouter.get("/createPublishers", userController.createPublishersGet);
usersRouter.get("/publishers/:id/edit", userController.publisherEditGet);
usersRouter.post("/publishers/:id/edit", userController.publisherEditPost);
usersRouter.post("/createPublishers", validatePublisher, userController.createPublishersPost);
usersRouter.post("/publishers/:id/delete", userController.publishersDeletePost);

usersRouter.get("/createCategories", userController.createCategoriesGet);
usersRouter.get("/categories/:id/edit", userController.categoryEditGet);
usersRouter.post("/categories/:id/edit", userController.categoryEditPost);
usersRouter.post("/createCategories", validateCategory, userController.createCategoriesPost);
usersRouter.post("/categories/:id/delete", userController.categoriesDeletePost);








module.exports = usersRouter;
