export function initTooltips(state) {
  const tooltipHTML = generateStaticTooltipHTML();
  state.elements.tierBonusContainer.innerHTML = tooltipHTML;

  const tooltips = document.querySelectorAll(".tier-bonus");
  let activeTooltip = null;

  document.addEventListener("mouseover", (e) => {
    const tier = e.target.closest(".tier");
    if (!tier || tier === activeTooltip?.tier) return;

    hideTooltips(tooltips);
    const type = getTierType(tier);
    if (!type) return;

    const tooltip = document.querySelector(`.tier-bonus.${type}`);
    if (!tooltip) return;

    showTooltip(tooltip, tier);
    activeTooltip = { tier, tooltip };
  });

  document.addEventListener("mouseout", (e) => {
    if (!e.target.closest(".tier") && !e.relatedTarget?.closest(".tier")) {
      hideTooltips(tooltips);
      activeTooltip = null;
    }
  });
}

function generateStaticTooltipHTML() {
  const bonuses = [
    { type: "weapon", values: ["+6%", "+10%", "+14%", "+18%"], icon: "icon_damage_force.svg", label: "WeaponPower_label" },
    { type: "vitality", values: ["+11%", "+14%", "+17%", "+20%"], icon: "icon_fave_active.svg", label: "ArmorPower_label" },
    { type: "spirit", values: ["+4", "+8", "+12", "+16"], icon: "icon_spirit.svg", label: "TechPower_label" },
  ];

  return bonuses
    .map(({ type, values, icon, label }) =>
      values
        .map(
          (value, i) => `
      <div class="tier-bonus ${type}-t${i + 1}">
        <strong>${value}</strong>
        <img src="images/extra/${icon}" alt="${type} icon" />
        <br />
        <span data-original-text="${label}">${label}</span>
      </div>
    `
        )
        .join("")
    )
    .join("");
}

function getTierType(tier) {
  return Array.from(tier.classList).find((c) => /^(weapon|vitality|spirit)/.test(c));
}

function showTooltip(tooltip, tier) {
  tooltip.style.display = "block";
  const tierRect = tier.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  tooltip.style.left = `${Math.max(0, tierRect.left - tooltipRect.width)}px`;
  tooltip.style.top = `${Math.max(0, tierRect.top + (tierRect.height - tooltipRect.height) / 2)}px`;
}

function hideTooltips(tooltips) {
  tooltips.forEach((tooltip) => (tooltip.style.display = "none"));
}
