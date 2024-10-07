import { getTranslation } from "./i18n.js";

export function initAbilityInfo(state) {
  const abilityInfo = document.querySelector(".ability-info");
  let activeAbilityInfo = null;

  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    initTouchBehavior(abilityInfo, state);
  } else {
    initMouseBehavior(abilityInfo, state);
  }

  document.addEventListener(
    "scroll",
    (e) => {
      if (activeAbilityInfo) {
        showAbilityInfo(activeAbilityInfo.abilityInfo, activeAbilityInfo.ability);
      }
    },
    true
  );

  const infoClose = abilityInfo.querySelector(".info-close");
  if (infoClose) {
    infoClose.addEventListener("click", () => {
      hideAbilityInfo(abilityInfo);
    });
  }
}

function initTouchBehavior(abilityInfo, state) {
  document.addEventListener("click", (e) => {
    const ability = e.target.closest(".ability");

    if (ability) {
      e.preventDefault();
      handleAbilityTouch(ability, abilityInfo, state);
    } else if (!e.target.closest(".ability-info")) {
      hideAbilityInfo(abilityInfo);
    }
  });
}

function initMouseBehavior(abilityInfo, state) {
  let activeAbilityInfo = null;

  document.addEventListener("mouseover", (e) => {
    const ability = e.target.closest(".ability");
    if (!ability || ability === activeAbilityInfo?.ability) return;

    const nameElement = ability.querySelector(".ability-name");
    if (!nameElement) return;

    const textKey = nameElement.dataset.text;
    const cost = nameElement.dataset.cost;

    const translations = state.data.gc[textKey];
    if (!translations) return;

    updateAbilityInfoContent(abilityInfo, translations, textKey, cost, state);
    showAbilityInfo(abilityInfo, ability);
    activeAbilityInfo = { ability, abilityInfo };
  });

  document.addEventListener("mouseover", (e) => {
    if (activeAbilityInfo) {
      const hoveredAbility = e.target.closest(".ability");
      if (!hoveredAbility || hoveredAbility !== activeAbilityInfo.ability) {
        hideAbilityInfo(abilityInfo);
        activeAbilityInfo = null;
      }
    }
  });
}

function handleAbilityTouch(ability, abilityInfo, state) {
  const nameElement = ability.querySelector(".ability-name");
  if (!nameElement) return;

  const textKey = nameElement.dataset.text;
  const cost = nameElement.dataset.cost;

  const translations = state.data.gc[textKey];
  if (!translations) return;

  updateAbilityInfoContent(abilityInfo, translations, textKey, cost, state);
  showAbilityInfoCentered(abilityInfo);
}

function showAbilityInfoCentered(abilityInfo) {
  abilityInfo.style.display = "flex";
  abilityInfo.style.opacity = "1";
  abilityInfo.style.position = "fixed";
  abilityInfo.style.left = "50%";
  abilityInfo.style.top = "50%";
  abilityInfo.style.transform = "translate(-50%, -50%)";
  abilityInfo.style.zIndex = "1000";
}

function updateAbilityInfoContent(abilityInfo, translations, textKey, cost, state) {
  const lang = state.elements.languageSelect.value;

  // Update name and cost
  const infoName = abilityInfo.querySelector(".info-name");
  const translation = getTranslation(textKey, lang, state.data);
  infoName.textContent = translation || translations[Object.keys(translations)[0]];

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
  // Make the popup visible but with zero opacity to measure its dimensions
  abilityInfo.style.display = "flex";
  abilityInfo.style.opacity = "0";

  const containerRect = document.querySelector(".shop-container").getBoundingClientRect();
  const abilityRect = ability.getBoundingClientRect();
  const abilityInfoRect = abilityInfo.getBoundingClientRect();

  // Calculate available space to the right
  const availableSpaceRight = containerRect.right - abilityRect.right - 20; // 20px buffer

  // Determine horizontal position
  let left;
  if (availableSpaceRight >= abilityInfoRect.width) {
    // Position to the right if there's enough space
    left = abilityRect.right + 10;
  } else {
    // Position to the left if there's not enough space on the right
    left = abilityRect.left - abilityInfoRect.width - 10;
  }

  // Calculate vertical position to center both elements
  const abilityCenter = abilityRect.top + abilityRect.height / 2;
  const top = abilityCenter - abilityInfoRect.height / 2;

  // Ensure the popup stays within the viewport vertically
  const viewportHeight = window.innerHeight;
  let finalTop = top;
  if (finalTop < 10) {
    finalTop = 10;
  } else if (finalTop + abilityInfoRect.height > viewportHeight - 10) {
    finalTop = viewportHeight - abilityInfoRect.height - 10;
  }

  // Apply the final position with scroll offset
  abilityInfo.style.position = "absolute";
  abilityInfo.style.left = `${left + window.pageXOffset}px`;
  abilityInfo.style.top = `${finalTop + window.pageYOffset}px`;
  abilityInfo.style.opacity = "1";
}

function hideAbilityInfo(abilityInfo) {
  abilityInfo.style.display = "none";
}
