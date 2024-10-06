// scripts/tierBonusGenerator.js
function generateTierBonuses() {
  const tierBonuses = [
    { type: "weapon", values: ["+6%", "+10%", "+14%", "+18%"], icon: "images/extra/icon_damage_force.svg", label: "Weapon Damage" },
    { type: "vitality", values: ["+11%", "+14%", "+17%", "+20%"], icon: "images/extra/icon_fave_active.svg", label: "Base Health" },
    { type: "spirit", values: ["+4", "+8", "+12", "+16"], icon: "images/extra/icon_spirit.svg", label: "Spirit Power" },
  ];
  const container = document.querySelector(".tier-bonus-container");
  tierBonuses.forEach(({ type, values, icon, label }) => {
    values.forEach((value, index) => {
      container.innerHTML += `
          <div class="tier-bonus ${type}-t${index + 1}">
            <strong>${value}</strong>
            <img src="${icon}" />
            <br />
            <span>${label}</span>
          </div>
        `;
    });
  });
}

document.addEventListener("DOMContentLoaded", generateTierBonuses);
