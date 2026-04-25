const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// Dummy admin credentials
const ADMIN = {
  email: "admin@wepdfhub.com",
  password: "123456"
};

// LOGIN API
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN.email && password === ADMIN.password) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: "Invalid credentials" });
  }
});

// Protected dashboard route (basic)
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Admin running on port " + PORT);
});
