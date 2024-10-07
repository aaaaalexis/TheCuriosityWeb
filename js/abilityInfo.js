import { getTranslation } from "./i18n.js";

export function initAbilityInfo(state) {
  const abilityInfo = document.querySelector(".ability-info");
  let activeAbilityInfo = null;

  document.addEventListener("mouseover", (e) => {
    const ability = e.target.closest(".ability");
    if (!ability || ability === activeAbilityInfo?.ability) return;

    const nameElement = ability.querySelector(".ability-name");
    if (!nameElement) return;

    const textKey = nameElement.dataset.text;
    const cost = nameElement.dataset.cost;

    // Get all translations for this ability
    const translations = state.data.gc[textKey];
    if (!translations) return;

    // Update ability info content
    updateAbilityInfoContent(abilityInfo, translations, textKey, cost, state);

    showAbilityInfo(abilityInfo, ability);
    activeAbilityInfo = { ability, abilityInfo };
  });

  document.addEventListener("mouseout", (e) => {
    if (!e.target.closest(".ability") && !e.relatedTarget?.closest(".ability")) {
      hideAbilityInfo(abilityInfo);
      activeAbilityInfo = null;
    }
  });

  document.addEventListener(
    "scroll",
    (e) => {
      if (activeAbilityInfo) {
        showAbilityInfo(activeAbilityInfo.abilityInfo, activeAbilityInfo.ability);
      }
    },
    true
  );
}

function updateAbilityInfoContent(abilityInfo, translations, textKey, cost, state) {
  const lang = state.elements.languageSelect.value;

  // Update name and cost
  const infoName = abilityInfo.querySelector(".info-name");
  const translation = getTranslation(textKey, lang, state.data);
  infoName.textContent = translation || translations[Object.keys(translations)[0]]; // Fallback to first translation if needed

  const infoCost = abilityInfo.querySelector(".info-cost");
  infoCost.innerHTML = `<img src="images/hud/icons/icon_soul.svg" /> ${cost}`;

  // Clear all previous .info-language divs
  const languageContainer = abilityInfo.querySelector(".info-language-container");
  languageContainer.innerHTML = "";

  // Add each translation in its own .info-language div
  Object.entries(translations).forEach(([lang, translation]) => {
    const languageDiv = document.createElement("div");
    languageDiv.className = "info-language";
    languageDiv.innerHTML = `
      <div class="info-localized">${lang.charAt(0).toUpperCase() + lang.slice(1)}</div>
      <div class="info-localized-name">${translation}</div>
    `;
    languageContainer.appendChild(languageDiv);
  });
}

function showAbilityInfo(abilityInfo, ability) {
  const containerRect = document.querySelector(".shop-container").getBoundingClientRect();
  const abilityRect = ability.getBoundingClientRect();
  const abilityInfoRect = abilityInfo.getBoundingClientRect();

  // Calculate available space to the right
  const availableSpaceRight = containerRect.right - abilityRect.right - 20; // 20px buffer

  // Default positioning to the right
  let left = abilityRect.right + 10;

  // If not enough space on the right, position to the left
  if (availableSpaceRight < abilityInfoRect.width) {
    left = abilityRect.left - abilityInfoRect.width - 10;
  }

  // Calculate vertical position
  let top = abilityRect.top + (abilityRect.height - abilityInfoRect.height) / 2;

  // Ensure the popup stays within the viewport vertically
  const viewportHeight = window.innerHeight;
  if (top < 0) {
    top = 10;
  } else if (top + abilityInfoRect.height > viewportHeight) {
    top = viewportHeight - abilityInfoRect.height - 10;
  }

  // Add scroll offset to position absolutely in the document
  abilityInfo.style.position = "absolute";
  abilityInfo.style.left = `${left + window.pageXOffset}px`;
  abilityInfo.style.top = `${top + window.pageYOffset}px`;
  abilityInfo.style.display = "flex";
}

function hideAbilityInfo(abilityInfo) {
  abilityInfo.style.display = "none";
}
