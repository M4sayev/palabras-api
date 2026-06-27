export function showAndHideError({
  element,
  text,
  time = 2000,
  isVisibility = true,
}) {
  showError({ element, text, isVisibility });
  hideError({ element, time, isVisibility });
}

export function showError({ element, text, isVisibility = true }) {
  isVisibility
    ? (element.style.visibility = "visible")
    : (element.style.display = "block");

  element.textContent = text;
}

export function hideError({ element, time = 0, isVisibility = true }) {
  setTimeout(() => {
    element.textContent = "";
    isVisibility
      ? (element.style.visibility = "hidden")
      : (element.style.display = "none");
  }, time);
}

export function initFormValidation({
  formElement,
  fields,
  fullSchema,
  submitButton,
}) {
  const checkFormState = () => {
    const formData = new FormData(formElement);

    const formValues = Object.fromEntries(formData.entries());

    const result = fullSchema.safeParse(formValues);
    submitButton.disabled = !result.success;
  };

  fields.forEach(({ inputElement, errorElement, fieldName }) => {
    const fieldSchema = fullSchema.shape[fieldName];

    inputElement.addEventListener("input", (e) => {
      const result = fieldSchema.safeParse(e.target.value);

      if (!result.success) {
        const text = result.error.errors[0].message;
        showError({
          element: errorElement,
          text,
        });
        inputElement.setAttribute("aria-invalid", "true");
      } else {
        hideError({ element: errorElement });
        inputElement.setAttribute("aria-invalid", "false");
      }

      checkFormState();
    });
  });

  checkFormState();
}
