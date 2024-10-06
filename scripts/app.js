import { initTabs, activateTab } from "./tabManager.js";
import { initI18n, updateUI } from "./i18n.js";
import { initSearch } from "./search.js";
import { initTooltips } from "./tooltips.js";

const state = {
  data: {},
  tabStyles: {},
  currentSearchQuery: "",
  elements: {},
};

async function init() {
  try {
    // Load data first
    state.data = await (await fetch("scripts/data.json")).json();

    // Initialize all required DOM elements
    state.elements = {
      languageSelect: document.getElementById("language-select"),
      searchInput: document.querySelector("#search-input"),
      tabs: document.querySelectorAll(".shop-nav button"),
      tierBonusContainer: document.querySelector(".tier-bonus-container"),
    };

    // Validate critical elements
    if (!state.elements.tierBonusContainer) {
      console.error("Critical element missing: tier-bonus-container");
      return;
    }

    // Initialize features
    await initTabs(state);
    initI18n(state);
    initSearch(state);
    initTooltips(state); // This will now generate the tooltips HTML

    // Restore saved state
    const savedTab = sessionStorage.getItem("selectedTab");
    const firstTab = savedTab ? document.querySelector(`.shop-nav button[data-tab="${savedTab}"]`) : state.elements.tabs[0];

    const savedLanguage = sessionStorage.getItem("selectedLanguage") || "english";
    state.elements.languageSelect.value = savedLanguage.toLowerCase();

    state.elements.searchInput.value = sessionStorage.getItem("searchQuery") || "";
    state.currentSearchQuery = state.elements.searchInput.value;

    // Activate initial tab
    if (firstTab) {
      activateTab(firstTab, state);
    }

    updateUI(state);
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

document.addEventListener("DOMContentLoaded", init);

export { state };
