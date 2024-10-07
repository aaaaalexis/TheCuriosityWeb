import { getTranslation } from "./uiManager.js";

export function initAbilityInfo(state) {
  const abilityInfo = document.querySelector(".ability-info");
  let activeAbilityInfo = null;

  const isSmallViewport = window.matchMedia("(max-width: 1440px)").matches;

  if (isSmallViewport) {
    initSmallViewportBehavior(abilityInfo, state);
  } else {
    initLargeViewportBehavior(abilityInfo, state);
  }

  document.addEventListener(
    "scroll",
    () => {
      if (activeAbilityInfo) {
        showAbilityInfo(activeAbilityInfo.abilityInfo, activeAbilityInfo.ability);
      }
    },
    true
  );

  const infoClose = abilityInfo.querySelector(".info-close");
  if (infoClose) {
    infoClose.addEventListener("click", () => hideAbilityInfo(abilityInfo));
  }
}

function initSmallViewportBehavior(abilityInfo, state) {
  document.addEventListener("click", (e) => {
    const ability = e.target.closest(".ability");
    if (ability) {
      e.preventDefault();
      handleAbilityClick(ability, abilityInfo, state);
    } else if (!e.target.closest(".ability-info")) {
      hideAbilityInfo(abilityInfo);
    }
  });
}

function initLargeViewportBehavior(abilityInfo, state) {
  let activeAbilityInfo = null;

  document.addEventListener("mouseover", (e) => {
    const ability = e.target.closest(".ability");
    if (!ability || ability === activeAbilityInfo?.ability) return;

    const nameElement = ability.querySelector(".ability-name");
    if (!nameElement) return;

    const textKey = nameElement.dataset.text;
    const cost = nameElement.dataset.cost;

    if (!state.data[textKey]) return;

    updateAbilityInfoContent(abilityInfo, textKey, cost, state);
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

function handleAbilityClick(ability, abilityInfo, state) {
  const nameElement = ability.querySelector(".ability-name");
  if (!nameElement) return;

  const textKey = nameElement.dataset.text;
  const cost = nameElement.dataset.cost;

  if (!state.data[textKey]) return;

  updateAbilityInfoContent(abilityInfo, textKey, cost, state);
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

function updateAbilityInfoContent(abilityInfo, textKey, cost, state) {
  const lang = state.elements.languageSelect.value;

  const infoName = abilityInfo.querySelector(".info-name");
  const translation = getTranslation(textKey, lang, state.data);
  infoName.textContent = translation || textKey;

  const infoCost = abilityInfo.querySelector(".info-cost");
  infoCost.innerHTML = `<img src="images/hud/icons/icon_soul.svg" /> ${cost}`;

  const languageContainer = abilityInfo.querySelector(".info-language-container");
  languageContainer.innerHTML = "";

  const translations = state.data[textKey];
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
  abilityInfo.style.display = "flex";
  abilityInfo.style.opacity = "0";

  const containerRect = document.querySelector(".shop-container").getBoundingClientRect();
  const abilityRect = ability.getBoundingClientRect();
  const abilityInfoRect = abilityInfo.getBoundingClientRect();

  const availableSpaceRight = containerRect.right - abilityRect.right - 20;

  let left = availableSpaceRight >= abilityInfoRect.width ? abilityRect.right + 20 : abilityRect.left - abilityInfoRect.width - 20;

  const abilityCenter = abilityRect.top + abilityRect.height / 2;
  let top = abilityCenter - abilityInfoRect.height / 2;

  const viewportHeight = window.innerHeight;
  let finalTop = Math.max(10, Math.min(top, viewportHeight - abilityInfoRect.height - 10));

  abilityInfo.style.position = "absolute";
  abilityInfo.style.left = `${left + window.pageXOffset}px`;
  abilityInfo.style.top = `${finalTop + window.pageYOffset}px`;
  abilityInfo.style.opacity = "1";
}

function hideAbilityInfo(abilityInfo) {
  abilityInfo.style.display = "none";
}

export function initTierBonus(state) {
  const tierBonus = document.querySelector(".tier-bonus");
  let activeTierBonus = null;

  const bonusConfigs = {
    weapon: {
      values: ["+6%", "+10%", "+14%", "+18%"],
      icon: "images/extra/icon_damage_force.svg",
      text: "WeaponPower_label",
    },
    vitality: {
      values: ["+11%", "+14%", "+17%", "+20%"],
      icon: "images/extra/icon_fave_active.svg",
      text: "ArmorPower_label",
    },
    spirit: {
      values: ["+4", "+8", "+12", "+16"],
      icon: "images/extra/icon_spirit.svg",
      text: "TechPower_label",
    },
  };

  initializeTierBonus(tierBonus, bonusConfigs.weapon);

  document.addEventListener("mouseover", (e) => {
    const tier = e.target.closest(".tier");
    if (!tier || tier === activeTierBonus?.tier) return;

    const currentTab = document.querySelector(".shop-tab button.active")?.dataset.tab;
    if (!currentTab) return;

    const tierLevel = parseInt(tier.className.match(/t(\d+)/)?.[1] || "0") - 1;
    if (tierLevel < 0) return;

    const config = bonusConfigs[currentTab];
    if (!config) return;

    updateTierBonusContent(tierBonus, config, tierLevel);
    showTierBonus(tierBonus, tier);
    activeTierBonus = { tier, tierBonus };
  });

  document.addEventListener("mouseout", (e) => {
    if (!e.target.closest(".tier") && !e.relatedTarget?.closest(".tier")) {
      hideTierBonus(tierBonus);
      activeTierBonus = null;
    }
  });

  document.addEventListener(
    "scroll",
    () => {
      if (activeTierBonus) {
        showTierBonus(activeTierBonus.tierBonus, activeTierBonus.tier);
      }
    },
    true
  );
}

function initializeTierBonus(tierBonus, config) {
  tierBonus.querySelector(".tier-bonus strong").textContent = config.values[0];
  tierBonus.querySelector(".tier-bonus img").src = config.icon;
  tierBonus.querySelector(".tier-bonus span").setAttribute("data-text", config.text);
}

function updateTierBonusContent(tierBonus, config, tierLevel) {
  tierBonus.querySelector(".tier-bonus strong").textContent = config.values[tierLevel];
  tierBonus.querySelector(".tier-bonus img").src = config.icon;
  tierBonus.querySelector(".tier-bonus span").setAttribute("data-text", config.text);
}

function showTierBonus(tierBonus, tier) {
  tierBonus.style.display = "block";
  const tierRect = tier.getBoundingClientRect();
  const tierBonusRect = tierBonus.getBoundingClientRect();

  const left = Math.max(0, tierRect.left - tierBonusRect.width);
  const top = Math.max(0, tierRect.top + (tierRect.height - tierBonusRect.height) / 2);

  tierBonus.style.left = `${left + window.scrollX}px`;
  tierBonus.style.top = `${top + window.scrollY}px`;
}

function hideTierBonus(tierBonus) {
  tierBonus.style.display = "none";
}
