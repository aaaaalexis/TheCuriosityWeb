export async function loadShopItems() {
  try {
    const response = await fetch("https://assets.deadlock-api.com/v1/items?language=english");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return processShopItems(data);
  } catch (error) {
    console.error("Error loading shop items:", error);
    return [];
  }
}

function processShopItems(data) {
  return data
    .filter((item) => item.type === "upgrade" && !item.disabled)
    .sort((a, b) => {
      const aIsActive = a.properties?.ability_cooldown !== 0;
      const bIsActive = b.properties?.ability_cooldown !== 0;
      if (aIsActive === bIsActive) {
        return a.name.localeCompare(b.name);
      }
      return aIsActive ? 1 : -1;
    });
}

export function renderShopItems(items) {
  const shopContents = document.querySelectorAll(".shop-content");
  shopContents.forEach((content) => {
    const tab = content.dataset.tab;
    const tabItems = items.filter((item) => item.item_slot_type === tab);
    content.innerHTML = generateShopHTML(tabItems);
  });
}

const TIER_COSTS = {
  1: "500",
  2: "1,250",
  3: "3,000",
  4: "6,200",
};

function generateShopHTML(items) {
  const tiers = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  // Sort items into their respective tiers
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
            .map(
              (item) => `
            <div class="ability ${item.properties?.ability_cooldown !== 0 ? "active-item" : ""}">
              <div class="ability-icon">
                <img src="${item.image}" />
              </div>
              <div class="ability-name" data-text="${item.class_name}" data-cost="${item.cost}">${item.name}</div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
    )
    .join("");
}
