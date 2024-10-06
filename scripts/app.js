// Global state
const state = {
  data: {},
  tabStyles: {},
  currentSearchQuery: "",
  languageSelect: null,
  searchInput: null,
};

// Import all required modules
import { initializeTabs, activateTab } from "./tabManager.js";
import { initializeI18n, updateUI } from "./i18n.js";
import { initializeSearch, filterContent } from "./search.js";
import { setupTierTooltips } from "./tooltips.js";
import "./tierBonusGenerator.js"; // Import the new tierBonusGenerator.js
import "./languageSelector.js"; // Import the new languageSelector.js

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load global data
    state.data = await (await fetch("scripts/data.json")).json();

    // Store DOM elements in state
    state.languageSelect = document.getElementById("language-select");
    state.searchInput = document.querySelector("#search-input");

    // Initialize all modules
    await initializeTabs(state);
    initializeI18n(state);
    initializeSearch(state);
    setupTierTooltips(state);

    // Initialize UI state from session storage
    const savedTab = sessionStorage.getItem("selectedTab");
    const tabs = document.querySelectorAll(".shop-nav button");
    const firstTab = savedTab ? document.querySelector(`.shop-nav button[data-tab="${savedTab}"]`) : tabs[0];

    const savedLang = sessionStorage.getItem("selectedLanguage");
    if (savedLang) {
      state.languageSelect.value = savedLang;
    }

    // Restore saved search query if it exists
    const savedSearch = sessionStorage.getItem("searchQuery");
    if (savedSearch) {
      state.searchInput.value = savedSearch;
      state.currentSearchQuery = savedSearch;
    }

    activateTab(firstTab, state);
    updateUI(state);
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

export { state };
