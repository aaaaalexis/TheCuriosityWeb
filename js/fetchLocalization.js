const GITHUB_API_KEY = "";
const GITHUB_REPO = "deadlock-wiki/deadbot";
const GITHUB_BRANCH = "develop";
const LOCALIZATION_PATH = "output-data/localizations";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${LOCALIZATION_PATH}?ref=${GITHUB_BRANCH}`;
const RAW_CONTENT_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${LOCALIZATION_PATH}`;

// Cache for storing language data
const languageCache = new Map();

/**
 * Fetches and processes all localization data
 * @returns {Promise<Object>} Combined localization data
 */
export async function fetchLocalization() {
  try {
    // Construct headers for the API request
    const headers = {};
    if (GITHUB_API_KEY) {
      headers["Authorization"] = `token ${GITHUB_API_KEY}`;
    }

    // Get directory listing from GitHub API (single API call)
    const response = await fetch(GITHUB_API_URL, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();
    const languageFiles = files
      .filter((file) => file.name.endsWith(".json"))
      .map((file) => ({
        language: file.name.replace(".json", "").toLowerCase(),
        url: `${RAW_CONTENT_BASE}/${file.name}`,
      }));

    // Fetch all language files in parallel
    const translations = {};
    const languagePromises = languageFiles.map(async ({ language, url }) => {
      try {
        // Use cache if available
        if (languageCache.has(url)) {
          return { language, data: languageCache.get(url) };
        }

        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch ${language} translations:`, response.statusText);
          return null;
        }

        const data = await response.json();

        // Skip languages with only one translation
        if (Object.keys(data).length <= 1) {
          return null;
        }

        // Cache the data
        languageCache.set(url, data);
        return { language, data };
      } catch (error) {
        console.error(`Error processing ${language}:`, error);
        return null;
      }
    });

    // Wait for all fetches to complete
    const results = await Promise.all(languagePromises);

    // Process results and build translations object
    results.forEach((result) => {
      if (!result) return;

      const { language, data } = result;

      // Add each translation to the combined object
      Object.entries(data).forEach(([key, value]) => {
        if (!translations[key]) {
          translations[key] = {};
        }
        translations[key][language] = value;
      });
    });

    // Populate language select
    const validLanguages = results.filter((result) => result !== null).map((result) => result.language);

    const languageSelect = document.getElementById("language-select");
    if (languageSelect) {
      languageSelect.innerHTML = validLanguages.map((lang) => `<option value="${lang}">${lang.charAt(0).toUpperCase() + lang.slice(1)}</option>`).join("");
    }

    return translations;
  } catch (error) {
    console.error("Error fetching localizations:", error);
    throw error;
  }
}

// Clear cache when window is unloaded
window.addEventListener("unload", () => {
  languageCache.clear();
});
