// scripts/tierBonusGenerator.js
function generateTierBonuses() {
  const tierBonuses = [
    { type: "weapon", values: ["+6%", "+10%", "+14%", "+18%"], icon: "images/extra/icon_damage_force.svg", label: "Weapon Damage", dataOriginalText: "WeaponPower_label" },
    { type: "vitality", values: ["+11%", "+14%", "+17%", "+20%"], icon: "images/extra/icon_fave_active.svg", label: "Base Health", dataOriginalText: "ArmorPower_label" },
    { type: "spirit", values: ["+4", "+8", "+12", "+16"], icon: "images/extra/icon_spirit.svg", label: "Spirit Power", dataOriginalText: "TechPower_label" },
  ];
  const container = document.querySelector(".tier-bonus-container");
  tierBonuses.forEach(({ type, values, icon, label, dataOriginalText }) => {
    values.forEach((value, index) => {
      container.innerHTML += `
          <div class="tier-bonus ${type}-t${index + 1}">
            <strong>${value}</strong>
            <img src="${icon}" />
            <br />
            <span data-original-text="${dataOriginalText}">${label}</span>
          </div>
        `;
    });
  });
}

document.addEventListener("DOMContentLoaded", generateTierBonuses);
