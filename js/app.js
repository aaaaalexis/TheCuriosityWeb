import { fetchLocalization, loadShopItems } from "./dataManager.js";
import { initUI, updateUI } from "./uiManager.js";
import { initAbilityInfo, initTierBonus } from "./components.js";

const state = {
  data: {},
  currentSearchQuery: "",
  elements: {},
  shopItems: [],
};

async function init() {
  try {
    initElements();

    const [localizationData, shopItems] = await Promise.all([fetchLocalization(), loadShopItems()]);

    state.data = localizationData;
    state.shopItems = shopItems;

    initUI(state);
    initAbilityInfo(state);
    initTierBonus(state);

    restoreSavedState();
    updateUI(state);
    activateInitialTab();
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

function initElements() {
  state.elements = {
    languageSelect: document.getElementById("language-select"),
    searchInput: document.querySelector("#search-input"),
    tabs: document.querySelectorAll(".shop-tab button"),
    tierBonus: document.querySelector(".tier-bonus"),
  };

  const missingElements = validateCriticalElements();
  if (missingElements.length > 0) {
    throw new Error(`Critical elements missing: ${missingElements.join(", ")}`);
  }
}

function validateCriticalElements() {
  const criticalElements = ["languageSelect", "searchInput", "tierBonus"];
  return criticalElements.filter((elem) => !state.elements[elem]);
}

function restoreSavedState() {
  const savedLanguage = sessionStorage.getItem("selectedLanguage") || "english";
  state.elements.languageSelect.value = savedLanguage.toLowerCase();

  state.elements.searchInput.value = sessionStorage.getItem("searchQuery") || "";
  state.currentSearchQuery = state.elements.searchInput.value;
}

function activateInitialTab() {
  const savedTab = sessionStorage.getItem("selectedTab");
  const firstTab = savedTab ? document.querySelector(`.shop-tab button[data-tab="${savedTab}"]`) : state.elements.tabs[0];

  if (firstTab) {
    activateTab(firstTab);
  }
}

export function activateTab(btn) {
  const tab = btn.dataset.tab;
  const tabElement = document.querySelector(`.shop-content[data-tab="${tab}"]`);

  document.querySelectorAll(".shop-tab button, .shop-content").forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");
  tabElement.classList.add("active");

  sessionStorage.setItem("selectedTab", tab);
  document.documentElement.style.setProperty("--tab-color", getComputedStyle(btn).getPropertyValue("--tab-color"));
  document.documentElement.style.setProperty("--tier-bonus-color", getComputedStyle(tabElement).getPropertyValue("--tier-bonus-color"));

  updateUI(state);
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  if (state.elements.tabs) {
    state.elements.tabs.forEach((btn) => btn.addEventListener("click", () => activateTab(btn)));
  }
});

export { state };
