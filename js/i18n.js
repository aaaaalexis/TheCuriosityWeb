import { filterContent } from "./search.js";

export function initI18n(state) {
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
  return data[key]?.[lang] || null;
}

export function updateTranslations(state) {
  const lang = state.elements.languageSelect.value;

  // Update all elements with data-text
  document.querySelectorAll("[data-text]").forEach((element) => {
    const key = element.getAttribute("data-text");
    const translation = getTranslation(key, lang, state.data);
    if (translation) {
      element.textContent = translation;
    }
  });

  // Update item badges
  const type = "active";
  const badgeKey = `item_info_${type}`;
  const badgeText = getTranslation(badgeKey, lang, state.data) || "";
  document.documentElement.style.setProperty(`--${type}-badge`, `"${badgeText}"`);

  // Update search placeholder
  const searchPlaceholder = getTranslation("CitadelShopSearch", lang, state.data);
  if (searchPlaceholder) {
    state.elements.searchInput.placeholder = searchPlaceholder;
  }
}
