import { getTranslation, updateTranslations } from "./i18n.js";

export function initTooltips(state) {
  generateTierBonuses(state);
  translateTooltips(state);

  const tooltips = document.querySelectorAll(".tier-bonus");
  let currentTier = null;
  let tooltipTimeout = null;

  document.addEventListener("mouseover", (e) => {
    const tier = e.target.closest(".tier");
    if (tier && tier !== currentTier) {
      clearTimeout(tooltipTimeout);
      showTooltip(tier, tooltips, state);
      currentTier = tier;
    }
  });

  document.addEventListener("mouseout", (e) => {
    const tier = e.target.closest(".tier");
    if (!tier) return;

    const relatedTarget = e.relatedTarget;

    if (!relatedTarget?.closest(".tier")) {
      tooltipTimeout = setTimeout(() => {
        hideTooltips(tooltips);
        currentTier = null;
      }, 50);
    }
  });

  document.querySelector(".tier-bonus-container")?.addEventListener("mouseleave", () => {
    hideTooltips(tooltips);
    currentTier = null;
  });
}

function generateTierBonuses(state) {
  if (!state.elements.tierBonusContainer) {
    console.error("Tier bonus container not found");
    return;
  }

  const tierBonuses = [
    {
      type: "weapon",
      values: ["+6%", "+10%", "+14%", "+18%"],
      icon: "images/extra/icon_damage_force.svg",
      dataOriginalText: "WeaponPower_label",
    },
    {
      type: "vitality",
      values: ["+11%", "+14%", "+17%", "+20%"],
      icon: "images/extra/icon_fave_active.svg",
      dataOriginalText: "ArmorPower_label",
    },
    {
      type: "spirit",
      values: ["+4", "+8", "+12", "+16"],
      icon: "images/extra/icon_spirit.svg",
      dataOriginalText: "TechPower_label",
    },
  ];

  const html = tierBonuses
    .flatMap(({ type, values, icon, dataOriginalText }) =>
      values.map(
        (value, index) => `
          <div class="tier-bonus ${type}-t${index + 1}">
            <strong>${value}</strong>
            <img src="${icon}" alt="${type} icon" />
            <br />
            <span data-original-text="${dataOriginalText}">${dataOriginalText}</span>
          </div>
        `
      )
    )
    .join("");

  state.elements.tierBonusContainer.innerHTML = html;
}

function translateTooltips(state) {
  const tooltips = document.querySelectorAll(".tier-bonus span[data-original-text]");
  const lang = state.elements.languageSelect.value;

  tooltips.forEach((span) => {
    const key = span.getAttribute("data-original-text");
    const translation = getTranslation(key, lang, state.data.gc, state.data.main, state.data.attributes);

    if (translation) {
      span.textContent = translation;
    } else {
      console.warn(`Translation not found for ${key} in ${lang}`);
    }
  });
}

function showTooltip(tier, tooltips, state) {
  try {
    hideTooltips(tooltips);
    const tierClass = Array.from(tier.classList).find((className) => /^(weapon|vitality|spirit)/.test(className));
    if (!tierClass) return;

    const matchingTooltip = document.querySelector(`.tier-bonus.${tierClass}`);
    if (!matchingTooltip) return;

    // Update translations before showing
    translateTooltips(state);

    matchingTooltip.style.display = "block";
    updateTooltipPosition(tier, matchingTooltip);
  } catch (error) {
    console.error("Error showing tooltip:", error);
    hideTooltips(tooltips);
  }
}

function hideTooltips(tooltips) {
  if (!tooltips) return;
  tooltips.forEach((tooltip) => {
    if (tooltip && tooltip.style) {
      tooltip.style.display = "none";
    }
  });
}

function updateTooltipPosition(tier, tooltip) {
  const tierRect = tier.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  tooltip.style.left = `${Math.max(0, tierRect.left - tooltipRect.width)}px`;
  tooltip.style.top = `${Math.max(0, tierRect.top + (tierRect.height - tooltipRect.height) / 2)}px`;
}
