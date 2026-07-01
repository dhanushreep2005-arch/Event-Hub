document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.name);
        localStorage.setItem("email", data.user.email);

        alert("Login successful!");
        window.location.href = "profile.html";
      } else {
        alert(data.msg || "Invalid login details");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  });
});
