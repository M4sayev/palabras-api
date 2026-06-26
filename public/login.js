import { login } from "./auth.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const user = await login(email, password);
    console.log("Logged in as", user.name);
    window.location.href = "/index.html";
  } catch (error) {
    alert(error.message);
  }
});
