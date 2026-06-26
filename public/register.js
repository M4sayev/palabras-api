import { register } from "./auth.js";

document
  .getElementById("registerform")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const user = await register(name, email, password);
      console.log("registered in as", user.name);
      window.location.href = "/index.html";
    } catch (err) {
      alert(err.message);
    }
  });
