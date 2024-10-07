import { filterContent } from "./search.js";

export function initI18n(state) {
  populateLanguageSelect(state);
  state.elements.languageSelect.addEventListener("change", () => {
    sessionStorage.setItem("selectedLanguage", state.elements.languageSelect.value);
    updateUI(state);
  });
}

export function updateUI(state) {
  updateTranslations(state);
  filterContent(document.querySelector(".shop-content.active"), state);
}

export function getTranslation(key, lang, data = {}) {
  const { gc, main, attributes } = data;
  return gc?.[key]?.[lang] || main?.[key]?.[lang] || attributes?.[key]?.[lang] || null;
}

export function updateTranslations(state) {
  const lang = state.elements.languageSelect.value;

  // Update all elements with data-text, including dynamic content
  document.querySelectorAll("[data-text]").forEach((element) => {
    const key = element.getAttribute("data-text");
    const translation = getTranslation(key, lang, state.data);
    if (translation) {
      element.textContent = translation;
    }
  });

  // Update item badges
  ["active", "new"].forEach((type) => {
    const badgeKey = `item_info_${type}`;
    const badgeText = getTranslation(badgeKey, lang, state.data) || "";
    document.documentElement.style.setProperty(`--${type}-badge`, `"${badgeText}"`);
  });

  // Update search placeholder
  state.elements.searchInput.placeholder = getTranslation("CitadelShopSearch", lang, state.data) || state.elements.searchInput.getAttribute("data-text");
}

function populateLanguageSelect(state) {
  const languages = new Set();

  // Extract unique languages from all translation objects
  const traverse = (obj) => {
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === "object") {
        if (Object.values(value).every((v) => typeof v === "string")) {
          Object.keys(value).forEach((lang) => languages.add(lang));
        } else {
          traverse(value);
        }
      }
    }
  };

  traverse(state.data);

  // Populate select element
  state.elements.languageSelect.innerHTML = Array.from(languages)
    .map((lang) => `<option value="${lang.toLowerCase()}">${lang.charAt(0).toUpperCase() + lang.slice(1)}</option>`)
    .join("");
}
