function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem("admin", "true");
      window.location.href = "/dashboard";
    } else {
      document.getElementById("msg").innerText = data.message;
    }
  });
}

function logout() {
  localStorage.removeItem("admin");
  window.location.href = "/login.html";
}
