const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body; // Extract data from request body

  // Check if both fields are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "User already exists! Please log in instead." });
  }

  // Register new user
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. You can now log in." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // Simulate fetching data via Axios (Promise)
    const response = await axios.get('http://localhost:5000/booksdata');
    // Return the fetched data
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});


// ✅ Extra endpoint — returns the books directly (for Axios to call)
public_users.get('/booksdata', (req, res) => {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Retrieve ISBN from request parameters
  const isbn = req.params.isbn;

  // Check if the book exists in the database
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];

  // Get all book keys (ISBNs)
  let keys = Object.keys(books);

  // Iterate over all books and match by author name
  keys.forEach((key) => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push(books[key]);
    }
  });

  // If books found, return them; else return not found
  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];

  // Get all book keys (ISBNs)
  let keys = Object.keys(books);

  // Iterate over all books and match by title
  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle.push(books[key]);
    }
  });

  // If books found, return them; else return not found
  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const isbnNumber = Number(isbn);
  // Check if the book exists in the database
  if (books[isbnNumber]) {
    const bookReviews = books[isbnNumber].reviews;

    // Return the reviews (even if empty)
    return res.status(200).send(JSON.stringify(bookReviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
