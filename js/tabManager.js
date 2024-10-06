import { updateUI } from "./i18n.js";

export async function initTabs(state) {
  const { tabs } = state.elements;

  await Promise.all(
    [...tabs].map(async (btn) => {
      const tab = btn.dataset.tab;
      const content = await (await fetch(`../html/type_${tab}.html`)).text();
      const tabContent = document.querySelector(`.shop-content[data-tab="${tab}"]`);
      tabContent.innerHTML = content;
      const style = tabContent.querySelector("style");
      if (style) {
        state.tabStyles[tab] = style.textContent;
        style.remove();
      }
    })
  );

  tabs.forEach((btn) => btn.addEventListener("click", () => activateTab(btn, state)));
}

export function activateTab(btn, state) {
  document.querySelectorAll(".shop-nav button, .shop-content").forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");
  const tab = btn.dataset.tab;
  document.querySelector(`.shop-content[data-tab="${tab}"]`).classList.add("active");

  sessionStorage.setItem("selectedTab", tab);
  document.documentElement.style.setProperty("--tab-color", getComputedStyle(btn).getPropertyValue("--tab-color"));

  updateTabStyles(tab, state.tabStyles);
  updateUI(state);
}

function updateTabStyles(tab, tabStyles) {
  document.getElementById("dynamic-tab-style")?.remove();
  if (tabStyles[tab]) {
    const style = document.createElement("style");
    style.id = "dynamic-tab-style";
    style.textContent = tabStyles[tab];
    document.head.appendChild(style);
  }

  const tabElement = document.querySelector(`.shop-content[data-tab="${tab}"]`);
  if (tabElement) {
    document.body.style.setProperty("--tier-bonus-color", getComputedStyle(tabElement).getPropertyValue("--tier-bonus-color"));
  }
}
