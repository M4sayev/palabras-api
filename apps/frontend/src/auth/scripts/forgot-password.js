import { sendResetLink } from "./auth.js";

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

forgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = forgotPasswordForm.querySelector("input").value;
  try {
    const result = await sendResetLink(email);

    if (result) {
      console.log("Success payload received:", result);
      alert("Success! Check your Ethereal inbox for the secure reset link.");
    }
  } catch (error) {
    console.error(
      "Form submission intercepted an execution error:",
      error.message,
    );
    alert(error.message || "An unexpected error occurred. Please try again.");
  }
});
