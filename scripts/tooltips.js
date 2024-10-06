function setupTierTooltips(state) {
  let currentTier = null;
  const tooltips = document.querySelectorAll(".tier-bonus");

  // Store original tooltip text
  tooltips.forEach((tooltip) => {
    const span = tooltip.querySelector("span");
    if (span) {
      span.dataset.originalText = span.textContent;
    }
  });

  // Event listeners
  document.addEventListener("mouseover", (e) => {
    const tier = e.target.closest(".tier");
    if (tier && tier !== currentTier) {
      showTooltip(tier, tooltips, state);
    }
  });

  document.addEventListener("mouseout", (e) => {
    const tier = e.target.closest(".tier");
    const relatedTarget = e.relatedTarget?.closest(".tier");
    if (tier && !relatedTarget) {
      hideTooltips(tooltips);
      currentTier = null;
    }
  });

  // Handle scroll and resize
  window.addEventListener(
    "scroll",
    () => {
      if (currentTier) {
        updateTooltipForTier(currentTier, tooltips);
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    if (currentTier) {
      updateTooltipForTier(currentTier, tooltips);
    }
  });
}

function getActiveTab() {
  const activeTabButton = document.querySelector(".shop-nav button.active");
  return activeTabButton ? activeTabButton.dataset.tab : null;
}

function showTooltip(tier, tooltips, state) {
  // Hide all tooltips first
  hideTooltips(tooltips);

  // Find matching tooltip
  const tierClasses = Array.from(tier.classList).filter((className) => /^(weapon|vitality|spirit)/.test(className));

  if (tierClasses.length === 0) return;

  const matchingTooltip = document.querySelector(`.tier-bonus.${tierClasses[0]}`);
  if (!matchingTooltip) return;

  // Update tooltip text
  const lang = document.getElementById("language-select").value;
  const tooltipSpan = matchingTooltip.querySelector("span");
  if (tooltipSpan) {
    const type = tierClasses[0].replace(/t[0-9]+$/, "");
    tooltipSpan.textContent = state.data.main?.tierBonus?.[type]?.[lang] || tooltipSpan.dataset.originalText;
  }

  // Set data-tab attribute based on the active tab
  const activeTab = getActiveTab();
  if (activeTab) {
    matchingTooltip.setAttribute("data-tab", activeTab);
  }

  matchingTooltip.style.display = "block";
  updateTooltipPosition(tier, matchingTooltip);
}

function hideTooltips(tooltips) {
  tooltips.forEach((tooltip) => (tooltip.style.display = "none"));
}

function updateTooltipPosition(tier, tooltip) {
  const tierRect = tier.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  const left = tierRect.left - tooltipRect.width;
  const top = tierRect.top + (tierRect.height - tooltipRect.height) / 2;

  tooltip.style.left = `${Math.max(0, left)}px`;
  tooltip.style.top = `${Math.max(0, top)}px`;
}

function updateTooltipForTier(tier, tooltips) {
  const tierClasses = Array.from(tier.classList).filter((className) => /^(weapon|vitality|spirit)/.test(className));

  const matchingTooltip = document.querySelector(`.tier-bonus.${tierClasses[0]}`);
  if (matchingTooltip) {
    updateTooltipPosition(tier, matchingTooltip);
  }
}

export { setupTierTooltips };
