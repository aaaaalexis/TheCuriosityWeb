// scripts/languageSelector.js
document.addEventListener("DOMContentLoaded", function () {
  // Fetch the JSON data
  fetch("scripts/data.json")
    .then((response) => response.json())
    .then((data) => {
      // Function to extract unique language keys
      function extractLanguages(obj) {
        const languages = new Set();

        function recurse(obj) {
          for (const key in obj) {
            if (typeof obj[key] === "object" && obj[key] !== null) {
              recurse(obj[key]);
            } else if (typeof obj[key] === "string") {
              languages.add(key);
            }
          }
        }

        recurse(obj);
        return Array.from(languages);
      }

      // Extract unique language keys
      const languages = extractLanguages(data.gc);

      // Get the select element
      const selectElement = document.getElementById("language-select");

      // Add the default "English" option
      const defaultOption = document.createElement("option");
      defaultOption.value = "english";
      defaultOption.textContent = "English";
      selectElement.appendChild(defaultOption);

      // Populate the select element with other language options
      languages.forEach((language) => {
        if (language.toLowerCase() !== "english") {
          const option = document.createElement("option");
          option.value = language;
          option.textContent = language.charAt(0).toUpperCase() + language.slice(1); // Capitalize the first letter
          selectElement.appendChild(option);
        }
      });
    })
    .catch((error) => console.error("Error loading JSON data:", error));
});
