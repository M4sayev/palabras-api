import { login } from "./auth.js";

const loginForm = document.getElementById("loginForm");
const submitButton = loginForm.querySelector("button[type='submit']");
const formError = document.getElementById("formError");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

function clearAll() {
  formError.textContent = "";
  emailInput.value = "";
  passwordInput.value = "";
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitButton.disabled = true;

  const email = emailInput.value;
  const password = passwordInput.value;

  clearAll();

  // const clientValidation = loginSchema.safeParse(formData);

  try {
    const result = await login(email, password);

    if (result.success) {
      console.log("Logged in as", result.user.name);
      window.location.href = "/index.html";
    }
  } catch (error) {
    if (error.validationErrors) {
      if (error.validationErrors.email)
        console.log("Email issue:", error.validationErrors.email);
      if (error.validationErrors.password)
        console.log("Password issue:", error.validationErrors.password);
    }

    formError.textContent = error.message;
    setTimeout(() => (formError.textContent = ""), 3000);
  } finally {
    submitButton.disabled = false;
  }
});
