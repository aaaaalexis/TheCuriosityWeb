export function initTierBonuss(state) {
  const tierBonus = document.querySelector(".tier-bonus");
  let activeTierBonus = null;

  // Define bonus configurations
  const bonusConfigs = {
    weapon: {
      values: ["+6%", "+10%", "+14%", "+18%"],
      icon: "images/extra/icon_damage_force.svg",
      label: "WeaponPower_label",
    },
    vitality: {
      values: ["+11%", "+14%", "+17%", "+20%"],
      icon: "images/extra/icon_fave_active.svg",
      label: "ArmorPower_label",
    },
    spirit: {
      values: ["+4", "+8", "+12", "+16"],
      icon: "images/extra/icon_spirit.svg",
      label: "TechPower_label",
    },
  };

  // Initialize tierBonus with default content (first tab, first tier)
  const firstTabConfig = bonusConfigs.weapon;
  tierBonus.querySelector(".tier-bonus strong").textContent = firstTabConfig.values[0];
  tierBonus.querySelector(".tier-bonus img").src = firstTabConfig.icon;
  tierBonus.querySelector(".tier-bonus span").setAttribute("data-original-text", firstTabConfig.label);

  document.addEventListener("mouseover", (e) => {
    const tier = e.target.closest(".tier");
    if (!tier || tier === activeTierBonus?.tier) return;

    const currentTab = document.querySelector(".shop-tab button.active")?.dataset.tab;
    if (!currentTab) return;

    const tierLevel = parseInt(tier.className.match(/t(\d+)/)?.[1] || "0") - 1;
    if (tierLevel < 0) return;

    const config = bonusConfigs[currentTab];
    if (!config) return;

    // Update tierBonus content
    tierBonus.querySelector(".tier-bonus strong").textContent = config.values[tierLevel];
    tierBonus.querySelector(".tier-bonus img").src = config.icon;
    tierBonus.querySelector(".tier-bonus span").setAttribute("data-original-text", config.label);

    showTierBonus(tierBonus, tier);
    activeTierBonus = { tier, tierBonus };
  });

  document.addEventListener("mouseout", (e) => {
    if (!e.target.closest(".tier") && !e.relatedTarget?.closest(".tier")) {
      hideTierBonus(tierBonus);
      activeTierBonus = null;
    }
  });

  // Add scroll event listener
  document.addEventListener(
    "scroll",
    (e) => {
      if (activeTierBonus) {
        showTierBonus(activeTierBonus.tierBonus, activeTierBonus.tier);
      }
    },
    true
  ); // Use capture phase to catch all scroll events
}

function showTierBonus(tierBonus, tier) {
  tierBonus.style.display = "block";
  const tierRect = tier.getBoundingClientRect();
  const tierBonusRect = tierBonus.getBoundingClientRect();

  // Calculate position relative to the viewport
  const left = Math.max(0, tierRect.left - tierBonusRect.width);
  const top = Math.max(0, tierRect.top + (tierRect.height - tierBonusRect.height) / 2);

  // Add scroll position to convert viewport coordinates to document coordinates
  tierBonus.style.left = `${left + window.scrollX}px`;
  tierBonus.style.top = `${top + window.scrollY}px`;
}

function hideTierBonus(tierBonus) {
  tierBonus.style.display = "none";
}
