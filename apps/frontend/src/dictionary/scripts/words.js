import { apiFetch } from "@/auth/scripts/auth.js";

const BASE_URL = "/api/v1/dictionary";

const wordList = document.getElementById("wordList");

const searchForm = document.getElementById("searchForm");
const searchInput = searchForm.querySelector("input[id='search']");
const catInput = document.getElementById("cat");

const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
const selectionCount = document.getElementById("selectionCount");

const deleteSelectedDialog = document.getElementById("deleteSelectedDialog");
const cancelBulkDeleteBtn = document.getElementById("cancelBulkDeleteBtn");
const confirmBulkDeleteBtn = document.getElementById("confirmBulkDeleteBtn");
const bulkDeleteCountLabel = document.getElementById("bulkDeleteCountLabel");

const wordFormCard = document.getElementById("wordFormCard");
const wordFormTitle = document.getElementById("wordFormTitle");
const wordForm = document.getElementById("wordForm");
const wordFormError = document.getElementById("wordFormError");
const wordIdField = document.getElementById("wordId");
const wordInput = document.getElementById("wordInput");
const categorySelect = document.getElementById("categorySelect");
const definitionInput = document.getElementById("definitionInput");
const exampleInput = document.getElementById("exampleInput");
const wordFormSubmitBtn = document.getElementById("wordFormSubmitBtn");
const wordFormCancelBtn = document.getElementById("wordFormCancelBtn");

const palette = [
  { bg: "var(--clr-blue-soft)", border: "var(--clr-blue-dark)", text: "white" },
  { bg: "var(--clr-red-dark)", border: "var(--clr-red-dark)", text: "white" },
  { bg: "var(--clr-pink)", border: "var(--clr-dark)", text: "white" },
  { bg: "var(--clr-accent)", border: "var(--clr-dark)", text: "white" },
];
const categoryColorById = new Map();

function colorForCategory(categoryId) {
  if (!categoryColorById.has(categoryId)) {
    const idx = categoryColorById.size % palette.length;
    categoryColorById.set(categoryId, palette[idx]);
  }
  return categoryColorById.get(categoryId);
}

const selectedIds = new Set();

function updateSelectionUI() {
  const count = selectedIds.size;
  selectionCount.textContent = String(count);
  deleteSelectedBtn.disabled = count === 0;
}

async function generateWord(word) {
  if (!word) return null;
  const li = document.createElement("li");
  li.setAttribute("class", "dictionary__word");
  li.dataset.wordId = word.word_id;

  const { bg, border, text } = colorForCategory(word.category_id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "word__select";
  checkbox.setAttribute("aria-label", `Select ${word.word} for deletion`);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      selectedIds.add(word.word_id);
      li.classList.add("is-selected");
    } else {
      selectedIds.delete(word.word_id);
      li.classList.remove("is-selected");
    }
    updateSelectionUI();
  });

  const span = document.createElement("span");
  span.setAttribute("class", "word__category");
  span.style.borderColor = border;
  span.style.backgroundColor = bg;
  span.style.color = text;
  span.textContent = word?.category_name ?? "category";

  const h2 = document.createElement("h2");
  h2.textContent = word?.word ?? "Word";

  const p = document.createElement("p");
  p.textContent = word?.definition ?? "definition of the word";

  const p2 = document.createElement("div");
  p2.setAttribute("class", "word__example");
  p2.textContent = word?.example_sentence ?? "";

  const actions = document.createElement("div");
  actions.className = "word__actions";

  const editBtn = document.createElement("button");
  editBtn.setAttribute("class", "std-btn word__edit-btn");
  editBtn.textContent = "Edit";
  editBtn.setAttribute("type", "button");
  editBtn.setAttribute("aria-label", `Edit word ${word.word}`);
  editBtn.addEventListener("click", () => enterEditMode(word));

  const deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("class", "std-btn std-btn--danger word__delete-btn");
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute("type", "button");
  deleteBtn.setAttribute("aria-label", `Delete word ${word.word}`);
  deleteBtn.addEventListener("click", async () => {
    const result = await deleteWord(word.word_id);
    if (result) {
      selectedIds.delete(word.word_id);
      updateSelectionUI();
      li.remove();
    } else {
      console.log("error deleting the word");
    }
  });

  actions.append(editBtn, deleteBtn);
  li.append(checkbox, span, h2, p, p2, actions);

  return li;
}

async function deleteWord(id) {
  try {
    const response = await apiFetch(`${BASE_URL}/words/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      console.error(`Failed to delete word ${id}`);
      return false;
    }
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.log("Error deleting the word", error);
    return false;
  }
}

async function deleteWordsBulk(ids) {
  try {
    const response = await apiFetch(`${BASE_URL}/words`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      console.error("Failed to bulk delete words");
      return null;
    }

    return await response.json();
  } catch (error) {
    console.log("Error bulk deleting words", error);
    return null;
  }
}

async function fetchAllWords({ category = "", search = "" }) {
  try {
    const response = await apiFetch(
      `${BASE_URL}/words?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`,
    );

    if (!response.ok) {
      console.error("Failed to fetch words");
      return;
    }

    const data = await response.json();

    if (!data.success) {
      console.log("Error fetching data");
      return;
    }

    wordList.innerHTML = "";
    selectedIds.clear();
    updateSelectionUI();

    if (data.data.length === 0) {
      const empty = document.createElement("p");
      empty.className = "dictionary__empty";
      empty.textContent = "No words found.";
      wordList.appendChild(empty);
      return;
    }

    for (const word of data.data) {
      const wordHTML = await generateWord(word);
      wordList.appendChild(wordHTML);
    }
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
}

function showFormError(message) {
  wordFormError.textContent = message;
  wordFormError.dataset.visible = "true";
}

function clearFormError() {
  wordFormError.textContent = "";
  wordFormError.dataset.visible = "false";
}

function resetForm() {
  wordForm.reset();
  wordIdField.value = "";
  wordFormTitle.textContent = "Add a word";
  wordFormSubmitBtn.textContent = "Add word";
  wordFormCancelBtn.hidden = true;
  wordFormCard.classList.remove("is-editing");
  clearFormError();
}

function enterEditMode(word) {
  wordIdField.value = word.word_id;
  wordInput.value = word.word;
  categorySelect.value = word.category_id;
  definitionInput.value = word.definition ?? "";
  exampleInput.value = word.example_sentence ?? "";

  wordFormTitle.textContent = `Edit "${word.word}"`;
  wordFormSubmitBtn.textContent = "Save changes";
  wordFormCancelBtn.hidden = false;
  wordFormCard.classList.add("is-editing");
  clearFormError();

  wordFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
  wordInput.focus();
}

function initWords() {
  wordFormCancelBtn.addEventListener("click", resetForm);

  wordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormError();

    const payload = {
      word: wordInput.value.trim(),
      category_id: Number(categorySelect.value),
      definition: definitionInput.value.trim(),
      example_sentence: exampleInput.value.trim(),
    };

    if (
      !payload.word ||
      !payload.category_id ||
      !payload.definition ||
      !payload.example_sentence
    ) {
      showFormError("Please fill in every field.");
      return;
    }

    const editingId = wordIdField.value;
    wordFormSubmitBtn.disabled = true;

    try {
      const response = editingId
        ? await apiFetch(`${BASE_URL}/words/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await apiFetch(`${BASE_URL}/words`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showFormError(data.message || "Something went wrong saving this word.");
        return;
      }

      resetForm();
      await fetchAllWords({
        category: catInput.value,
        search: searchInput.value,
      });
    } catch (error) {
      console.error("Error saving word", error);
      showFormError("Something went wrong saving this word.");
    } finally {
      wordFormSubmitBtn.disabled = false;
    }
  });

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await fetchAllWords({ category: catInput.value, search: searchInput.value });
  });

  deleteSelectedBtn.addEventListener("click", () => {
    if (selectedIds.size === 0) return;
    bulkDeleteCountLabel.textContent = String(selectedIds.size);
    deleteSelectedDialog.showModal();
  });

  cancelBulkDeleteBtn.addEventListener("click", () => {
    deleteSelectedDialog.close();
  });

  confirmBulkDeleteBtn.addEventListener("click", async () => {
    confirmBulkDeleteBtn.disabled = true;
    confirmBulkDeleteBtn.textContent = "Deleting...";

    const ids = Array.from(selectedIds);
    const result = await deleteWordsBulk(ids);

    confirmBulkDeleteBtn.disabled = false;
    confirmBulkDeleteBtn.textContent = "Delete selected";
    deleteSelectedDialog.close();

    if (result) {
      for (const id of ids) {
        const li = wordList.querySelector(`[data-word-id="${id}"]`);
        li?.remove();
        selectedIds.delete(id);
      }
      updateSelectionUI();

      if (wordList.children.length === 0) {
        const empty = document.createElement("p");
        empty.className = "dictionary__empty";
        empty.textContent = "No words found.";
        wordList.appendChild(empty);
      }
    } else {
      console.log("Bulk delete failed");
    }
  });
}

export { initWords, fetchAllWords };
