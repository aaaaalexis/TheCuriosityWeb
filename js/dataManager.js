const GITHUB_API_KEY = "";
const GITHUB_REPO = "deadlock-wiki/deadbot";
const GITHUB_BRANCH = "develop";
const LOCALIZATION_PATH = "output-data/localizations";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${LOCALIZATION_PATH}?ref=${GITHUB_BRANCH}`;
const RAW_CONTENT_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${LOCALIZATION_PATH}`;

const languageCache = new Map();

export async function fetchLocalization() {
  try {
    const headers = GITHUB_API_KEY ? { "Authorization": `token ${GITHUB_API_KEY}` } : {};
    const response = await fetch(GITHUB_API_URL, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json();
    const languageFiles = files
      .filter(file => file.name.endsWith(".json"))
      .map(file => ({
        language: file.name.replace(".json", "").toLowerCase(),
        url: `${RAW_CONTENT_BASE}/${file.name}`,
      }));

    const translations = {};
    const results = await Promise.all(languageFiles.map(fetchLanguageFile));

    results.forEach(result => {
      if (!result) return;
      const { language, data } = result;
      Object.entries(data).forEach(([key, value]) => {
        if (!translations[key]) {
          translations[key] = {};
        }
        translations[key][language] = value;
      });
    });

    populateLanguageSelect(results);

    return translations;
  } catch (error) {
    console.error("Error fetching localizations:", error);
    throw error;
  }
}

async function fetchLanguageFile({ language, url }) {
  try {
    if (languageCache.has(url)) {
      return { language, data: languageCache.get(url) };
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${language} translations:`, response.statusText);
      return null;
    }

    const data = await response.json();

    if (Object.keys(data).length <= 1) {
      return null;
    }

    languageCache.set(url, data);
    return { language, data };
  } catch (error) {
    console.error(`Error processing ${language}:`, error);
    return null;
  }
}

function populateLanguageSelect(results) {
  const validLanguages = results.filter(result => result !== null).map(result => result.language);
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.innerHTML = validLanguages
      .map(lang => `<option value="${lang}">${lang.charAt(0).toUpperCase() + lang.slice(1)}</option>`)
      .join("");
  }
}

export async function loadShopItems() {
  try {
    const response = await fetch("https://assets.deadlock-api.com/v1/items?language=english");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return processShopItems(data);
  } catch (error) {
    console.error("Error loading shop items:", error);
    return [];
  }
}

function processShopItems(data) {
  return data
    .filter(item => item.type === "upgrade" && !item.disabled)
    .sort((a, b) => {
      const aIsActive = a.properties?.ability_cooldown !== 0;
      const bIsActive = b.properties?.ability_cooldown !== 0;
      if (aIsActive === bIsActive) {
        return a.name.localeCompare(b.name);
      }
      return aIsActive ? 1 : -1;
    });
}

window.addEventListener("unload", () => {
  languageCache.clear();
});
