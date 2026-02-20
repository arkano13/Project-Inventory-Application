const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

const validateAuthor = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("birth_date")
    .notEmpty()
    .withMessage("La fecha de nacimiento es requerida")
    .isDate()
    .withMessage("La fecha no es válida"),
];

const validatePublisher = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("founding_date")
    .notEmpty()
    .withMessage("La fecha de fundación es requerida")
    .isDate()
    .withMessage("La fecha no es válida"),
];

const validateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre debe tener entre 2 y 30 caracteres"),
];

const validateBook = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El título es requerido")
    .isLength({ min: 1, max: 100 })
    .withMessage("El título debe tener entre 1 y 100 caracteres"),
  body("author_id").notEmpty().withMessage("Debes seleccionar un autor"),
  body("publisher_id")
    .notEmpty()
    .withMessage("Debes seleccionar una editorial"),
  body("release_date")
    .notEmpty()
    .withMessage("La fecha de publicación es requerida")
    .isDate()
    .withMessage("La fecha no es válida"),
  body("category_ids")
    .notEmpty()
    .withMessage("Debes seleccionar al menos una categoría"),
];

exports.indexViews = async (req, res) => {
  try {
    const books = await db.getAllbooks();
    res.render("index", {
      title: "Books list",
      books,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.createBookGet = async (req, res) => {
  const authors = await db.getAuthors();
  const publisher = await db.getPublishers();
  const categories = await db.getCategories();
  res.render("booksList", {
    title: "books list",
    authors,
    publisher,
    categories,
  });
};

exports.createBookPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const [authors, publisher, categories] = await Promise.all([
      db.getAuthors(),
      db.getPublishers(),
      db.getCategories(),
    ]);
    return res.render("booksList", {
      title: "Create book",
      authors,
      publisher,
      categories,
      errors: errors.array(),
    });
  }
  try {
    let { name, release_date, publisher_id, author_id, category_ids } =
      req.body;

    publisher_id = parseInt(publisher_id);
    author_id = parseInt(author_id);

    const newBook = await db.insertBook({ name, release_date, publisher_id });

    await db.insertBookAuthor({ bookId: newBook.id, author_id });

    if (category_ids) {
      if (!Array.isArray(category_ids)) category_ids = [category_ids];
      category_ids = category_ids.map(Number);
      await db.insertBookCategory({ bookId: newBook.id, category_ids });
    }

    res.redirect("/");
  } catch (err) {
    console.error("Error al crear libro:", err);
    res.status(500).send("Something went wrong");
  }
};

exports.createAuthorGet = async (req, res) => {
  const authors = await db.getAuthors();
  res.render("createAuthors", {
    title: "Create authors",
    authors,
    errors: [],
  });
};

exports.createAuthorPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const authors = await db.getAuthors();
    return res.render("createAuthors", {
      title: "Create authors",
      authors,
      errors: errors.array(),
    });
  }
  try {
    await db.insertAuthors(req.body);
    res.redirect("/createAuthors");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

exports.createPublishersGet = async (req, res) => {
  const publisher = await db.getPublishers();
  res.render("createPublishers", {
    title: "Create publishers",
    publisher,
    errors: [],
  });
};

exports.createPublishersPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const publisher = await db.getPublishers();
    return res.render("createPublishers", {
      title: "Create publishers",
      publisher,
      errors: errors.array(),
    });
  }
  try {
    await db.insertPublishers(req.body);
    res.redirect("/createPublishers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

exports.createCategoriesGet = async (req, res) => {
  const categories = await db.getCategories();
  res.render("createCategories", {
    title: "Create categories",
    categories,
    errors: [],
  });
};

exports.createCategoriesPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const categories = await db.getCategories();
    return res.render("createCategories", {
      title: "Create categories",
      categories,
      errors: errors.array(),
    });
  }
  try {
    await db.insertCategories(req.body);
    res.redirect("/createCategories");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};


exports.bookEditGet = async (req, res) => {
  try {
    const book = await db.getBookById(req.params.id);
    const [authors, publisher, categories] = await Promise.all([
      db.getAuthors(),
      db.getPublishers(),
      db.getCategories(),
    ]);
    res.render("editBook", {
      title: "Editar Libro",
      book,
      authors,
      publisher,
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.bookEditPost = async (req, res) => {
  try {
    const { name, release_date, publisher_id } = req.body;
    await db.updateBooks({
      id: req.params.id,
      name,
      release_date,
      publisher_id,
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};


exports.authorEditGet = async (req, res) => {
  try {
    const author = await db.getAuthorById(req.params.id);
    res.render("editAuthor", { title: "Editar Autor", author });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.authorEditPost = async (req, res) => {
  try {
    const { name, birth_date } = req.body;
    await db.updateAuthor({ id: req.params.id, name, birth_date });
    res.redirect("/createAuthors");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.publisherEditGet = async (req, res) => {
  try {
    const pub = await db.getPublisherById(req.params.id);
    res.render("editPublisher", { title: "Editar Editorial", pub });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.publisherEditPost = async (req, res) => {
  try {
    const { name, founding_date } = req.body;
    await db.updatePublisher({ id: req.params.id, name, founding_date });
    res.redirect("/createPublishers");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};


exports.categoryEditGet = async (req, res) => {
  try {
    const category = await db.getCategoryById(req.params.id);
    res.render("editCategory", { title: "Editar Categoría", category });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.categoryEditPost = async (req, res) => {
  try {
    const { name } = req.body;
    await db.updateCategory({ id: req.params.id, name });
    res.redirect("/createCategories");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};


exports.bookDeletePost = async (req, res) => {
  try {
    const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
  return res.status(403).json({ error: "Contraseña incorrecta" });
}
    await db.deleteBook(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.authorsDeletePost = async (req, res) => {
  try {
    const { password } = req.body;
   if (password !== process.env.ADMIN_PASSWORD) {
  return res.status(403).json({ error: "Contraseña incorrecta" });
}
    await db.deleteAuthor(req.params.id);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.categoriesDeletePost = async (req, res) => {
   try {
    const { password } = req.body;
   if (password !== process.env.ADMIN_PASSWORD) {
  return res.status(403).json({ error: "Contraseña incorrecta" });
}
  await db.deleteCategory(req.params.id);
  res.redirect("/");
    } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.publishersDeletePost = async (req, res) => {
   try {
    const { password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
  return res.status(403).json({ error: "Contraseña incorrecta" });
}
  await db.deletePublisher(req.params.id);
  res.redirect("/");
    } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

exports.validateBook = validateBook;
exports.validateAuthor = validateAuthor;
exports.validatePublisher = validatePublisher;
exports.validateCategory = validateCategory;
