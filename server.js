const express = require("express");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());

// 🔐 Admin Home
app.get("/", (req, res) => {
  res.send("WePDFHub Admin Panel 🚀");
});

// 🔐 Login Page (basic placeholder)
app.get("/login", (req, res) => {
  res.send(`
    <h2>Admin Login</h2>
    <p>Login system coming soon...</p>
  `);
});

// ❌ Handle unknown routes
app.use((req, res) => {
  res.status(404).send("Page not found");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Admin running on port " + PORT);
});
