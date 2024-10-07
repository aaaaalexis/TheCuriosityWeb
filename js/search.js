export function initSearch(state) {
  const { searchInput } = state.elements;
  searchInput.dataset.originalPlaceholder = searchInput.placeholder;
  searchInput.addEventListener("input", () => {
    state.currentSearchQuery = searchInput.value.toLowerCase().trim();
    sessionStorage.setItem("searchQuery", state.currentSearchQuery);
    filterContent(document.querySelector(".shop-content.active"), state);
  });
}

export function filterContent(container, state) {
  if (!container) return;

  container.querySelectorAll(".tier").forEach((tier) => {
    let hasMatch = false;
    tier.querySelectorAll(".ability").forEach((ability) => {
      const label = ability.querySelector(".ability-name");
      const text = label?.dataset.text;

      // Check if we have translations for this ability
      const abilityData = state.data[text];

      // If there's no search query, show everything
      // Otherwise, check if any translation includes the search query
      const matches = !state.currentSearchQuery || (abilityData && Object.values(abilityData).some((name) => name.toLowerCase().includes(state.currentSearchQuery)));

      ability.style.display = matches ? "" : "none";
      hasMatch = hasMatch || matches;
    });

    // Only show tiers that have matching abilities
    tier.style.display = hasMatch ? "" : "none";
  });
}
