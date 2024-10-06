import { updateSearchPlaceholder, filterContent } from "./search.js";

function initializeI18n(state) {
  state.languageSelect.addEventListener("change", () => {
    const selectedLang = state.languageSelect.value;
    sessionStorage.setItem("selectedLanguage", selectedLang);
    updateUI(state);
  });
}

function updateUI(state) {
  updateTabNames(state);
  updateSearchPlaceholder(state);
  const activeContent = document.querySelector(".shop-content.active");
  updateContent(activeContent, state);
  filterContent(activeContent, state);
  updateSidebarInfo(state);
}

function updateTabNames(state) {
  const lang = state.languageSelect.value;
  document.querySelectorAll(".shop-nav .shop-name").forEach((el) => {
    const tabName = el.closest("button").dataset.tab;
    el.textContent = state.data.main?.tabNames?.[tabName]?.[lang] || el.dataset.originalText;
  });
}

function updateContent(container, state) {
  if (!container) return;

  const lang = state.languageSelect.value;
  const { gc, main } = state.data;

  // Update ability labels
  container.querySelectorAll(".ability .label").forEach((label) => {
    const upgradeKey = label.getAttribute("data-original-text");

    if (!upgradeKey) {
      console.warn("No data-original-text attribute found for label:", label.textContent);
      return;
    }

    // Look up the translation in the gc object
    if (gc && gc[upgradeKey] && gc[upgradeKey][lang]) {
      label.textContent = gc[upgradeKey][lang];
    } else {
      console.warn(`Translation not found for ${upgradeKey} in language ${lang}`);
      // Keep the existing text if no translation is found
    }
  });

  // Update active/new labels
  ["active", "new"].forEach((type) => {
    const labelKey = type === "active" ? "activeLabel" : "newLabel";
    const labelText = main?.labels?.[type]?.[lang] || "";

    container.querySelectorAll(`.${type}-item`).forEach((item) => {
      item.dataset[labelKey] = labelText;
    });
    document.documentElement.style.setProperty(`--${type}-label`, `"${labelText}"`);
  });
}

function updateSidebarInfo(state) {
  const lang = state.languageSelect.value;
  const sidebarInfo = state.data.main?.sidebarInfo;

  if (sidebarInfo) {
    const sidebarInfoElement = document.querySelector(".sidebar-info");
    if (sidebarInfoElement) {
      const title = sidebarInfo.title?.[lang] || "Browse Items";
      const desc = sidebarInfo.desc?.[lang] || "Browse through the item catalog to get yourself ready for your next match!";

      sidebarInfoElement.querySelector("span").textContent = title;
      sidebarInfoElement.querySelector("div").textContent = desc;
    }
  }
}

export { initializeI18n, updateUI, updateContent };
