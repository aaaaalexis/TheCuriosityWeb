import { updateSearchPlaceholder, filterContent } from "./search.js";

function initializeI18n(state) {
  state.languageSelect.addEventListener("change", () => {
    const selectedLang = state.languageSelect.value;
    sessionStorage.setItem("selectedLanguage", selectedLang);
    updateUI(state);
  });
}

function updateUI(state) {
  updateTranslations(state);
  updateSearchPlaceholder(state);
  const activeContent = document.querySelector(".shop-content.active");
  filterContent(activeContent, state);
}

function updateTranslations(state) {
  const lang = state.languageSelect.value;
  const { gc, main, attributes } = state.data;

  // Select all elements with data-original-text attribute
  document.querySelectorAll("[data-original-text]").forEach((element) => {
    const key = element.getAttribute("data-original-text");
    let translation = getTranslation(key, lang, gc, main, attributes);

    // Update text content if translation found
    if (translation) {
      element.textContent = translation;
    } else {
      console.warn(`Translation not found for ${key} in language ${lang}`);
    }
  });

  // Handle active/new labels
  updateSpecialLabels(state, lang);
}
function getTranslation(key, lang, gc, main, attributes) {
  // Check in gc translations first (for abilities)
  if (gc?.[key]?.[lang]) {
    return gc[key][lang];
  }
  // Check in main translations
  else if (main?.[key]?.[lang]) {
    return main[key][lang];
  }
  // Check in attributes translations
  else if (attributes?.[key]?.[lang]) {
    return attributes[key][lang];
  }

  return null; // No translation found
}

function updateSpecialLabels(state, lang) {
  const { main } = state.data;

  // Update active/new labels CSS variables
  ["active", "new"].forEach((type) => {
    const labelKey = `item_info_${type}`;
    const labelText = main?.[labelKey]?.[lang] || "";

    // Update CSS variable
    document.documentElement.style.setProperty(`--${type}-label`, `"${labelText}"`);
  });
}

export { initializeI18n, updateUI, updateTranslations };
