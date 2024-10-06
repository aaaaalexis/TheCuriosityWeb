function initializeSearch(state) {
  const { searchInput } = state;

  // Store original placeholder
  searchInput.dataset.originalPlaceholder = searchInput.placeholder;

  // Add search listener
  searchInput.addEventListener("input", () => {
    state.currentSearchQuery = searchInput.value.toLowerCase().trim();
    // Save search query to session storage
    sessionStorage.setItem("searchQuery", state.currentSearchQuery);
    filterContent(document.querySelector(".shop-content.active"), state);
  });
}

function updateSearchPlaceholder(state) {
  const lang = state.languageSelect.value;
  state.searchInput.placeholder = state.data.main?.CitadelShopSearch?.[lang] || state.searchInput.dataset.originalPlaceholder;
}

function filterContent(container, state) {
  if (!container) return;

  const gc = state.data.gc;

  container.querySelectorAll(".tier").forEach((tier) => {
    let hasMatch = false;

    tier.querySelectorAll(".ability").forEach((ability) => {
      const label = ability.querySelector(".label");
      const originalText = label?.dataset.originalText;
      const abilityData = gc?.[originalText];

      const matches = !state.currentSearchQuery || (abilityData && Object.values(abilityData).some((name) => name.toLowerCase().includes(state.currentSearchQuery)));

      ability.style.display = matches ? "" : "none";
      hasMatch = hasMatch || matches;
    });

    tier.style.display = hasMatch ? "" : "none";
  });
}

export { initializeSearch, updateSearchPlaceholder, filterContent };
