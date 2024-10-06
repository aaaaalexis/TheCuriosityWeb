import { updateContent } from "./i18n.js";
import { filterContent } from "./search.js";

async function initializeTabs(state) {
  const tabs = document.querySelectorAll(".shop-nav button");

  // Load tab content and styles
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

  // Add click listeners
  tabs.forEach((btn) => btn.addEventListener("click", () => activateTab(btn, state)));
}

function activateTab(btn, state) {
  // Remove active class from all tabs and content
  document.querySelectorAll(".shop-nav button, .shop-content").forEach((el) => el.classList.remove("active"));

  // Activate selected tab
  btn.classList.add("active");
  const tab = btn.dataset.tab;
  const content = document.querySelector(`.shop-content[data-tab="${tab}"]`);
  content.classList.add("active");

  // Update session storage and styles
  sessionStorage.setItem("selectedTab", tab);
  document.documentElement.style.setProperty("--tab-color", getComputedStyle(btn).getPropertyValue("--tab-color"));

  // Update tab-specific styles
  updateTabStyles(tab, state.tabStyles);

  // Update content and apply current search filter
  updateContent(content, state);
  filterContent(content, state);
}

function updateTabStyles(tab, tabStyles) {
  document.getElementById("dynamic-tab-style")?.remove();
  if (tabStyles[tab]) {
    const style = document.createElement("style");
    style.id = "dynamic-tab-style";
    style.textContent = tabStyles[tab];
    document.head.appendChild(style);
  }
}

export { initializeTabs, activateTab };
