import { refreshAccessToken } from "@/auth/scripts/auth.js";
import { loadCategories } from "@/dictionary/scripts/categories.js";
import { initWords, fetchAllWords } from "@/dictionary/scripts/words.js";
import { initWordOfTheDay } from "@/dictionary/scripts/wotd.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await refreshAccessToken();
    await loadCategories();
    initWords();
    initWordOfTheDay();
    await fetchAllWords({});
  } catch {
    window.location.href = "/login.html";
  }
});
