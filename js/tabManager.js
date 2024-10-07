import { updateUI } from "./i18n.js";
import { renderShopItems } from "./shopLoader.js";

export async function initTabs(state) {
  const { tabs } = state.elements;

  tabs.forEach((btn) => btn.addEventListener("click", () => activateTab(btn, state)));
}

export function activateTab(btn, state) {
  const tab = btn.dataset.tab;
  const tabElement = document.querySelector(`.shop-content[data-tab="${tab}"]`);

  document.querySelectorAll(".shop-tab button, .shop-content").forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");
  tabElement.classList.add("active");

  sessionStorage.setItem("selectedTab", tab);
  document.documentElement.style.setProperty("--tab-color", getComputedStyle(btn).getPropertyValue("--tab-color"));
  document.documentElement.style.setProperty("--tier-bonus-color", getComputedStyle(tabElement).getPropertyValue("--tier-bonus-color"));

  renderShopItems(state.shopItems);
  updateUI(state);
}
