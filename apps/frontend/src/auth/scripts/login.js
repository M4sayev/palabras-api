import {
  hideError,
  showError,
  initFormValidation,
} from "@/utils/validation.js";
import { login } from "./auth.js";
import { loginSchema } from "@my-app/validation";
import { showAndHideError } from "../../utils/validation.js";

const loginForm = document.getElementById("loginForm");
const submitButton = loginForm.querySelector("button[type='submit']");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const genericError = document.getElementById("genericError");

function clearAll() {
  emailInput.value = "";
  passwordInput.value = "";
}

const formFields = [
  {
    inputElement: emailInput,
    errorElement: emailError,
    fieldName: "email",
  },
  {
    inputElement: passwordInput,
    errorElement: passwordError,
    fieldName: "password",
  },
];

initFormValidation({
  formElement: loginForm,
  fields: formFields,
  fullSchema: loginSchema,
  submitButton,
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  hideError({ element: emailError });
  hideError({ element: passwordError });

  submitButton.disabled = true;

  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const result = await login(email, password);

    if (result.success) {
      clearAll();
      console.log("Logged in as", result.user.name);
      window.location.href = "/index.html";
    }
  } catch (error) {
    if (error.validationErrors) {
      if (error.validationErrors.email)
        showError({ element: emailError, text: error.validationErrors.email });
      if (error.validationErrors.password)
        showError({
          element: passwordError,
          text: error.validationErrors.password,
        });
    } else {
      showAndHideError({
        element: genericError,
        text: error.message,
        time: 2500,
        isVisibility: false,
      });
    }
  } finally {
    submitButton.disabled = false;
  }
});
