import { state } from "./app.js";

export function initUI(state) {
  initLanguageSelect(state);
  initSearch(state);
}

function initLanguageSelect(state) {
  state.elements.languageSelect.addEventListener("change", () => {
    sessionStorage.setItem("selectedLanguage", state.elements.languageSelect.value);
    updateUI(state);
  });
}

function initSearch(state) {
  const { searchInput } = state.elements;
  searchInput.dataset.originalPlaceholder = searchInput.placeholder;
  searchInput.addEventListener("input", () => {
    state.currentSearchQuery = searchInput.value.toLowerCase().trim();
    sessionStorage.setItem("searchQuery", state.currentSearchQuery);
    filterContent(document.querySelector(".shop-content.active"), state);
  });
}

export function updateUI(state) {
  updateTranslations(state);
  renderShopItems(state.shopItems, state);
  filterContent(document.querySelector(".shop-content.active"), state);
}

function updateTranslations(state) {
  const lang = state.elements.languageSelect.value;

  document.querySelectorAll("[data-text]").forEach((element) => {
    const key = element.getAttribute("data-text");
    const translation = getTranslation(key, lang, state.data);
    if (translation) {
      element.textContent = translation;
    }
  });

  updateItemBadges(state, lang);
  updateSearchPlaceholder(state, lang);
}

function updateItemBadges(state, lang) {
  const type = "active";
  const badgeKey = `item_info_${type}`;
  const badgeText = getTranslation(badgeKey, lang, state.data) || "";
  document.documentElement.style.setProperty(`--${type}-badge`, `"${badgeText}"`);
}

function updateSearchPlaceholder(state, lang) {
  const searchPlaceholder = getTranslation("CitadelShopSearch", lang, state.data);
  if (searchPlaceholder) {
    state.elements.searchInput.placeholder = searchPlaceholder;
  }
}

export function getTranslation(key, lang, data = {}) {
  return data[key]?.[lang] || null;
}

function filterContent(container, state) {
  if (!container) return;

  container.querySelectorAll(".tier").forEach((tier) => {
    let hasMatch = false;
    tier.querySelectorAll(".ability").forEach((ability) => {
      const label = ability.querySelector(".ability-name");
      const text = label?.dataset.text;
      const abilityData = state.data[text];
      const matches = !state.currentSearchQuery || (abilityData && Object.values(abilityData).some((name) => name.toLowerCase().includes(state.currentSearchQuery)));

      ability.style.display = matches ? "" : "none";
      hasMatch = hasMatch || matches;
    });

    tier.style.display = hasMatch ? "" : "none";
  });
}

const TIER_COSTS = {
  1: "500",
  2: "1,250",
  3: "3,000",
  4: "6,200",
};

function renderShopItems(items, state) {
  const shopContents = document.querySelectorAll(".shop-content");
  shopContents.forEach((content) => {
    const tab = content.dataset.tab;
    const tabItems = items.filter((item) => item.item_slot_type === tab);
    content.innerHTML = generateShopHTML(tabItems);
  });
}

function generateShopHTML(items) {
  const tiers = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  items.forEach((item) => {
    if (item.tier >= 1 && item.tier <= 4) {
      tiers[item.tier].push(item);
    }
  });

  return Object.entries(tiers)
    .map(
      ([tier, tierItems]) => `
    <div class="tier t${tier}">
      <div class="tier-cost">
        <span>
          <img src="images/hud/icons/icon_soul.svg" />
          ${TIER_COSTS[tier]}${tier >= 3 ? "+" : ""}
        </span>
      </div>
      <div class="ability-container">
        ${tierItems
          .map((item) => {
            const nameKey = item.class_name;
            const translatedName = getTranslation(nameKey, state.elements.languageSelect.value, state.data) || item.name;

            return `
            <div class="ability ${item.properties?.ability_cooldown !== 0 ? "active-item" : ""}">
              <div class="ability-icon">
                <img src="${item.image}" />
              </div>
              <div class="ability-name" data-text="${item.class_name}" data-cost="${item.cost}">${translatedName}</div>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `
    )
    .join("");
}
