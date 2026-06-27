import { registerSchema } from "@my-app/validation";

import {
  initFormValidation,
  showAndHideError,
  showError,
  hideError,
} from "@/utils/validation.js";
import { register } from "./auth.js";

const registerForm = document.getElementById("registerForm");
const submitButton = registerForm.querySelector("button[type='submit']");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const genericError = document.getElementById("genericError");

function clearAll() {
  nameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
}

const formFields = [
  {
    inputElement: nameInput,
    errorElement: nameError,
    fieldName: "name",
  },
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
  formElement: registerForm,
  fields: formFields,
  fullSchema: registerSchema,
  submitButton,
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  hideError({ element: emailError });
  hideError({ element: passwordError });

  submitButton.disabled = true;

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const result = await register(name, email, password);

    if (result.success) {
      clearAll();
      window.location.href = "/index.html";
    }
  } catch (error) {
    if (error.validationErrors) {
      if (error.validationErrors.name) {
        showError({ element: nameError, text: error.validationErrors.name });
      }
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
