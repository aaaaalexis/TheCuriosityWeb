const GITHUB_API = "https://api.github.com/repos/SteamDatabase/GameTracking-Deadlock/contents";
const RAW_CONTENT_BASE = "https://raw.githubusercontent.com/SteamDatabase/GameTracking-Deadlock/master";
const LOCALIZATION_PATH = "/game/citadel/resource/localization";

// Cache for storing decoded file contents
let fileCache = new Map();

export async function fetchLocalization() {
  try {
    const paths = {
      gc: `${LOCALIZATION_PATH}/citadel_gc`,
      main: `${LOCALIZATION_PATH}/citadel_main`,
      attributes: `${LOCALIZATION_PATH}/citadel_attributes`,
    };

    // First, fetch the directory structure (this only counts as one API call)
    const dirStructure = await fetchDirectoryStructure(paths);

    const data = {
      gc: await processDirectory(dirStructure.gc, "upgrade_"),
      main: await processDirectory(dirStructure.main, null, ["CitadelShopSearch", "CitadelCategoryWeapon", "CitadelCategoryArmor", "CitadelCategoryTech", "BrowseItems_Title", "BrowseItems_Desc", "item_info_active", "item_info_new"]),
      attributes: await processDirectory(dirStructure.attributes, null, ["WeaponPower_label", "ArmorPower_label", "TechPower_label"]),
    };

    return data;
  } catch (error) {
    console.error("Error fetching localization:", error);
    throw error;
  }
}

async function fetchDirectoryStructure(paths) {
  const structure = {};

  try {
    // Single API call to get all directory contents
    const response = await fetch(`${GITHUB_API}${LOCALIZATION_PATH}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (!response.ok) throw new Error(`Failed to fetch directory: ${response.statusText}`);

    const allDirs = await response.json();

    // Filter and organize the directory structure
    for (const [key, path] of Object.entries(paths)) {
      const dirName = path.split("/").pop();
      const dir = allDirs.find((d) => d.name === dirName);
      if (dir) {
        structure[key] = {
          path: path,
          files: dir.name, // We'll use this to construct raw URLs later
        };
      }
    }

    return structure;
  } catch (error) {
    console.error("Error fetching directory structure:", error);
    throw error;
  }
}

async function processDirectory(dirInfo, prefix = null, specificKeys = null) {
  const translations = {};

  try {
    // Construct the raw content URL for the directory listing
    const dirListUrl = `${RAW_CONTENT_BASE}${dirInfo.path}`;

    // Fetch all txt files in the directory
    const files = await fetch(`${GITHUB_API}${dirInfo.path}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    }).then((res) => res.json());

    const txtFiles = files.filter((file) => file.name.endsWith(".txt"));

    // Process each language file
    const langData = {};
    await Promise.all(
      txtFiles.map(async (file) => {
        const langCode = file.name.split("_").pop().split(".")[0].toLowerCase();
        const rawUrl = `${RAW_CONTENT_BASE}${dirInfo.path}/${file.name}`;
        const content = await fetchAndProcessFile(rawUrl);
        langData[langCode] = content;
      })
    );

    // Create translations object
    let keys = specificKeys;
    if (!keys) {
      const allKeys = new Set();
      Object.values(langData).forEach((data) => {
        Object.keys(data).forEach((key) => {
          if (!prefix || key.startsWith(prefix)) {
            allKeys.add(key);
          }
        });
      });
      keys = Array.from(allKeys).sort();
    }

    keys.forEach((key) => {
      const trans = {};
      Object.entries(langData).forEach(([lang, data]) => {
        if (data[key]) {
          trans[lang] = data[key];
        }
      });
      if (Object.keys(trans).length > 0) {
        translations[key] = trans;
      }
    });

    return translations;
  } catch (error) {
    console.error(`Error processing directory ${dirInfo.path}:`, error);
    throw error;
  }
}

async function fetchAndProcessFile(rawUrl) {
  if (fileCache.has(rawUrl)) {
    return fileCache.get(rawUrl);
  }

  try {
    const response = await fetch(rawUrl);

    if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

    const content = await response.text();
    const data = {};

    content.split("\n").forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith("//")) {
        const match = line.match(/"([^"]+)"\s+"([^"]+)"/);
        if (match) {
          const [, key, value] = match;
          data[key] = value;
        }
      }
    });

    fileCache.set(rawUrl, data);
    return data;
  } catch (error) {
    console.error(`Error processing file ${rawUrl}:`, error);
    throw error;
  }
}

// Clear cache when window is unloaded
window.addEventListener("unload", () => {
  fileCache.clear();
});
