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
  updateSearchPlaceholder(state);
  filterContent(document.querySelector(".shop-content.active"), state);
}

export function updateTranslations(state) {
  const lang = state.elements.languageSelect.value;
  const { gc, main, attributes } = state.data;

  document.querySelectorAll("[data-original-text]").forEach((element) => {
    const key = element.getAttribute("data-original-text");
    const translation = getTranslation(key, lang, gc, main, attributes);
    if (translation) {
      element.textContent = translation;
    } else {
      console.warn(`Translation not found for ${key} in ${lang}`);
    }
  });

  updateSpecialLabels(state, lang);
}

// Export this function so it can be used by other modules
export function getTranslation(key, lang, gc, main, attributes) {
  return gc?.[key]?.[lang] || main?.[key]?.[lang] || attributes?.[key]?.[lang] || null;
}

function updateSpecialLabels(state, lang) {
  ["active", "new"].forEach((type) => {
    const labelKey = `item_info_${type}`;
    const labelText = state.data.main?.[labelKey]?.[lang] || "";
    document.documentElement.style.setProperty(`--${type}-label`, `"${labelText}"`);
  });
}

function updateSearchPlaceholder(state) {
  const lang = state.elements.languageSelect.value;
  state.elements.searchInput.placeholder = state.data.main?.CitadelShopSearch?.[lang] || state.elements.searchInput.dataset.originalPlaceholder;
}

function populateLanguageSelect(state) {
  const languages = extractLanguages(state.data);
  const selectElement = state.elements.languageSelect;

  selectElement.innerHTML = languages.map((language) => `<option value="${language.toLowerCase()}">${language.charAt(0).toUpperCase() + language.slice(1)}</option>`).join("");
}

function extractLanguages(data) {
  const languages = new Set();

  function traverse(obj) {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Object.keys(obj[key]).every((k) => typeof obj[key][k] === "string")) {
          Object.keys(obj[key]).forEach((lang) => languages.add(lang));
        } else {
          traverse(obj[key]);
        }
      }
    }
  }

  traverse(data);
  return Array.from(languages);
}
