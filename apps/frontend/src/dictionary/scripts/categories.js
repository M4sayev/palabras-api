import { apiFetch } from "@/auth/scripts/auth.js";

const BASE_URL = "/api/v1/dictionary";

async function fetchCategories() {
  try {
    const response = await apiFetch(`${BASE_URL}/categories`);
    if (!response.ok) {
      console.error("Failed to fetch categories");
      return [];
    }
    const data = await response.json();
    return data.data ?? [];
  } catch (error) {
    console.error("Error fetching categories", error);
    return [];
  }
}

function populateCategorySelects(categories) {
  const catInput = document.getElementById("cat");
  const categorySelect = document.getElementById("categorySelect");

  catInput.innerHTML = '<option value="">All categories</option>';
  for (const cat of categories) {
    const opt = document.createElement("option");
    opt.value = cat.category_id;
    opt.textContent = cat.name;
    catInput.appendChild(opt);
  }

  categorySelect.innerHTML =
    '<option value="" disabled selected>Choose a category</option>';
  for (const cat of categories) {
    const opt = document.createElement("option");
    opt.value = cat.category_id;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  }
}

async function loadCategories() {
  const categories = await fetchCategories();
  populateCategorySelects(categories);
  return categories;
}

export { fetchCategories, populateCategorySelects, loadCategories };
