import { resetPasswordRealTimeSchema } from "@my-app/validation";
import { resetPassword } from "./auth.js";
import {
  hideError,
  initFormValidation,
  showAndHideError,
} from "@/utils/validation.js";

const resetPasswordForm = document.getElementById("resetPasswordForm");
const submitButton = resetPasswordForm.querySelector("button[type='submit']");

const passwordOne = document.getElementById("newPassword");
const passwordTwo = document.getElementById("repeatPassword");

const passwordOneError = document.getElementById("passwordErrorOne");
const passwordTwoError = document.getElementById("passwordErrorTwo");
const genericError = document.getElementById("genericError");

function clearAll() {
  passwordOne.value = "";
  passwordTwo.value = "";
}

const formFields = [
  {
    inputElement: passwordOne,
    errorElement: passwordOneError,
    fieldName: "newPassword",
  },
  {
    inputElement: passwordTwo,
    errorElement: passwordTwoError,
    fieldName: "repeatPassword",
  },
];

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

initFormValidation({
  formElement: resetPasswordForm,
  fields: formFields,
  fullSchema: resetPasswordRealTimeSchema,
  submitButton,
});

async function handleForm(e) {
  e.preventDefault();

  hideError({ element: passwordOneError });
  hideError({ element: passwordTwoError });

  submitButton.disabled = true;

  const p1 = passwordOne.value;
  const p2 = passwordTwo.value;

  if (p1 !== p2) {
    showAndHideError({
      element: genericError,
      text: "Passwords do not match.",
      time: 3000,
      isVisibility: false,
    });
    return;
  }

  try {
    const result = await resetPassword(p1, token);

    if (result) {
      console.log("Success payload received:", result);
      alert("Success! Check your Ethereal inbox for the secure reset link.");
      clearAll();

      window.location.href = "index.html";
    }
  } catch (error) {
    const text = error.validationErrors
      ? error.validationErrors.newPassword
      : error.message;

    showAndHideError({
      element: genericError,
      text: text,
      time: 4000,
      isVisibility: false,
    });
  } finally {
    submitButton.disabled = false;
  }
}
