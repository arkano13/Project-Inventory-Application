const pool = require("../db/pool");

async function getAllbooks() {
  try {
    const { rows } = await pool.query(`
      SELECT 
       books.id AS book_id,
        books.name AS book_name,
        publisher.name AS publisher_name,
        STRING_AGG(DISTINCT authors.name, ', ') AS authors,
        STRING_AGG(DISTINCT categories.name, ', ') AS categories,
        EXTRACT(YEAR FROM books.release_date) AS release_year
      FROM books
      INNER JOIN publisher        ON books.publisher_id        = publisher.id
      INNER JOIN books_authors    ON books.id                  = books_authors.book_id
      INNER JOIN authors          ON books_authors.author_id   = authors.id
      INNER JOIN books_categories ON books.id                  = books_categories.book_id
      INNER JOIN categories       ON books_categories.category_id = categories.id
      WHERE books.active = TRUE
      GROUP BY books.id, publisher.name, books.release_date
    `);
    return rows;
  } catch (err) {
    throw new Error(`Error fetching books: ${err.message}`);
  }
}

async function getAuthors() {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, birth_date FROM authors where active = true ORDER BY name`
    );
    return rows;
  } catch (err) {
    throw new Error(`Error fetching authors: ${err.message}`);
  }
}

async function insertAuthors(userData) {
  try {
    const { name, birth_date } = userData;
    const { rows } = await pool.query(
      `INSERT INTO authors (name, birth_date) VALUES ($1, $2) RETURNING *`,
      [name, birth_date]
    );
    return rows[0];
  } catch (err) {
    throw new Error(`Error inserting author: ${err.message}`);
  }
}

async function getPublishers() {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, founding_date FROM publisher where active = true ORDER BY name`
    );
    return rows;
  } catch (err) {
    throw new Error(`Error fetching publishers: ${err.message}`);
  }
}

async function insertPublishers(userData) {
  try {
    const { name, founding_date } = userData;
    const { rows } = await pool.query(
      `INSERT INTO publisher (name, founding_date) VALUES ($1, $2) RETURNING *`,
      [name, founding_date]
    );
    return rows[0]; 
  } catch (err) {
    throw new Error(`Error inserting publisher: ${err.message}`);
  }
}

async function getCategories() {
  try {
    const { rows } = await pool.query(
      `SELECT id, name FROM categories where active = true ORDER BY name`
    );
    return rows; 
  } catch (err) {
    throw new Error(`Error fetching categories: ${err.message}`); 
  }
}

async function insertCategories(userData) {
  try {
    const { name } = userData;
    const { rows } = await pool.query(
      `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
      [name]
    );
    return rows[0]; 
  } catch (err) {
    throw new Error(`Error inserting category: ${err.message}`);
  }
}

async function insertBook({ name, release_date, publisher_id }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO books (name, release_date, publisher_id) VALUES ($1, $2, $3) RETURNING id`,
      [name, release_date, publisher_id]
    );
    return rows[0];
  } catch (err) {
    throw new Error(`Error inserting book: ${err.message}`);
  }
}

async function insertBookAuthor({ bookId, author_id }) {
  try {
    await pool.query(
      `INSERT INTO books_authors (book_id, author_id) VALUES ($1, $2)`,
      [bookId, author_id]
    );
  } catch (err) {
    throw new Error(`Error inserting book-author: ${err.message}`);
  }
}


async function insertBookCategory({ bookId, category_ids }) {
  try {
    await pool.query(
      `INSERT INTO books_categories (book_id, category_id)
       SELECT $1, UNNEST($2::int[])`,
      [bookId, category_ids]
    );
  } catch (err) {
    throw new Error(`Error inserting book-categories: ${err.message}`);
  }
}

async function deleteBook(id) {
  const { rowCount } = await pool.query(
    "UPDATE books SET active=false WHERE id=$1", [id]
  );
  if (rowCount === 0) {
    throw new Error("Book not found");
  }
}

async function deleteAuthor(id) {
  await pool.query(
    `UPDATE books SET active=false WHERE id IN (
      SELECT book_id FROM books_authors WHERE author_id=$1
    )`, [id]
  );
  const { rowCount } = await pool.query(
    "UPDATE authors SET active=false WHERE id=$1", [id]
  );
  if (rowCount === 0) throw new Error("Author not found");
}

async function deletePublisher(id) {
  await pool.query(
    "UPDATE books SET active=false WHERE publisher_id=$1", [id]
  );
  const { rowCount } = await pool.query(
    "UPDATE publisher SET active=false WHERE id=$1", [id]
  );
  if (rowCount === 0) throw new Error("Publisher not found");
}

async function deleteCategory(id) {
  await pool.query(
    `UPDATE books SET active=false WHERE id IN (
      SELECT book_id FROM books_categories WHERE category_id=$1
    )`, [id]
  );
  const { rowCount } = await pool.query(
    "UPDATE categories SET active=false WHERE id=$1", [id]
  );
  if (rowCount === 0) throw new Error("Category not found");
}


async function updateBooks(userData) {
  const { id, name, release_date, publisher_id } = userData;
  const { rowCount } = await pool.query(
    "UPDATE books SET name=$2, release_date=$3, publisher_id=$4 WHERE id=$1",
    [id, name, release_date, publisher_id]
  );
  if (rowCount === 0) throw new Error("Book not found");
}

async function updatePublisher(userData) {
  const { id, name, founding_date } = userData;
  const { rowCount } = await pool.query(
    "UPDATE publisher SET name=$2, founding_date=$3 WHERE id=$1",
    [id, name, founding_date]
  );
  if (rowCount === 0) throw new Error("Publisher not found");
}

async function updateCategory(userData) {
  const { id, name } = userData;
  const { rowCount } = await pool.query(
    "UPDATE categories SET name=$2 WHERE id=$1",
    [id, name]
  );
  if (rowCount === 0) throw new Error("Category not found");
}

async function updateAuthor(userData) {
  const { id, name, birth_date } = userData;
  const { rowCount } = await pool.query(
    "UPDATE authors SET name=$2, birth_date=$3 WHERE id=$1",
    [id, name, birth_date]
  );
  if (rowCount === 0) throw new Error("Author not found");
}

async function getBookById(id) {
  const { rows } = await pool.query(
    `SELECT 
      books.id, 
      books.name, 
      books.release_date, 
      books.publisher_id,
      books_authors.author_id,
      ARRAY_AGG(books_categories.category_id) AS category_ids
    FROM books
    INNER JOIN books_authors ON books.id = books_authors.book_id
    INNER JOIN books_categories ON books.id = books_categories.book_id
    WHERE books.id = $1
    GROUP BY books.id, books.name, books.release_date, books.publisher_id, books_authors.author_id`,
    [id]
  );
  if (rows.length === 0) throw new Error("Book not found");
  return rows[0];
}

async function getAuthorById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, birth_date FROM authors WHERE id=$1`,
    [id]
  );
  if (rows.length === 0) throw new Error("Author not found");
  return rows[0];
}

async function getPublisherById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, founding_date FROM publisher WHERE id=$1`,
    [id]
  );
  if (rows.length === 0) throw new Error("Publisher not found");
  return rows[0];
}

async function getCategoryById(id) {
  const { rows } = await pool.query(
    `SELECT id, name FROM categories WHERE id=$1`,
    [id]
  );
  if (rows.length === 0) throw new Error("Category not found");
  return rows[0];
}


module.exports = {
  getAllbooks,
  insertAuthors,
  getAuthors,
  getPublishers,
  insertPublishers,
  getCategories,
  insertCategories,
  insertBook,
  insertBookAuthor,
  insertBookCategory,
  deleteBook,
  updateBooks,
  updatePublisher,
  updateCategory,
  updateAuthor,
  getAuthorById,
  getBookById,
  getPublisherById,
  getCategoryById,
  deleteAuthor,
  deleteCategory,
  deletePublisher
};