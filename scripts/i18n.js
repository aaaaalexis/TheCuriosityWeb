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
  updateSidebarInfo(state); // Add this line to update sidebar info
}

function updateTabNames(state) {
  const lang = state.languageSelect.value;
  document.querySelectorAll(".shop-nav .shop-name").forEach((el) => {
    const tabName = el.closest("button").dataset.tab;
    el.textContent = state.data.ui?.tabNames?.[tabName]?.[lang] || el.dataset.originalText;
  });
}

function updateContent(container, state) {
  if (!container) return;

  const lang = state.languageSelect.value;
  const { abilities, ui } = state.data;

  // Update ability labels
  container.querySelectorAll(".ability .label").forEach((label) => {
    const originalText = label.dataset.originalText;
    if (abilities && abilities[originalText]) {
      label.textContent = abilities[originalText][lang] || originalText;
    }
  });

  // Update active/new labels
  ["active", "new"].forEach((type) => {
    const labelKey = type === "active" ? "activeLabel" : "newLabel";
    const labelText = ui?.labels?.[type]?.[lang] || "";

    container.querySelectorAll(`.${type}-item`).forEach((item) => (item.dataset[labelKey] = labelText));
    document.documentElement.style.setProperty(`--${type}-label`, `"${labelText}"`);
  });
}

function updateSidebarInfo(state) {
  const lang = state.languageSelect.value;
  const sidebarInfo = state.data.ui?.sidebarInfo;

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
