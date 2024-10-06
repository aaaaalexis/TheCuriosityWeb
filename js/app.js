import { initTabs, activateTab } from "./tabManager.js";
import { initI18n, updateUI } from "./i18n.js";
import { initSearch } from "./search.js";
import { initTierBonus } from "./tierBonus.js";

const state = {
  data: {},
  tabStyles: {},
  currentSearchQuery: "",
  elements: {},
};

async function init() {
  try {
    // Load data first
    state.data = await (await fetch("json/i18n.json")).json();

    // Initialize all required DOM elements
    state.elements = {
      languageSelect: document.getElementById("language-select"),
      searchInput: document.querySelector("#search-input"),
      tabs: document.querySelectorAll(".shop-tab button"),
      tierBonus: document.querySelector(".tier-bonus"), // Reference to single tierBonus element
    };

    // Validate critical elements
    const criticalElements = ["languageSelect", "searchInput", "tierBonus"];
    const missingElements = criticalElements.filter((elem) => !state.elements[elem]);

    if (missingElements.length > 0) {
      console.error("Critical elements missing:", missingElements);
      return;
    }

    // Initialize features
    await initTabs(state);
    initI18n(state);
    initSearch(state);

    // Restore saved state
    const savedLanguage = sessionStorage.getItem("selectedLanguage") || "english";
    state.elements.languageSelect.value = savedLanguage.toLowerCase();

    // Update UI with saved/default language
    updateUI(state);

    // Initialize tier-bonus after language is set
    initTierBonus(state);

    const savedTab = sessionStorage.getItem("selectedTab");
    const firstTab = savedTab ? document.querySelector(`.shop-tab button[data-tab="${savedTab}"]`) : state.elements.tabs[0];

    state.elements.searchInput.value = sessionStorage.getItem("searchQuery") || "";
    state.currentSearchQuery = state.elements.searchInput.value;

    // Activate initial tab
    if (firstTab) {
      activateTab(firstTab, state);
    }
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

document.addEventListener("DOMContentLoaded", init);

export { state };
