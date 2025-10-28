const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if username is valid (exists in database)
const isValid = (username) => {
  // returns true if user exists
  return users.some(user => user.username === username);
};

// Function to authenticate user by matching username and password
const authenticatedUser = (username, password) => {
  // returns true if both username and password match
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user exists and credentials are valid
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    let accessToken = jwt.sign(
      { data: username }, // payload
      "access",           // secret key
      { expiresIn: 60 * 60 } // 1 hour expiry
    );

    // Save the token in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }
});


// Placeholder for next task
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // review sent as query param
  const username = req.session.authorization?.username; // user from session

  // Check if user is logged in
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Check if ISBN exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if review text is provided
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // If no reviews exist for this book, create an empty object
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or modify the review under the username
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
