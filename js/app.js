import { initTabs, activateTab } from "./tabManager.js";
import { initI18n, updateUI } from "./i18n.js";
import { initSearch } from "./search.js";
import { initTierBonus } from "./tierBonus.js";
import { initAbilityInfo } from "./abilityInfo.js";
import { fetchLocalization } from "./fetchLocalization.js";
import { loadShopItems, renderShopItems } from "./shopLoader.js";

const state = {
  data: {},
  tabStyles: {},
  currentSearchQuery: "",
  elements: {},
  shopItems: [],
};

async function init() {
  try {
    // Initialize all required DOM elements first
    state.elements = {
      languageSelect: document.getElementById("language-select"),
      searchInput: document.querySelector("#search-input"),
      tabs: document.querySelectorAll(".shop-tab button"),
      tierBonus: document.querySelector(".tier-bonus"),
    };

    // Validate critical elements
    const criticalElements = ["languageSelect", "searchInput", "tierBonus"];
    const missingElements = criticalElements.filter((elem) => !state.elements[elem]);

    if (missingElements.length > 0) {
      console.error("Critical elements missing:", missingElements);
      return;
    }

    // Show loading state
    document.body.classList.add("loading");

    // Fetch localization data and shop items concurrently
    const [localizationData, shopItems] = await Promise.all([fetchLocalization(), loadShopItems()]);

    state.data = localizationData;
    state.shopItems = shopItems;

    // Initialize features
    await initTabs(state);
    initI18n(state);
    initSearch(state);

    // Restore saved state
    const savedLanguage = sessionStorage.getItem("selectedLanguage") || "english";
    state.elements.languageSelect.value = savedLanguage.toLowerCase();

    // Update UI with saved/default language
    updateUI(state);

    // Render shop items
    renderShopItems(state.shopItems);

    // Initialize tier-bonus and ability-info after language is set
    initTierBonus(state);
    initAbilityInfo(state);

    const savedTab = sessionStorage.getItem("selectedTab");
    const firstTab = savedTab ? document.querySelector(`.shop-tab button[data-tab="${savedTab}"]`) : state.elements.tabs[0];

    state.elements.searchInput.value = sessionStorage.getItem("searchQuery") || "";
    state.currentSearchQuery = state.elements.searchInput.value;

    // Activate initial tab
    if (firstTab) {
      activateTab(firstTab, state);
    }

    // Hide loading state
    document.body.classList.remove("loading");
  } catch (error) {
    console.error("Initialization error:", error);
    // Show error state to user
    document.body.classList.remove("loading");
    document.body.classList.add("error");
  }
}

document.addEventListener("DOMContentLoaded", init);

export { state };
