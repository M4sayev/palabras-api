import { resetPassword } from "./auth.js";

const resetPasswordForm = document.getElementById("resetPasswordForm");

const password1 = document.getElementById("password");
const password2 = document.getElementById("repeat-password");

window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);

  const token = urlParams.get("token");

  if (!token) {
    window.location.href = "index.html";
  }
  console.log;

  resetPasswordForm.addEventListener("submit", handleForm);
});

async function handleForm(e) {
  e.preventDefault();
  try {
    const p1 = password1.value;
    const p2 = password2.value;

    if (p1 !== p2) {
      alert("Password must match");
    }

    const urlParams = new URLSearchParams(window.location.search);

    const token = urlParams.get("token");

    const result = await resetPassword(p1, token);

    if (result) {
      console.log("Success payload received:", result);
      alert("Success! Check your Ethereal inbox for the secure reset link.");

      window.location.href = "index.html";
    }
  } catch (error) {
    console.error(
      "Form submission intercepted an execution error:",
      error.message,
    );
    alert(error.message || "An unexpected error occurred. Please try again.");
  }
}
