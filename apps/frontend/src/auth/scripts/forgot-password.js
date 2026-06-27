import { forgotPasswordSchema } from "@my-app/validation";

import {
  initFormValidation,
  showAndHideError,
  showError,
  hideError,
} from "@/utils/validation.js";
import { sendResetLink } from "./auth.js";

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const submitButton = forgotPasswordForm.querySelector("button[type='submit']");

const emailInput = document.getElementById("email");

const emailError = document.getElementById("emailError");
const genericError = document.getElementById("genericError");

function clearAll() {
  emailInput.value = "";
}

const formFields = [
  {
    inputElement: emailInput,
    errorElement: emailError,
    fieldName: "email",
  },
];

initFormValidation({
  formElement: forgotPasswordForm,
  fields: formFields,
  fullSchema: forgotPasswordSchema,
  submitButton,
});

forgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitButton.disabled = true;

  hideError({ element: emailError });

  const email = emailInput.value;

  try {
    const result = await sendResetLink(email);

    if (result) {
      console.log("Success payload received:", result);
      alert("Success! Check your Ethereal inbox for the secure reset link.");
      clearAll();
    }
  } catch (error) {
    if (error.validationErrors) {
      if (error.validationErrors.email) {
        showError({ element: emailError, text: error.validationErrors.email });
      }
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
